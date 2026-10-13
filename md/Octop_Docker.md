# octop 自建踩坑实录：官方镜像改造成真能用的样子

> 更新于 2026.10.13 22:50

> 环境：NUC 小主机 / Debian 系宿主 / Docker + Compose

> 对象：octop v1.0.2b7（腾讯云开源的 Agent 平台）官方镜像 `ghcr.io/tencentcloud/octop:latest`
> 核对时间：2026-10-13（现测 `:latest` 就是 v1.0.2b7，构建于 2026-10-12）

经过国庆假期，我终于把 octop 自建跑起来了。

根据我的研究发现，目前官方镜像存在以下问题：

1. **权限**：容器内数据目录 `/data` 是 `root:root 755`，对于非 root 的用户十分不友好；
2. **工具链**：运行时 `apt-get install` 用不了 —— 非 root 写不了 `/var/lib/apt/lists`，包索引也被构建期的 `rm -rf` 清空了；而 `node` / `wget` / `zip` / `ssh` 这类二进制，镜像里根本没有；
3. **挂载**：官方说明的挂载是 `/data/.octop`，如果改了权限只挂载 `/data/.octop` 的话，会导致 `/data/.cache` 等目录权限不对，很多东西都运行不起来。

## 先说结果

### 1. Dockerfile

我的 octop 自建镜像是 `houfukude/octop:local-1000`，基于官方镜像自建派生镜像，一共三个部分（截至 v1.0.2b7，这三件事官方镜像一件都还没补）：

```Dockerfile

# octop 本地派生镜像
#
# 为什么要派生：官方镜像里
#   1) 没有与宿主机 uid 对应的用户（容器内 ls 会显示 UNKNOWN）
#   2) /app/.venv 属 root，普通用户装不了 / 升不了包
#   3) 缺 jq / ffmpeg / ssh 等系统工具，而 apt 在运行时用不了（无 root、无包索引）
FROM ghcr.io/tencentcloud/octop:latest

# 与宿主机保持同一 UID/GID：bind mount 走的是数字，不是用户名
ARG UID=1000
ARG GID=1000

USER root

# 1) 建一个同 UID 的普通用户；名字只影响 ls 显示，权限语义全在 uid:gid
#    chown 只动 2 个 inode（≈28 KB）；整树 chown 会因 overlayfs copy-up 让镜像胖 1.5 G
RUN set -eu; \
    if ! getent group "$GID" >/dev/null; then groupadd -g "$GID" appuser; fi; \
    if ! getent passwd "$UID" >/dev/null; then useradd -u "$UID" -g "$GID" -m -s /bin/bash appuser; fi; \
    chown "$UID:$GID" /app/.venv/lib/python3.12/site-packages /app/.venv/bin

# 2) 系统工具 + cv2 运行库
#    libGL / libglib / libxcb 三缺一，import cv2 就直接报错（OCR 那条路跟着炸）
#    Debian 13 (trixie) 里 glib 的包名是 libglib2.0-0t64
#    ➡️ 以后要加系统工具，就加进这条列表：运行时装不上
RUN apt-get update && apt-get install -y --no-install-recommends \
      jq unzip ffmpeg openssh-client libgl1 libglib2.0-0t64 libxcb1 \
 && rm -rf /var/lib/apt/lists/*

# 3) 官方把浏览器缓存钉在 /root/.cache（0700 root:root），非 root 读不到
ENV PLAYWRIGHT_BROWSERS_PATH=/data/.octop/ms-playwright

USER ${UID}:${GID}

```

### 2. build.sh

快速构建脚本 `build.sh` 如下：

```bash
#!/usr/bin/env bash
# 构建 octop 派生镜像，自动带入当前用户的用户名 / UID / GID
set -euo pipefail
cd "$(dirname "$0")"

docker build --pull \
  --build-arg UID="$(id -u)" \
  --build-arg GID="$(id -g)" \
  -t "$(id -un)/octop:local-$(id -u)" .

# .env 不存在时才生成（绝不覆盖你改过的）。
# 账号名也一并写进去：compose 的 ${USER} 是从 .env / 宿主环境取值的，而 systemd、
# cron、容器里跑常常没有 USER —— 一旦取空，镜像名会变成 "/octop:local-1000"，直接起不来。
if [ ! -f .env ]; then
  printf 'USER=%s\nHOST_UID=%s\nHOST_GID=%s\n' "$(id -un)" "$(id -u)" "$(id -g)" > .env
  echo "已生成 .env：USER=$(id -un)  HOST_UID=$(id -u)  HOST_GID=$(id -g)"
fi

echo
echo "构建完成：$(id -un)/octop:local-$(id -u)"
echo "下一步：mkdir -p data  →  docker compose up -d"
```

