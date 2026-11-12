# ASTRA 嵌入 blogUpdate — 可行性验证报告

> 执行日期：2026-11-12 ｜ 项目：`E:\Jader\blogUpdate` ｜ 源项目：`E:\Jader\blog`（**全程只读，未改动**）
> 参考模板：`https://github.com/Luzhaotian/portfolio`（Next.js 15 + React 19 + UnoCSS）

---

## 结论

**可行，且已跑通 PoC。** 五套风格在本地并列、可互相切换，切到「太空」就是现在 `jaderai.cn` 的完整效果，切回来还是模板原样。原 blog 一行代码没改。

但实现方式不是「把源码合并」，而是 **把 ASTRA 的构建产物作为独立静态子应用，用 iframe 隔离嵌入**。这是架构约束决定的，不是偷懒（见 §2）。

> **2026-11-12 19:00 补充｜浏览器实测已补齐**：首版只验了 HTTP 层，结论是「全绿」，但用 Chrome 真正打开后 iframe 是白屏 —— Vite 懒加载 chunk 全部 404。已定位两处根因并修复（§4.5 / §4.6）。现在静态导出站（`localhost:3000`）与 dev 站（`localhost:5555`）都实测能完整渲染 3D 星图与 ASTRA 首页，控制台只剩 2 条 React Router 未来警告 + 1 个源项目自带的缺失贴图。`scripts/sync-astra.mjs` 已加同步自检，防止路径问题回归。**只测 HTTP 状态码不足以验收 iframe 嵌入**，这是本轮最重要的教训。

---

## 1. 已完成的操作（对照参考仓库 README）

| README 步骤         | 执行结果                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------- |
| 克隆仓库            | `git clone --depth 1` → `E:\Jader\blogUpdate`，3.2 MB                                         |
| `npm install`       | 604 包，exit 0（本机 Node 22.22.2，模板 `.nvmrc` 要求 22.23.2，满足 `engines >=22.12`）       |
| `npm run dev`       | Ready in 2.8s，`http://localhost:5555`                                                        |
| 四套风格路由        | `/blueprint` `/atelier` `/classic` `/particle` 全部 200                                       |
| `npm run typecheck` | exit 0                                                                                        |
| 静态导出            | `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` → exit 0，9 个页面全部预渲染，`out/` 20 MB |

未执行 README 里的「Skill 只保留一套风格」——目标是**四套 + 太空并列**，不裁剪。

---

## 2. 为什么是 iframe，不是源码合并

| 维度  | 模板                     | ASTRA                                   | 冲突                                          |
| ----- | ------------------------ | --------------------------------------- | --------------------------------------------- |
| 框架  | Next.js 15 App Router    | Vite 5 SPA                              | 构建系统、路由模型不兼容                      |
| React | 19                       | 18                                      | 同一棵树里两个 renderer 不可共存              |
| 路由  | 文件路由 `/blueprint` 等 | BrowserRouter 8 条路由 + 星图飞行状态机 | 路径与状态机抢占                              |
| 样式  | UnoCSS（编译期生成）     | 18 个手写 CSS + CSS 变量                | 规则不通用、全局污染                          |
| 3D    | Vanta / p5 / Three       | R3F 9 万粒子星系 + Bloom                | **两套全屏 WebGL 争 context**，必然黑屏或崩溃 |

模板的 `styles/README.md` 有官方「Add a new style」扩展点，但契约要求 `styles/<id>/index.ts` 导出一个 React 组件。ASTRA 不满足这个契约，也不该硬塞。

**iframe 是正确的隔离边界**：两套 React、两套路由、两套 WebGL 各自独立文档、独立 context，零冲突；外层只保留一个风格切换竖栏。切换仍按模板原行为——`window.open` 新标签打开，互不影响。

---

## 3. 落地结构（第五风格 `astra`）

按 `styles/README.md` 的「Add a new style」五步注册，让竖栏、`/` 重定向、`localStorage` 偏好全部由注册表自动派生：

```
app/astra/
  layout.tsx                # metadata + favicon
  page.tsx                  # "use client" 全屏 iframe + StyleRail
styles/astra/
  meta.ts                   # id / path /favicon /labelKey /chrome
  uno.ts                    # 仅提供竖栏所需 CSS 变量（iframe 内样式自洽）
scripts/sync-astra.mjs      # 只读 ../blog/dist → public/embed/astra/，重写绝对路径
public/embed/astra/         # 71 文件 / 9.3 MB（生成物，需提交）
public/favicon-astra.svg
```

