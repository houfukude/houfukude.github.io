# 变更记录

## 2026-10-24 · 视觉重制 + 首屏性能 + 移动端/层级修复

范围：`index.html`、`autoindex.css`（整体重写）、`autoindex.js`；`md/AboutMe.md` 同步订正了站点说明。
`CNAME`、`robots.txt`、`pre-commit.py` 及其余文章未动；**新增网络请求 0 个、新增第三方依赖 0 个**。

回滚：`git checkout -- index.html autoindex.css autoindex.js`

---

### 一、性能：首屏 `<script src>` 从 14 个降到 6 个

| 改动 | 收益 |
|---|---|
| raphael / flowchart / snap.svg / underscore / js-sequence-diagrams / mermaid 六个图库移出 `index.html`，改由 `loadScriptOnce()` 按需注入 | 首屏少约 1.8MB 下载与解析 |
| APlayer 试过按需加载后**改回静态**：它依赖 CSS 与 JS 同时就绪，样式晚到会导致容器高度塔陷；只保留 `ensureAPlayer()` 做兵底 | 换掉 72KB 的收益不值得那点时序风险 |
| 触发条件：检测到 `language-flow` / `language-sequence` / `language-mermaid` 代码块、`<media>` 标签，或点击音频 | 无对应内容的文章一个字节都不下载 |
| sakana 用 `requestIdleCallback`（兜底 `setTimeout 1200ms`） | 挂件不与正文抢主线程 |
| 图片加 `loading="lazy" decoding="async"` | 长文首屏图片请求减少 |
| 滚动监听统一 `requestAnimationFrame` 节流 + `{ passive: true }` | 进度条 / 目录高亮 / 回到顶部共用一个监听，无布局抖动 |
| `marked`、`highlight.js` 前置到 `autoindex.js` 之前 | 消除「渲染时库还没就绪」的竞态 |
| 加载顺序改为 github.css → autoindex.css | 自定义样式不再依赖 `!important` 堆叠 |

没有引入 Tailwind / DaisyUI / UnoCSS / 在线字体：首屏请求是唯一硬瓶颈，塞框架会抵掉收益；mdui 1.0.1 已深度绑定 DOM（列表项由 JS 生成），换框架等于重写 `updateHTMLBody()`。视觉提升改用系统字体栈 + 字重/字距/行高，零额外请求。

### 二、结构补全（`index.html`）

| 改动 | 原因 |
|---|---|
| 补全 `<!DOCTYPE html>` / `<html lang="zh-CN">` / `<head>` / `<body>` | 原文件是片段式文档，靠浏览器容错解析 |
| 新增 `viewport`、`color-scheme`、`theme-color`、`description`、`<title>` | 原本移动端按 980px 虚拟宽度渲染，标签页标题是 URL |
| 新增 `<noscript>` 提示 | 内容全由 JS 注入，禁用 JS 时原本白屏 |

### 三、视觉（`autoindex.css` 整体重写）

| 区域 | 变化 |
|---|---|
| 设计体系 | 16 个 CSS 变量统一配色/圆角/阴影/缓动；主色青绿 `#4dd0a7`，背景径向渐变 |
| 顶栏 | 玻璃拟态 + 滚动后加深投影；标题单行省略，不挤图标 |
| 首页列表 | 标题与日期合并成卡片，hover 上浮 + 左侧强调条 |
| 正文 | 最大宽度 860px 居中、行高 1.85、锚点偏移对齐顶栏 |
| 代码块 / 表格 | 深色圆角容器、行内代码青绿胶囊；表格圆角 + 斑马纹 + 窄屏横向滚动 |
| 阅读辅助 | 顶部 3px 进度条、右下回到顶部（滚动 400px 后浮现）、目录当前章节自动标记 `toc-active` |
| 响应式 / 打印 | 768px、380px 两档；打印隐藏交互元素并切浅色 |

### 四、移动端与层级：全按 mdui 1.0.1 实测值定位

```
.mdui-overlay           2000      .mdui-drawer            5000（fixed）
.mdui-appbar-fixed      1000      .mdui-dialog            6000
drawer 隐藏位移：<600px → translateX(-290px)，600–1023.9px → translateX(-330px)
```

| 根因 | 修复 |
|---|---|
| 抽屉宽度写成 `288px` + `max-width: 86vw`。`86vw` 随视口变大，768px 下算出 660px ≫ 330px 隐藏位移，抽屉永远收不拢，露出的残片压在正文和页脚上（即用户看到的「打架」） | 按位移分档取固定宽度，**禁用 vw**：`<600px` 272px、`600–1023.9px` 312px、`≥1024px` 240px |
| 宽屏抽屉常驻，`.mdui-drawer-body-left` 给 `body` 加了 `padding-left: 240px`，但 `position: fixed` 的页脚与进度条从 `left: 0` 起算 | 给这两个 fixed 层单独补左偏移 |
| 自建 `z-index`（进度条 3000、播放器 2000）与 `.mdui-overlay` 同层或更高，抽屉打开时浮在遮罩之上 | 全文件只留一张层级表：sakana 200 / 页脚 300 / 回到顶部 400 / 进度条 1500 / 播放器 1600，**全部低于 2000** |

顺带：手机播放器从 `top: 62px`（压顶栏）改底部浮动 `calc(48px + safe-area)`；顶栏「友情链接」四字包 `<span class="btn-label">`，≤768px 只留图标；小屏归零 `mdui-p-x-2` 与 `.markdown-body` 的双重内边距；页脚两个 `float` 改 flex + `space-between`；`menuSelect` 写死的 84px 偏移改读 `--header-h`（桌面 64 / 手机 56）。