### 3. docker-compose.yml

最后是 `docker-compose.yml`：

```yml
services:
    octop:
        # 镜像由 build.sh 产出：<账号>/octop:local-<UID>（例：houfukude/octop:local-1000）
        #   · 必须带 namespace —— 无 `/` 的名字会被补成 docker.io/library/...，永远 push 不上去
        #   · <账号> 取 .env 里的 USER（build.sh 写的），别依赖 shell 的 $USER
        #   · tag 末尾的 <UID> 由 HOST_UID 插值，不会和下面的 user: 打架
        image: ${USER}/octop:local-${HOST_UID:-1000}
        container_name: octop

        # 与 build.sh 的 --build-arg 保持一致（同一份 HOST_UID 也用在镜像名里）
        user: '${HOST_UID:-1000}:${HOST_GID:-1000}'

        restart: unless-stopped
        ports:
            - '8088:8088'
        volumes:
            # 只挂 /data（数据）。永远不要挂 /app（代码 + 依赖必须跟镜像版本走）
            - './data:/data'
        environment:
            HOME: /data
            OCTOP_BIND_HOST: 0.0.0.0
            OCTOP_PORT: 8088
            OCTOP_ADMIN_USERNAME: admin
            OCTOP_LOG_LEVEL: info
            TZ: Asia/Shanghai
        healthcheck:
            test: ['CMD', 'curl', '-fsS', 'http://127.0.0.1:8088/api/health']
            interval: 30s
            timeout: 5s
            retries: 3
            start_period: 60s

```

需要说明的是 `.env` 里的这三个变量：`USER` / `HOST_UID` / `HOST_GID`。

- `HOST_UID` / `HOST_GID`：同时喂给 compose 的 `user:` 和镜像名里的 `<UID>`；
- `USER`：只干一件事 —— 拼出镜像名的账号段。它由 `build.sh` 写进 `.env`，**不靠 shell 环境里那个 `$USER`** —— systemd 单元、cron、容器里执行 compose 时那个变量经常不存在，取空就会拼出 `/octop:local-1000` 这种非法引用，直接起不来。

而我的构建环境 Debian 里，`id -un` 是 houfukude，`id -u` 是 1000，`id -g` 是 1000。

拿去用的时候，记得适当的根据自己的情况做调整。

---

## 折腾过程

### 第一轮：首启就崩 —— 权限

**现象**：官方镜像 + `user: "1000:1000"` + 只挂数据目录 → 容器起不来。

**原因链**：

- 镜像内 `/data` 是 `root:root 755`（2026-10-13 复核：镜像最后一层里 `data/` 和 `data/.octop/` 仍都是 `drwxr-xr-x 0/0`）；
- 官方 Dockerfile 里有 `RUN mkdir -p /data/.octop`，所以 `/data/.octop` 在镜像里**已经存在**（属 root）—— 这意味着 entrypoint 里那句 `mkdir -p "$OCTOP_HOME"` 不会报错，**炸的是后面真正写文件的那一步**；
- entrypoint 的首启分支（触发条件 `$OCTOP_HOME/octop.db` 不存在）往下走哪条路，取决于**有没有设 `OCTOP_DEFAULT_PASSWORD`** —— 本文的 compose 没设，走的是第二条：
  - **设了合格密码** → 跑 `octop init`，它要 `mkdir /data/.octop/plugins` → 以 uid 1000 身份 → **EACCES**；
  - **没设密码**（默认）→ 直接去 **Web 设置向导**，`octop_seed_wizard_password()` 往 `/data/.octop/octop-login.txt` 写向导口令 → 重定向失败 `Permission denied` → `set -e` 退出；
- 两条路结局一样：容器起不来，报错都落在「`/data` 不可写」上。

这也解释了为什么很多人第一反应是“那就用 root 跑” —— 以 root 跑确实能起来，代价在后面的「第二轮」。

#### 坑 1：这一版的报错话术，已经能自诊了
b7 的 entrypoint 把首启结果分成了几路，每路输出都不一样 —— 至少不会再把你引到错的方向：