同步修改的契约点（全部已改）：
`styles/types.ts`（`StyleMode` / `labelKey`）、`styles/registry.ts`（注册表 + `STYLE_PATHS`）、`uno.config.ts`、`lib/i18n/types.ts`、`lib/i18n/locales/{zh,en}.ts`、`lib/skillShare.ts`、`lib/site.ts`、`next.config.ts`。

`/` 的重定向脚本和 `StyleRail` 都遍历 `STYLE_IDS`，所以新增风格后**自动多出「太空」一项，无需改组件**。

---

## 4. 关键坑与解法

### 4.1 ASTRA 的绝对路径

ASTRA 以 `base='/'` 构建，产物里有三类绝对路径：

- `index.html`：`/assets/index-*.js`、`/assets/*.css`
- 压缩 JS 里硬编码：`/textures/universe.jpg`、`/textures/wechat-qr.png`、`` `/textures/planets/${id}.jpg` ``
- `public/qa-agent/`、`public/textures/` 原样复制

放进 `/embed/astra/` 子目录会全部 404。`scripts/sync-astra.mjs` 对 HTML/JS/CSS 做统一前缀重写（实测 5 个文本文件命中，`grep` 复查无任何残留未前缀路径），二进制资源原样复制。

### 4.2 BrowserRouter 起始路径

ASTRA 用 `BrowserRouter` 且无 `basename`，iframe 初始 URL 是 `/embed/astra/index.html`，不在 8 条路由里。同步脚本在 `<head>` 注入：

```html
<script>
  try {
    history.replaceState(null, "", "/");
  } catch (e) {}
</script>
```

让 React Router 从 `/` 启动（`App.tsx` 的 `*` → `Navigate to="/"` 也兜底）。同源 `replaceState` 合法，且资源已全部改成绝对路径，不受 URL 变化影响。

### 4.3 basePath

模板默认 `GITHUB_PAGES=true` → `basePath=/portfolio`（项目站点子路径）。但现有域名 `jaderai.cn` 是**根路径**，且 ASTRA 的资源前缀写死 `/embed/astra`。因此新增开关：

```bash
# 自定义域名 / <user>.github.io 用户站点（根路径）
GITHUB_PAGES=true PAGES_REPO_NAME= npm run build

# 项目子路径部署（仓库名 portfolio）
GITHUB_PAGES=true npm run build
# 同时需： ASTRA_BASE=/portfolio/embed/astra ASTRA_ROUTER_BASE=/portfolio/ node scripts/sync-astra.mjs
```

`lib/site.ts` 的 `PAGES_REPO_NAME=""` 让 `basePath` 为空；`next.config.ts` 在 `basePath` 为空时不设 `assetPrefix`（否则变成 `"/"` 的畸形值）。顺手加了 `outputFileTracingRoot: process.cwd()`，消掉父目录 `E:\Jader\package-lock.json` 引起的 workspace root 误判告警。

### 4.4 路由与 public 目录不能同名

ASTRA 产物放 `public/embed/astra/` 而不是 `public/astra/` —— 避免静态导出时 `out/astra/index.html` 与 `app/astra` 生成的页面互相覆盖。

### 4.5 首版实测白屏：懒加载依赖是相对路径（已修）

HTTP 层全绿是假象。浏览器一打开，`/astra` 的 iframe 里所有 lazy chunk 都 404，React 的 `ErrorBoundary:canvas` 报 `Unable to preload CSS`，`canvasCount=0`、`#root` 只有 203 字符 —— 整站白屏，3D 根本没起来。

根因在 `__vite__mapDeps`：Vite 把每个 chunk 的依赖存成**不带前导斜杠**的相对字符串 `"assets/HomePage-xxx.js"`，运行时由 preload helper 拼成绝对 URL。而 §4.2 注入的 `history.replaceState(..., "/")` 把 iframe 的 `document.baseURI` 改成了站点根，于是这些相对依赖全部解析到 `/assets/*` → 404。首版 `sync-astra.mjs` 只重写了 `"/assets/..."` 这类**带前导斜杠且被引号包裹**的路径，恰好漏了这一批。

