# 计划：ASTRA 深度整合进 blogUpdate（去 iframe，单仓五主题）

> 状态：Phase 1 已完成（去 iframe，/astra 原生路由跑通）｜ Phase 2/3 待做 ｜ 创建：2026-11-12 ｜ 负责人：Jader + Mark

## 0. 战略决策（已与用户确认）

- **不再单独维护 `E:\Jader\blog`（ASTRA 原站）**，唯一仓库 = `blogUpdate`（astra-portfolio，Next 15 / React 19）。
- ASTRA 从「被 iframe 挂进来的构建产物」升级为 **`/astra` 原生路由**，与 `/blueprint`、`/atelier`、`/classic`、`/particle` **并列的第五套主题**。
- 内容长期统一在 `data/*.ts` + `lib/i18n`（四个模板主题已如此），ASTRA 接入统一内容层。
- **新站不上 GitHub Pages，本地即可**（CI 红不管）。

## 1. 锁定范围（用户 2026-11-12 拍板）

| #   | 诉求       | 决定                                                                                          |
| --- | ---------- | --------------------------------------------------------------------------------------------- |
| 1   | 博客 MDX   | **迁进来** → 新增 `/blog` 路由（Phase 2）                                                     |
| 2   | ASTRA 定位 | **全量保留 3D**，作为五主题之一并列；**内容统一管理**（Phase 3 落实）                         |
| 3   | 原内容重写 | **ASTRA 文案先用现状**（Phase 1 不重写）；博客只迁移不改写（Phase 2）；重写统一留 **Phase 3** |

**执行节奏：分期 · ASTRA 先**（Phase 1 先打通，Phase 2/3 后做）。

## 2. Phase 1 —— ASTRA 原生化（当前）

目标：`/astra` 路由原生渲染 ASTRA 3D 太空站，去掉 iframe，内容接统一层做最小化接法。

### 依赖（写入 package.json 并安装）

- 新增：`@react-three/fiber@^9`、`@react-three/drei@^10`、`@react-three/postprocessing@^3`、`gsap@^3.12`、`zustand@^5`
- 已有可复用：`three@0.170`（源站用 0.169，向上兼容即可）、`react@19`、`@types/three@0.170`
- 不引入 `react-router-dom`（用 Next 路由 + ASTRA 自有 zustand 状态机替代）

### 目录约定

- 移植源码放入 `styles/astra/src/`（galaxy / ui / state / i18n / demos / intro / config / utils / styles）
- `styles/astra/index.tsx` 导出 `<AstraApp/>`（Canvas 根 + 状态机挂载）
- `app/astra/page.tsx` 改为 `dynamic(() => import('@/styles/astra'), { ssr:false })`，包在 `AppProviders style="astra" hideChrome` + `<StyleRail/>` 内（与 blueprint 同构）

### 移植范围（源站 `src/` 99 文件）

- **保留并移植**：`three/`（GalaxyRoute 场景/相机/行星导航/Demo）、`ui/`（HUD 层/LoadingHUD/ErrorBoundary/FallbackRoute）、`state/`（zustand store）、`i18n/`、`demos/`（Demo 舞台）、`intro/`（序章叙事）、`config/`、`utils/`（device 探测）、`styles/`（18 个手写 CSS）
- **删除**：`pages/`（About/Projects/Blog 等 2D 路由页，与四套主题内容重复，ASTRA 聚焦 3D）、`react-router` 相关、`vite`/MDX rollup 配置
- 内部导航用 ASTRA 自有 zustand 状态机（view 枚举），不抢 URL

### R3F v8→v9 升级要点（真实工作量核心）

- `@react-three/fiber@9` 要求 React 19（已满足）
- `@react-three/drei@10` / `@react-three/postprocessing@3` 配套升级
- 高风险 API 差异：drei 组件签名、postprocessing 效果命名、`extend` 用法；逐文件过
- `three@0.170` 与源站 `0.169` 仅小版本差，注意 `outputColorSpace` 等已在新版，源站代码应已用新 API

### 清理 iframe 遗产

- 删 `public/embed/astra/`、`scripts/sync-astra.mjs`
- `app/astra/page.tsx` 去掉 `<iframe>` 与 `basePath/embed` 拼接
- 检查 `lib/site.ts` / `next.config.ts`：basePath 为 GH Pages 通用逻辑，非 embed 专属，保留

### 内容最小化接法（Phase 1）

- ASTRA 3D 内若需展示项目数字（如配电树 72s→2.1s），优先从 `data/projects.ts` 复用
- ASTRA 专属文案（序章叙事等）**先用现状**（保持 `styles/astra/src/i18n` 内部副本），不重写进统一层 —— 留 Phase 3

### 验收（Phase 1 完成标准）

- `npm run typecheck` 通过
- `npm run build` 通过
- `npm run test` 仍 47/47（不因 ASTRA 退化）
- `npm run dev` 下 `/astra` 原生渲染太空站，StyleRail 可在五主题间切换，WebGL 无冲突、无黑屏
- `public/embed/astra/` 与 `sync-astra.mjs` 已删除

## 3. Phase 2 —— 博客呈现在当前页弹框（已按 `PLAN_BLOGUPDATE_V2.md` Q1 调整）

> **方案变更（2026-11-13）**：原计划的 `app/blog/page.tsx` + `app/blog/[slug]/page.tsx` **未实施**。
> 最终定案为「全改弹框并删路由」：MDX 正文由 `scripts/gen-blog-content.mjs` 固化为静态数据，
> 5 主题共用 `components/BlogModalHost.tsx` 在当前页弹框阅读，`app/<theme>/blog/[slug]/` 全部删除。
> 以下是当时的设想，保留作决策记录。

- 新增 `app/blog/page.tsx`（列表）+ `app/blog/[slug]/page.tsx`（详情）
- 补 MDX 工具链：`gray-matter` + 渲染（倾向 `next-mdx-remote` RSC，或 `@next/mdx`）；blogUpdate 当前无 MDX 依赖
- 迁 15 篇 MDX（frontmatter：`title/date/tags/excerpt`）从 `E:\Jader\blog\src\content\blog` 进 `content/blog/`
- **只迁移不改写**；所有五主题加 `/blog` 入口链接
- 原文站博客已全部迁入 `content/blog/*.mdx`，站内本地渲染；不保留任何外部文章链接

## 4. Phase 3 —— 内容重写并进统一层（另排期）

- ASTRA 专属文案（序章/关于/叙事）重写为统一 `data/*.ts` + `lib/i18n` 字段
- 15 篇博客按需升级重写（用户拍板是否全量）
- 目标：五主题 + 博客全部读同一内容源，零内容副本

## 5. 风险

- **R3F v9 升级 ASTRA 代码**：中等偏上工作量但机械，逐文件过 API 差异
- **构建体积**：3D + 四套模板风格同仓，注意 code-split（`dynamic ssr:false` 已隔离 ASTRA）
- **WebGL 上下文**：并仓后 `/astra` 为独立挂载，切主题时 Next 卸载旧路由释放 context，冲突根因消失（红利）
- **three 0.170 vs 0.169**：小版本差，过一遍 three 变更日志

## 6. 不做的事

- 不推 GitHub Pages（用户定调本地）
- Phase 1 不重写 ASTRA 文案、不迁博客（留 Phase 2/3）
- 不保留 `react-router`、不保留 iframe 嵌入路径