| 情况 | 实际输出 |
|---|---|
| 没设 `OCTOP_DEFAULT_PASSWORD` | `[entrypoint] 未设置 OCTOP_DEFAULT_PASSWORD，不自动创建管理员。` |
| 设了，但没过密码策略 | `[entrypoint] OCTOP_DEFAULT_PASSWORD 未通过密码策略（<具体原因>），不自动创建管理员。` |
| 设了合格密码，`octop init` 却挂在密码策略上 | `[entrypoint] 指定的初始密码被应用拒绝，改为启动设置向导。` |
| `octop init` 挂了，且**不是**密码问题 | `[entrypoint] 初始化失败（不是密码策略问题）。若数据目录已有文件但没有 octop.db，请检查卷挂载。` + `exit 1` |

前三路都会接着走设置向导，**只有最后一路直接退出** —— 本文碰到的权限问题就落在这一路，它已经把结论写出来了：检查卷挂载。

⚠️ 但**旧版本不是这样**：1.0.2b6 及更早，这里只有一句

```text
[entrypoint] 指定的初始密码未通过应用密码策略（过弱或过于常见），改用随机密码重试 …
```

它是 `if ! octop init` 的**通用 else 分支** —— 任何失败（包括 `PermissionError`）都打印这一句。所以手里是 b7 之前的镜像，还是那句老话：**读脚本，别读话术**；而在 b7 上这句话已经搜不到了，别拿着它去排查。

#### 坑 2：你传给容器的命令，可能根本没执行
首启分支位于 `exec "$@"` **之前**。b7 里这条路径上的失败是**显式** `exit 1`（不是靠 `set -e` 兜出来的），写向导口令失败那种则确实由 `set -e` 兜住。无论哪种，脚本都没走到 `exec "$@"` ⇒ `docker run <image> <你要跑的命令>` 里的命令被吞掉。
（反过来也成立：没设密码时它只是**走向导、不退出**，你传的命令照样会执行 —— 所以别靠“有没有输出”来猜自己踩没踩到首启分支。）

所以验证派生镜像必须显式指定入口：
```bash
mkdir -p /tmp/octop-smoke && chown 1000:1000 /tmp/octop-smoke
docker run --rm -v /tmp/octop-smoke:/data --entrypoint sh \
  <image> -c 'id && octop init --yes --admin-username admin --admin-password Abcd1234efgh && echo SMOKE_OK'
rm -rf /tmp/octop-smoke
```
否则你以为在测自己的命令，其实是在测 entrypoint。

---

### 第二轮：为什么非要 uid 1000

数据是 **bind mount** 回宿主机的：容器以 root 跑 → 宿主目录里落地的全是 `root:root` 文件 → 之后宿主机上想看一眼、改一下、备份一下，全得 `sudo`。这台机器上跑着一堆自托管服务，我不想再养一个“必须 sudo 才能碰”的数据目录。

改成 `user: "1000:1000"` 后，容器内新建文件即 `1000:1000`，宿主侧免 sudo 直接读写。**代价也很直接**：需要 `apt-get` / `npm i -g` / 系统 `pip install` 的玩法，容器内全废。

#### 坑 3：报错第一步 —— `type python3; type pip3`
在这个镜像里，`/app/.venv/bin` 在 `PATH` 最前面，所以 `python3` 是 **venv** 的；但 `pip3` 是 `/usr/local/bin/pip3`，属于**系统** python3.12 的。

于是“`pip3` 装包失败、`python3 -m pip` 成功”是**正常现象**，不是玄学 —— 两者压根不是同一个解释器。顺带一提：pip 会**先把包下载完、再报权限错**，日志刷了一大屏，看起来像在干活，其实注定失败。

---

### 第三轮：派生镜像

既然 apt 一次都用不了、二进制也缺，正解是**在官方 base 上做一层派生镜像**。定稿版很短（全文见「先说结果」第 1 节），坑都在细节里：

#### 坑 4：`chown -R` 会让镜像胖 1.5 G
这是全篇最反直觉的一条：直觉上，“改个目录属主”是零成本的元数据操作，但在 overlayfs 上不是 —— **要改一个位于低层（镜像层）的文件的属主，必须先把文件复制到新层**。而 `/app/.venv` 是 1.5 G / 61,973 个文件 / 5,916 个目录。

我一开始想的就是 `chown -R 1000:1000 /app/.venv`，一构建，镜像体积直接多出一整个 venv；改成**浅 chown**（只动 `site-packages` 和 `bin` 两个目录本身）后，实测约 28 KB。**代价**：以后想覆盖/升级 base 层**已有**的包，会因为老文件仍是 root 属主而 EACCES；装**新**包不受影响。这个取舍我认了 —— 需要升级的包本来就该回派生镜像里改。

#### 坑 5：加包顺序 —— `chown` 不能抢在装包前面
`uv pip install` 以 root 身份装出来的新文件，属主还是 root；如果 `RUN chown` 写在它**前面**，那些新文件就永远漏在 chown 之外 → uid 1000 之后连 `pip uninstall` 都做不了。