修复：`rewrite()` 增加相对路径规则，把 `"assets/xxx"`、`url(assets/xxx)` 也改写成 `${BASE}/assets/xxx`（`public/` 下的 7→8 个文本文件命中）。

### 4.6 第二处坑：Vite preload helper 硬编码 `"/" + dep`（已修）

把依赖改成绝对 `/embed/astra/assets/xxx` 后，浏览器报 `net::ERR_NAME_NOT_RESOLVED`，请求的是 `http://embed/astra/assets/...`。查压缩产物发现 helper 是：

```js
s3 = function (n) {
  return "/" + n;
};
```

它**无条件**在每个 dep 前再加一个 `/`，于是 `/embed/...` 变成 `//embed/...` —— 被浏览器当成协议相对 URL，主机名成了字面量 `embed`。

修复：`sync-astra.mjs` 增加 `fixPreloadHelper()`，把 helper 改成绝对路径直通：

```js
function (n) { return n.charAt(0) === "/" ? n : "/" + n }
```

产物里该 helper 只出现 1 处（`assets/r3f-BjRlvwza.js`）。同步脚本现在会自检：残留未加前缀的引用、未打补丁的 helper、协议相对路径，任一命中即 `exit 1`。

---

## 5. 验证结果

**开发服务器（`localhost:5555`）**

| 检查                                                        | 结果                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/` `/blueprint` `/atelier` `/classic` `/particle` `/astra` | 全部 200                                                                              |
| `/astra` 页面                                               | iframe `src="/embed/astra/index.html"`，StyleRail 含 5 项（蓝图/静奢/经典/粒子/太空） |
| `npm run typecheck`                                         | exit 0                                                                                |
| `/embed/astra/index.html`、`404.html`、主 JS                | 200（68.9 KB）                                                                        |
| `/embed/astra/textures/universe.jpg`                        | 200（1.51 MB）                                                                        |
| `/embed/astra/textures/wechat-qr.png`                       | 200（80.6 KB）                                                                        |
| `/embed/astra/qa-agent/index.html`                          | 200                                                                                   |
| JS 内硬编码贴图路径                                         | 全部重写为 `/embed/astra/textures/...`                                                |

**静态导出（`npx serve out -p 3000`，即 README 的 `npm run preview` 等价验收）**

| 检查                                                        | 结果                                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 构建                                                        | `✓ Compiled successfully in 24.1s`，`✓ Exporting (2/2)`，7 条路由全部 `○ (Static)` |
| `/` `/blueprint` `/atelier` `/classic` `/particle` `/astra` | 全部 **200**                                                                       |
| `/astra` 页面                                               | iframe `src="/embed/astra/index.html"`，竖栏 5 项齐全                              |
| embed 入口 / 404 / 主 JS / 两张贴图 / qa-agent              | 全部 **200**                                                                       |

> 构建过程中出现过一次 `EPERM .next/trace` 和一次 `next/font/google` 拉取字体失败，均为并发 build + 字体网络重试叠加所致；清理 `.next`/`out` 后单独重跑即通过，字体可达性实测 `fonts.gstatic.com` 200。属环境抖动，不是代码问题。

**浏览器实测（Chrome headless 1440×900 · SwiftShader 软渲染 · 2026-11-12 19:00）**

| 检查               | 静态站 `localhost:3000`                      | dev 站 `localhost:5555` |
| ------------------ | -------------------------------------------- | ----------------------- |
| `/astra` HTTP      | 200                                          | 200                     |
| 外层 StyleRail     | 5 项（蓝图/静奢/经典/粒子/太空）             | 同左                    |
| iframe 内 `canvas` | 1 个，1440×900                               | 1 个，1440×900          |
| WebGL              | 可用                                         | 可用                    |
| `#root`            | 5934 字符，ASTRA 首页完整文案 + 五颗行星导航 | 5933 字符，同左         |
| 序章               | 自动播完 / 可点「跳过」                      | 同左                    |
| 控制台             | 2 条 React Router 未来警告 + 1 个 404        | 同左                    |

截图：`E:\Jader\blog\.workbuddy\verify\static-full.png`、`dev-full.png`（另有 `*-iframe.png`）。视觉确认：星系、Bloom 辉光、HUD 坐标、ASTRA 标题与五颗行星全部正常；外层风格竖栏贴在左边缘，与 ASTRA HUD 并置但未遮挡主体。