### 五、修掉的缺陷（`autoindex.js`）

| 改动 | 原因 |
|---|---|
| `createMenu()` 由 `reduce` 改单遍循环 | 原实现 `while (prev.level-- > …)` 递减前一个标题对象的 `level`，污染后续比较，连续跳级时缩进错乱 |
| `menuSelect()` 改 `replaceState` + `scrollTo` | 原实现赋值 `location.href` 会整页重载，`scrollBy(0,-100)` 与顶栏高度不匹配 |
| `getType()` 改精确匹配 | `'apk'.includes(fileExt)` 使 `.p`、`.k` 误判；`"'code'"` 多一层引号把图标名渲染成文字 |
| 补齐隐式全局变量声明 | 严格模式/模块化下直接抛错 |
| 元信息按需注入 | 原本无条件注入，与页面自带标签重复；`description` 的 `content` 多一层引号 |
| `marked` 请求加 `error` 回调 | `?p=` 拼错时原本白屏，现在提示「文章加载失败」 |
| 修正 `convertMermaid()` 重复声明 `mermaidList` 的 `SyntaxError` | 引入按需加载时产生 |
| 目录项加 `data-target` | 滚动高亮原本只能靠解析 `onclick` 字符串定位 |
| 首页 h1 弃用 `background-clip: text` 透明字 | 高亮规则的 `background:` 简写把 `background-image` 重置为 `none`，渐变被抹掉而 `-webkit-text-fill-color: transparent` 仍生效 → 标题整行镂空消失。改用纯色 `#f2f6fa` + `::after` 渐变短横线；高亮只用 `background-color` 并显式写 `color`，打印样式补 `-webkit-text-fill-color: #111` |
| 播放器容器一律直角 | `.aplayer` 既有库自带的 5px 圆角、又被覆盖成 12px，与浮在角上的关闭按钮相互吸边。`.aplayer` 及 `.aplayer-body` / `-info` / `-list` 全部 `border-radius: 0 !important` |
| 关闭按钮被容器裁掉右上角 | 按钮以 `-6px` 浮在 `#player-layout` 右上角，实测该元素最终落到 `overflow: hidden`，把按钮右上各切 11px（直角缺口，非圆弧）。`#player-layout` 与 `.aplayer` 两层都显式写 `overflow: visible !important`，并给 `#player-close` 补 `z-index: 2` |
| 关掉播放器后音符图标点不动 | `#player-layout` 固定占着右上角 300×66，`destroy()` 只清空 `#aplayer`，容器仍为 `display:block`，把工具栏按钮整个盖住 —— `elementFromPoint` 命中 `DIV#player-layout` 而不是图标。改为容器与按钮同生共死：初始化与关闭时 `hide()`，`startPlayMusic()` 开头 `show()` |
| 无语言代码块被看错语言、中文凭空变粗 | `highlight` 回调原先无条件调 `hljs.highlightAuto()`。四段中文因「xxx:」冒号结构被判为 Makefile 的 `target:`，套上 `.hljs-section` 后加粗。改为只对「已标注且 hljs 认识」的语言着色，未标语言原样返回交给 marked 转义；另把 `shell` 映射到 `bash` —— hljs 的 `shell` 是 “Shell Session”，只认 `$` 提示符 |

### 六、可复用结论

- `background-clip: text` 透明字方案不能用在会被动态加类 / 打印 / 选中的元素上。
- 抽屉宽度禁用 `vw`，必须取小于 mdui 隐藏位移的固定值。
- `position: fixed` 元素不参与 `body` 的 `padding-left`，宽屏偏移必须单独补偿。
- 自动层级一律低于 `.mdui-overlay` 的 2000，否则遮罩挡不住。
- 浮在容器边角外的关闭按钮，要求容器 `overflow` 显式写 `visible !important`：同特异度下库样式（APlayer / mdui）会把它吃掉，而 `!important` 不依赖加载顺序。
- 代码块不要用 `highlightAuto()` 盲猜语言：中文里的「词: 内容」会被当成 Makefile 的 target。要么标语言，要么干脆不猜。
- sakana 内部 `transform-origin` 为 `50% 100%`、默认参数 `inertia 0.01 / decay 0.99`；外部改 `transform` 会破坏拖拽与惯性，缩放只能走 `Sakana.init` 的 `scale`。
- `favicon.ico` 实际是 GIF89a，须显式 `<link rel="icon" type="image/gif">`，否则标签页图标不显示。

### 七、验证

`node --check` 通过；CSS 花括号 177/177；抽屉三档宽度 272/312/240 全部小于对应位移；五个固定层 z-index 全部低于 2000；宽屏偏移补偿规则存在；播放器：`#player-layout` 与 `.aplayer` 计算后的 overflow 均为 `visible`、容器无圆角、关闭按钮完整可见（browserless 实测截图对比）；全文无 `text-fill-color: transparent` 残留；`.markdown-selected` 三条声明齐备；8 个 CDN 地址仍在 `CDN` 常量表；功能入口逐项核对（`?p=` 路由、markdown 渲染、H1–H6 目录、Gitalk、APlayer、flowchart、sequence、mermaid、`<media>`、AI 模式、sakana、busuanzi、GA、图片懒加载、31 篇文章）全部通过。访问日志 20:58–21:02 来自 10.10.10.15 / .16 的请求均为 200/304，无 404。

**未覆盖**：执行环境 SSRF 策略拦截回环地址，`curl` 的 HTTP 状态码端到端验证未跑，已用等效文件级检查替代。需人工确认时：

```bash
python3 -m http.server 8000
# 打开 http://127.0.0.1:8000/index.html?p=Octop_Docker
```