当前 Dockerfile 把 `chown` 挂在第一条 RUN 的末尾，后面那条 RUN 只装系统包（不产生 Python 文件），所以现在没问题。**以后要加 `uv pip install`，记得把那条 RUN 放到 chown 之前。**

#### 坑 6：知识库起不来了 —— 缺少 `import cv2` 的依赖链，`--no-install-recommends` 砍不掉
现象是 `import cv2` → `ImportError: libxcb.so.1`（rapidocr / OCR 那条路跟着一起炸）。要补的库是 `libGL.so.1` / `libglib-2.0.so.0` / `libxcb.so.1`，来自 `libgl1` / `libglib2.0-0t64` / `libxcb1`（⚠️ trixie 里 glib 的**实际包名**是 `libglib2.0-0t64` —— 索引里搜 `libglib2.0-0` 是搜不到的，认准 `t64`）。

我一开始想用 `--no-install-recommends` 瘦身，结果**无效**，因为依赖链是：
```text
libgl1 → libglx0 → libglx-mesa0 → mesa-libgallium + libgl1-mesa-dri
```
全是硬 `Depends`，砍不掉 `libllvm19`（124 MB）+ `mesa-libgallium`（41 MB）。实测 delta **302 MB**，多装 44 个 mesa/llvm/wayland 包 —— 这是**接受的代价**，不是可优化项。

*（另一个错误念头：用 `--target` 装 `opencv-python-headless` 把它盖掉。**没用** —— `sys.path` 顺序里 venv 永远在前，同名的坏版本永远胜出。)*

---

### 第四轮：环境变量

#### 坑 7：`docker restart` 不会应用新的 compose 环境变量
`restart` 是**复用创建时的配置**；改完 compose 里的 `environment:`，必须 `up -d`（重建）才生效。我们实测过：改完 compose 只重启，pid1 的 exec env 里新变量**一个都没有**。

#### 坑 8：镜像 ENV 钉死的错值，只能从更外层覆盖
`PLAYWRIGHT_BROWSERS_PATH` 被镜像钉成 `/root/.cache/ms-playwright`，而 `/root` 是 `0700 root:root` ⇒ uid 1000 连 `x` 权限都没有 ⇒ `PermissionError`，这正是 `/api/browser/env-status` 返回 500 的根因。

应用内 env + 插件 sanitize 两层兜底也能跑，但都不是权威 —— 权威只在**镜像 ENV 层**，也就是上面 Dockerfile 第 3 段直接改掉的那处。配套的两个判断口径：
- `/proc/1/environ` 只是 **exec 时刻的快照**，看不到应用启动后 `apply_env_file()` 注入的值；
- `docker exec <容器> sh -c 'echo $VAR'` 用的是**容器 config env**，也看不到应用内变量。

**两个都不能用来判断“变量生效了没”。**

---

### 第五轮：挂载模型 —— 挂载到哪一层才是最好的？

这条我觉得是全文最该记住的：

> **数据不跟版本走 → 挂 `/data`；代码必须跟版本走 → 永远别挂 `/app`。**

`/app` 里是 `/app/src`（代码）+ `/app/.venv`（依赖），内容全部来自镜像。一旦把它挂出去：
1. 宿主目录不全 → 容器**直接起不来**；
2. 镜像升级后新代码被宿主目录盖住 → **永远静默跑旧版**（这个最难查，因为它不报错）。

“只挂 `/app/.venv`”也不成立：升级后成了“新代码 + 冻结的旧依赖” → ImportError，而且 venv 死绑 `pyvenv.cfg` 里写死的解释器路径和版本。

至于“容器里缺东西”这个原始需求 —— 挂 `/app` 一条都解决不干净，正解就是「先说结果」里的派生镜像。

### 第六轮：迁移 —— 把老数据搬进单卷模型