**唯一残留 404**：`/embed/astra/textures/planets/contact.jpg`。这是**源项目既有缺失** —— `E:\Jader\blog\public\textures\planets\` 只有 about / blog / demos / home / projects 五张，代码按 `/textures/planets/${id}.jpg` 拼出 contact，`jaderai.cn` 原站同样 404。不是嵌入引入的；要消除需在 blog 侧补图或加 fallback。

---

## 6. 已知限制（不影响「能看到现在的效果」）

1. **iframe 内刷新 / 深链接**：在 iframe 里按 F5 或手动刷新 `/about`，会请求模板站的 `/about`（无此路由）→ 404。站内点击导航正常（React Router 客户端跳转）。要彻底解决需给 ASTRA 加 `basename` 或预渲染，**那就要改原 blog 源码**，与「先不动」冲突。
2. **两套 chrome 叠加**：外层 StyleRail 浮在 iframe 上，与 ASTRA 自带 HUD 左侧导航可能视觉重叠。可把外层竖栏挪到右上或做成折叠按钮。
3. **WebGL 重建**：切回「太空」时 iframe 重新加载，9 万粒子 + 贴图需重建，有几百 ms 黑屏。
4. **`/qa-agent/` 无斜杠**在 Next dev 下 404（目录索引行为差异）；静态托管一般会正常补 `index.html`。
5. **产物需入库**：`public/embed/astra/`（9.3 MB）必须提交，GitHub Actions 才会把它一起发布；CI 上没有 `../blog/dist`。原项目更新后需手动重跑同步脚本。
6. **origin 已切换**：现指向 `https://github.com/Jader-S/astra-portfolio`（Jader 自己的 **private** 仓库）；模板来源保留在 `LICENSE`（MIT 原作者版权）。`Jader-S.github.io` 主站仓库未动。
7. **源项目缺失贴图**：`contact.jpg` 404（`jaderai.cn` 原站同样缺失，见 §5）。嵌入层不擅自补图，避免掩盖源站问题。

---

## 7. 常用命令

```bash
cd E:\Jader\blogUpdate

npm run dev                     # 本地预览，localhost:5555
npm run typecheck               # 类型检查
node scripts/sync-astra.mjs     # 原 blog 有更新后，重新同步嵌入产物

# 发布构建（根路径 / 自定义域名）
GITHUB_PAGES=true PAGES_REPO_NAME= npm run build
npx serve out -p 3000           # 本地验收静态产物
```

同步脚本可用环境变量覆盖：`ASTRA_DIST`（产物路径）、`ASTRA_BASE`（嵌入前缀）、`ASTRA_ROUTER_BASE`（Router 起始路径）。

---

## 8. 后续三条路

|                             | 做法                                                                                          | 适合                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **A. 保持现状（推荐先用）** | 五套并列，`site-content.yaml` / `data/` / `lib/i18n/` 换成 Jader 的内容                       | 先验证观感与内容                                               |
| **B. 内容迁移**             | 把 ASTRA 里的项目、Demo、博客 MDX 迁到模板的数据层，让四套风格都展示真实内容                  | 想让新风格「有内容」而不是占位                                 |
| **C. 深度整合**             | 把 ASTRA 源码迁进 Next 15（升 React 19、改路由、用 `dynamic(ssr:false)` 挂 R3F），去掉 iframe | 想要真正单页、可分享 URL、无 iframe 限制 —— 等于重写，成本最高 |

**技术债提示**：§4.5 / §4.6 是在压缩产物上做字符串改写 + 打补丁，能用但脆弱，Vite 版本一升级 helper 形态可能变。更干净的做法是给嵌入产物单独构建一次：`npx vite build --base=/embed/astra/ --outDir=<临时目录>`，让 Vite 原生生成带前缀的 helper、动态 import 和 CSS URL，同步脚本只处理少量硬编码 `/textures/...` 与 `replaceState` 注入。这不改 blog 源码，但会改变同步流程；等 PoC 确定要长期维护时再切换。

**回滚**：删掉 `app/astra/`、`styles/astra/`、`public/embed/astra/`、`public/favicon-astra.svg` 与本文列出的契约点改动即可；原 `E:\Jader\blog` 从未被修改（`git status` 干净）。
