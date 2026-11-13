# blogUpdate 项目长期笔记

> 每日过程见 `.workbuddy/memory/YYYY-MM-DD.md`；分期计划与验收明细见 `PLAN_BLOGUPDATE_V2.md`。

## 项目身份

- Next.js 15 App Router + `output: "export"` 静态站，5 主题：`blueprint` / `atelier`(静奢) / `classic`(经典) / `particle`(粒子) / `astra`(太空)。
- 主题变量挂 `html[data-style]`，明暗挂 `[data-theme]`；静态导出 9 页。
- 六段导航：`01 ABOUT / 02 WORK / 03 LAB / 04 SKILLS / 05 BLOG / 06 DOMAINS`。

## 架构铁律（跨期复用）

1. **弹框状态用 zustand 外部 store**（`lib/blog-modal.ts` / `lib/project-modal.ts`），不用 Context：astra 的 R3F `<Canvas>` 是独立 reconciler，Context 穿透不可靠；blueprint 绘制动画也从 React 树外发 action。命令式 API（`openBlog` / `openProject` / `openDemo`）随处可触发。
2. 弹框 / 抽屉一律 `createPortal(..., document.body)`：particle 有 snap-scroll 容器、atelier/blueprint 有 transform 层，直接渲染会被裁剪。两个弹框 z-index 都 9999，在 project-modal store 里单向 `closeBlogModal()` 互斥。
3. **语言只有一个真源** = 根 `I18nProvider.locale`；`@astra/i18n` 的 `useT()` 只是桥接层；切语言一律调 `setLocale()`。导航文案只维护 `lib/i18n/locales/*.ts` 的 `nav` 一处。
4. `output:"export"` + 主题页全客户端 → 博客正文必须构建前固化（`npm run gen:blog-content`），不能运行时读 `fs`；改 MDX 后必重跑。
5. 静态站旧锚点兼容：在合并后的 section 内放不可见 `<span id="旧锚点" aria-hidden="true" />`，不要加 hashchange 监听（`ssr:false` 主题有挂载竞态）。
6. **demo 与站点主题解耦靠一层语义桥**：`styles/shared/demos/demo-tokens.css` 作用域 `[data-demo-theme]`，demo 内部只认 `--demo-*`；桥接层把语义色映射到当前主题 token 并补齐 astra 遗留变量名。Canvas / ECharts / Three 无法解析 `var()` 与 `color-mix()`，必须用 `lib/demo-theme.ts` 的 `readDemoPalette()` 取具体 `rgb()`。
7. 显隐用 **CSS 媒体查询**，不用 JS 首帧视口分支（避免 SSR hydration mismatch）；`useViewport()` 只做跨断点 state 同步。
8. `vitest.config.ts` 的 alias 必须是数组且 `@astra/` 排在 `@/` 前；`@astra/*` 是根级 tsconfig paths，shared 目录下仍可解析。
9. Windows 文件锁会挡 Git Bash 的 `mv` / `git mv`，批量移动目录用 PowerShell `Move-Item`。

## 环境与工具坑

- 起 dev：`CODEBUDDY_SAFE_DELETE_ENABLED=0 npx next dev -p 3000`（WorkBuddy safe-delete shim 会拦清缓存）。dev 产物 `.next-dev`、build 产物 `.next` 已隔离；`out/` 是 gitignore 的旧导出残留，不参与交付。
- **主题空白 / 路由分块 404 多半是环境不是代码**：僵尸 dev server（多端口共用旧 `.next`、`next build` 产物混入）导致 `page.js/page.css` 缺失。用 PowerShell `Get-NetTCPConnection` 精准杀 3000 / 5555 / 3137 占用进程 → 清 `.next` → 干净重启单台。勿用 `$pid` 作变量名（保留字）。
- 跑 `next build` 前先杀净 dev server，否则 `.next/trace` 报 EPERM。
- 后台 dev server 在该环境会被反复回收，用户常反馈「看不到效果」：验证时用**单条命令**「起服务 → 等就绪 → Playwright 截图 → 关服务」一气呵成，并留实机截图交付兜底。纯 DOM 文本量不能判断 astra 是否渲染（它是 3D canvas）。
- E2E 偶发 spec 失败多为 dev HMR 重编译会话抖动，单 spec 复跑即绿。R3F `synchronously unmount a root` / `Multiple instances of Three.js` 是既有开发期警告（已回基线复跑确认），不影响渲染。
- Playwright chromium 官方 CDN 会 `ECONNRESET`，用 npmmirror 镜像 `cdn.npmmirror.com/binaries/playwright` 安装。

## 提交约定

- **每期单独验收、单独提交**。标题遵守 `commitlint-plugin-chinese.mjs`：只用中文标点（`，`、`、`）+ ASCII 连字符 `-`；**禁半角逗号 `,`、禁 en-dash `–`**。
- lint-staged 会跑 prettier；把多个 `git commit` 串在一条命令里易被 SIGTERM 中断，分开逐条执行。
- `git fsck` 报的 `68b7509 → d309f3a` broken link 是不可达悬空旧 commit（原作者历史遗留），不在 HEAD 链上，无需处理。

## 验收基线

`npx tsc --noEmit` ✓ ｜ `npx eslint . --max-warnings 0` ✓ 0 warning ｜ `npx vitest run` ✓ 23 files / 94 tests ｜ `next build` ✓ 9 静态页 ｜ Playwright E2E 全绿 ｜ 五主题 × 明暗对比度 ≥ 4.66:1（WCAG AA）。

## 协作偏好（重要）

- 用户要「换字符串 / 改文案」这类**最小改动**时，只改该处；不要为了「更好看 / 更可读」自作主张改渲染机制、密度、亮度。需求边界有歧义先确认再动手。
- 2026-11-13 Phase 12→13 纠偏即因违反此原则：为让固定顺序文字可读加了整列常亮 + 加密 + 提亮，破坏原始 Matrix 稀疏拖尾雨，被要求全部撤销。**当前静奢流星以 Phase 13 为准**：原始 `gate` 随机点亮 + `b` 拖尾淡出、视觉参数全原值，仅字符改为沿列固定顺序 `JaderAI.cn `（末尾空格分隔）+ 正向字符修复。
- 反馈风格：简洁直接，多选项用数字编号；团队自主推进，只在落地卡住时反问。
- **站内博客一律以用户本人（孙珺宇 / Jader）第一人称写**：不出现「用户 / 反馈回来 / 你」这类 AI 协作复盘口吻；需求写成自己的判断与取舍，题材从真实工作提炼「问题 → 根因 → 结果」，附数字与文件路径。现有 18 篇 MDX 在 `content/blog/`，元数据在 `data/blogs.ts` 与 `site-content.yaml`，改 MDX 后必须重跑 `npm run gen:blog-content`（正文固化进 `data/blog-content.generated.json`）；新增文章还要同步 zh/en i18n、README 与注释里硬编码的篇数。
