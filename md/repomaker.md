# 侯爷の应用分享

>更新于 2022.1.28 00:00

## 0. 折腾起因

1. 国内应用市场的各种混乱 

    >包括并不限于 *开屏广告* *一键推荐* *广告推送*

2. 应付性的适老化

    国产应用嘴上说着要做适老化，简化老人用机成本，然后却在应用市场这个关键入口却没用任何作为。脑子里却满满的全都是推广、转化、拉新、KPI....

    >PS1: 点名批评 `高德地图` 适老化！！做的就是一坨啥？ 在原地图界面上面覆盖一层没导航没搜索的大图标网页地图就叫是适老化了？？？

    >PS2: 同时也赞扬一下 `应用宝` 是目前我尝试过的国产应用市场里算是比较克制的了

3. 安装权限的白名单

    国内Android系统内置应用程序的安装权限的白名单  （即在不登录账号安装应用 ）
    >PS: 目前仅测试了 realme 系统不登录 `欢太` 账号时，使用`Chrome浏览器` `UC浏览器` `自带文件浏览器` 等，可直接安装

4. 天下苦国产应用久矣

    每个应用都是开屏广告，广告推送，悄悄更新，还有一系列的骚操作，只能借助Play商店已审核的应用，普通人却没 Google 账号。

基于以上原因所以就研究了一下 `F-Driod` 全套开源框架,是一整套从本地应用市场到线上应用更新的完整流程

## 1. 快速食用方法

    下载`FD应用市场` 安装、运行、刷新

>FD应用市场是一个伪装成UC浏览器的小巧应用市场

<font color=orange>**⚠️ 注意**</font>与已安装的UC浏览器签名冲突

![FD应用市场](https://cdl.zhzhwcn.com/download.png) 或
![FD应用市场](https://cdl.zhzhwcn.com/houfukude/repo/icons-240/com.UCMobile.5000.png)
[点击下载地址](https://cdl.zhzhwcn.com/houfukude/repo/fake-UCMobile-release.apk)

<font color=green>**ℹ️提示**</font>
个人收藏记录向 play版 希望广告少点 尽量不会添加破解版 

    已收录应用数 : 42

只收录了部分个人在使用或者推荐的应用

大部分来源于手机导出以及 `apkmirror` 

>PS: 手机导出的应用多少有一些问题,这里只是演示和个人喜好的折腾

## 3. 直接看看

<font color=green>**ℹ️提示**</font> Repomaker 制作的网页端不提供下载

>https://cdl.zhzhwcn.com/houfukude/repo/

## 4. 推荐与反馈

>https://t.me/free_apk_share

## 5. 搭建流程(待完善)

`目前记录一下,在配置过程中我踩过的坑`

准备一台远端存储服务器,并配置域名与HTTPS

>Repomaker 自动生成是 HTTPS 下载配置 其中 HTTPS 的 `ssl_certificate` 需要用 `fullchain.cer` 否则应用市场无法拉取源

安装 [Repomaker](https://gitlab.com/fdroid/repomaker)

>Repomaker 只是一个解析apk的工具建议本地安装,然后配置远程 SSH Storage

>理论上,用 `pip` 或者 `flatpak` 安装也是可以的,但是我只在 x86 平台上成功了 Docker 方案

在需要安装的设备上搭建 Docker 环境
```
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh --mirror Aliyun
```

建立 docker 用户组
```
sudo groupadd docker
sudo usermod -aG docker $USER
```

启动 Docker
```
sudo systemctl enable docker
sudo systemctl start docker
```

测试 Docker
```
$ docker run --rm hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
2db29710123e: Pull complete
Digest: sha256:507ecde44b8eb741278274653120c2bf793b174c06ff4eaa672b713b3263477b
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/

```

安装 `docker-compose`
```
sudo apt install python3-pip
pip install docker-compose
```

下载 `docker-compose.yml` 拉取镜像
```
wget https://gitlab.com/fdroid/repomaker/-/raw/master/docker/docker-compose.yml
```

配置 `.env` 环境
```
wget https://gitlab.com/fdroid/repomaker/-/raw/master/docker/.env
```

>设置数据库身份验证，或使用禁用它 `POSTGRES_HOST_AUTH_METHOD=trust`

>重新配置 `REPOMAKER_SECRET_KEY`

```
echo "REPOMAKER_SECRET_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)"
```

拉取镜像并运行(这个拉取很慢)
```
docker-compose up
```

打开页面 初始化 Repomaker

配置 SSH Storage

>第一次配置的时候 需要把生成的SSH KEY 写入到 `.ssh/authorized_keys`

配置好的界面如下

![photo_2022-01-28_03-26-43.jpg](https://s2.loli.net/2022/01/28/Jv3dEMOi9t5Chsx.jpg)

>最后的 `URL` 与 `Path` 在远端服务器应该对应,这里需要在远端存储服务器进行配置

我这里使用的是 nginx

```
server {
    listen 443 ssl;
    #ssl on;
    ssl_certificate /root/.acme.sh/example.com/fullchain.cer;
    ssl_certificate_key /root/.acme.sh/example.com/example.com.key;

    server_name example.com;
    location / {
        root /var/www/html;
    }
}
```
>最后的一个 Primary Storage 一定要勾选,这样Repomaker 关掉也不影响下载

上传应用

填写应用描述

等待同步

>Repomaker Docker 内置的 Apache 有一个[BUG](https://gitlab.com/fdroid/repomaker/-/issues/229)。每次 syncthing 同步后，大于 2.5M 的文件没有读取权限。我这里选择每次同步完成后手动设置权限。

```shell
sudo chmod 644 /var/www/html/houfukude/repo/*.apk
```

下载安装 [F-Droid](https://f-droid.org/)

>如果不像我这样折腾可以直接用,但是目测 `F-Droid` 是没有国产魔改系统的`安装权限的白名单` 所以我魔改汉化了 `Foxy-Droid` 就是前面看到的 `FD应用市场`

把配置好的 repo 地址与 fingerprint 填入源管理,接着拉取源

`https://cdl.zhzhwcn.com/houfukude/repo/?fingerprint=22F7068351E04776FAFFD0DD70EC5821898B92CFA8862C0F30CD3D4A092AFBA3`

复制类似上面链接，打开 `F-Droid` 或者支持的应用应该就可以自动添加了