如果你已经照着官方 [docker-compose.yml](https://github.com/TencentCloud/Octop/blob/main/docker/docker-compose.yml) 用 Docker 跑起来了、又不想丢掉已有数据，这一节就是那条搬家路线。

**关键前提：官方 compose 只有一条挂载**（`${OCTOP_DATA:-~/.octop}:/data/.octop`），所以你要保的东西只有一份 —— 那个被挂进 `/data/.octop` 的宿主目录。它既没挂 `.cache`，也没别的挂载点。而新模型要的是「宿主 `./data` ↔ 容器 `/data`」，于是迁移就剩一句话：**把老的 octop 数据目录整个搬成 `./data/.octop`。**

顺便说明「不用单独搬 `.cache`」：派生镜像已经把 `PLAYWRIGHT_BROWSERS_PATH` 挪到 `/data/.octop/ms-playwright`（见坑 8），浏览器缓存本来就在 `.octop` 里，跟着一起走。

先决条件（这两件事没做完，搬完也起不来）：

1. 派生镜像已经构建好 —— `./build.sh` 会产出 `<账号>/octop:local-<UID>`，并顺手生成 `.env`；
2. 新的 compose 已经替换到位 —— 单条 `./data:/data`，`user: "${HOST_UID:-1000}:${HOST_GID:-1000}"`。

对照一下，就多了一层目录：

```text
老：宿主机 ~/.octop（或 $OCTOP_DATA）  →  容器 /data/.octop
新：宿主机 ./data                      →  容器 /data
                                          └── .octop/   ← 老目录整个搬到这里
```

在你的部署目录（compose 文件所在处）执行，容器必须先停：

```bash
docker stop octop

mkdir -p data
cp -a ~/.octop data/.octop           # 老数据源，见下注
sudo chown -R "$(id -u):$(id -g)" data

docker compose up -d octop
```

> **老数据源在哪**：看一眼老 compose 的 `volumes:` 那一行 —— 冒号左边就是它（默认 `~/.octop`，设过 `OCTOP_DATA` 就换成那个值）。
>
> 用 `cp` 而不是 `mv`：出问题还有退路，确认无误再删老的。
>
> 老数据在**命名卷**里的话（官方 README 方式二 `-v octop-data:/data/.octop`），先把它导出来：
> ```bash
> docker run --rm --user "$(id -u):$(id -g)" \
>   -v octop-data:/from -v "$PWD/data":/to busybox sh -c 'cp -a /from/. /to/.octop'
> ```
> 这里 `--user` 是刻意的：落地文件直接归你自己，省掉后面那次 `sudo chown`。
>
> 还有一种情况：老 compose 里的 `${OCTOP_DATA:-...}` 被你设成了 `./data`，正好和新的宿主目录撞名。那就别原地 `cp` —— 先 `mv data data.old` 腾开，再按上面步骤重建 `data`，最后确认无误才删 `data.old`。

这里每一步都有坑：

#### 坑 9：拷数据必须停容器
`/data/.octop` 是**活状态**，SQLite 开着 WAL（`octop.db` + `-wal` + `-shm`）⇒ 不停就拷 = 可能拿到不一致的快照。

#### 坑 10：老数据是 root 写的，`chown` 不能省
老容器以 root 身份跑，落地文件属主全是 `root:root`；不交还给你自己，新容器以 uid 1000 起不来。（这个 `chown -R` 和坑 4 里那个 `chown -R` 不是一回事 —— 宿主文件系统上它只改元数据，不复制数据、也不会撑大任何东西。）

#### 坑 11：目标必须是 `data/.octop`，少一层就得到一个空库
新模型把 `./data` 整个挂成 `/data`，而容器认的数据根是 `/data/.octop`（`OCTOP_HOME="${HOME}/.octop"`）。要是把老数据直接倒进 `./data/`、少了 `.octop` 这层，容器会认定「这里没有 `octop.db`」→ **初始化一个空库**。表现像是“数据全没了”，其实都还在你倒进去的那个目录里躺着，改个名就回来了。

#### 坑 12：别用 `docker cp` 往外拷
那是 dockerd（root）往宿主写、还保留容器内 uid → 落地变成 **uid 0** → 回头还得 `sudo chown` 一遍。命名卷那种情况用上面带 `--user` 的辅助容器，或者干脆用宿主侧 `cp -a`，以本人身份跑，落地产物天然就是 `1000:1000`。

#### 搬家后自查

```bash
docker inspect -f '{{.Config.User}}' octop        # 期望 1000:1000
docker inspect -f '{{.Mounts}}' octop             # 期望只有一条 -> /data
ls -ld data data/.octop/octop.db                  # 期望 1000:1000，且 db 是原有大小
```

三项都对了，再确认应用侧登录、知识库、插件数据都还在，最后才删掉老的 `~/.octop`。

> **b7 起的一个小变化**：compose 里**没设** `OCTOP_DEFAULT_PASSWORD` 时，首启不再自动建管理员，而是让你在浏览器里走一遍**设置向导**（向导口令写在 `data/.octop/octop-login.txt`）。所以迁移完第一次打开看到的是设置页、不是登录页 —— 这是正常的，不是数据没搬过去。

---
