# Jader · ASTRA Portfolio（多风格作品站）

孙珺宇（Jader）的个人作品站 — 基于 [Luzhaotian/portfolio](https://github.com/Luzhaotian/portfolio)（MIT）的 **Next.js 15** 单页模板，五套可切换视觉风格：默认 **蓝图（Blueprint）**，另有 **静奢（Atelier）**、**经典（Classic）**、**粒子（Particle）**，以及用 R3F 原生渲染的 **太空（ASTRA）** 星图站。

内容唯一数据源是根目录 `site-content.yaml`（同步自 `E:\Jader\blog`）。改动后按 `.cursor/skills/*/references/apply-content.md` 的映射同步到 `data/` 与 `lib/i18n/locales/{zh,en}.ts`；嵌入产物的同步与实测见 [`ASTRA_EMBED.md`](./ASTRA_EMBED.md)。

本地预览：[http://localhost:5555](http://localhost:5555)（需先 `npm run dev`；端口见 `.env` 的 `PORT`）

**在线地址：** [https://luzhaotian.github.io/portfolio/](https://luzhaotian.github.io/portfolio/)

入口：`/` 默认进入 **蓝图** `/blueprint`；若本地记住过上次风格，则跳转到对应路径。左侧竖栏在当前标签页切换风格（整页导航，确保特效引擎干净重建）；<768px 收成左侧 30px 细边条，点击展开抽屉。全站只有 `/` + 5 条主题路径，博客、项目详情与 Demo 预览都在当前页弹框展示，不产生 `/blog/[slug]` 之类的内容路由。

**命名与导航已统一**：4 个锚点主题共用一套 `t.nav`（关于我 / 作品 / 实验室 / 技能 / 博客 / 经验领域）与 7 段顺序 `#top → #about → #work → #lab → #skills → #blog → #experience`，章节编号 `01 ABOUT · 02 WORK · 03 LAB · 04 SKILLS · 05 BLOG · 06 DOMAINS`；太空主题行星改为「关于我 / 作品 / 实验室 / 博客 / 联系我 / 全景」。语言只有一份真源（根 `I18nProvider` / `portfolio-locale`），太空主题与共享 Demo 文案随之切换。

---

## 功能特性

- **多风格架构**：蓝图 / 静奢 / 经典 / 粒子拆成独立包（`styles/blueprint` · `styles/atelier` · `styles/classic` · `styles/particle`），共享内容与壳层；默认风格为蓝图
- **左侧竖栏**：桌面竖排切换 5 套风格（蓝图居首；当前标签页整页跳转，确保特效引擎干净重建）；移动端 <768px 收成 30px 细边条，点击从左侧滑出抽屉（遮罩 / Esc / 关闭按钮收起）
- **博客弹框**：5 套主题共用 `BlogModalHost`，点博客卡片在当前页弹框读本地 MDX；太空主题点「博客」行星先出全部文章列表，再下钻正文。不产生 `/blog/[slug]` 路由，不新开标签页
- **项目详情 / 实验室**：5 套主题共用 `ProjectModalHost`（zustand 外部 store + Portal）。点作品卡看「背景 / 职责 / 技术栈 / 成果 / 关联 Demo」，再点 Demo 在当前页内联预览；4 个锚点主题另有与「作品」并列的独立 `#lab` 区块（`LabSection`），平铺全部 6 个 Demo，点开后返回直接回到页面区块、不再绕回 demo 列表。Demo 实现统一放在 `styles/shared/demos/`，含 2 个 R3F 3D 场景，非太空主题也能渲染；GitHub 仓库外链在详情弹框内给出
- **右侧 AI 按钮**：悬停说明用途；点击复制当前风格的 Skill 提示词，粘贴给 AI 即可按本站生成同款项目
- **中英文 / 主题**：语言与白天·夜晚·自动主题，偏好写入 `localStorage`
- **内容数据化**：`site-content.yaml`（模板入口）→ `data/`（结构）+ `lib/i18n/`（双语文案），id 类型绑定防漏写
- **博客**：18 篇本地 MDX 技术日志，按主题在站内渲染，不依赖任何外部博客平台
- **质量门禁**：Vitest 单元测试 · Playwright E2E · CI（lint / typecheck / test）
- Cookie 提示、回到顶部、SEO（Metadata / OpenGraph / 跳过导航）

### 静奢（Atelier）

- 大留白、衬线标题、氧化铜金强调色
- Hero 使用 [@fxshelf/card-orbit](https://github.com/Luzhaotian/fxshelf/tree/main/packages/card-orbit) 卡片环绕
- Canvas：ParticleObject / GlyphRain / FlameWrap / PointerAura（桌面端；减少动效时关闭）
- 区块：Hero → 关于 → 作品（单一列表）→ 实验室 → 技能 → 博客 → 经验领域；旧锚点 `#selected` / `#work-index` 保留为 `#work` 内的不可见别名

### 经典（Classic）

- 毛玻璃卡片 + Vanta 全屏背景（白天 **Waves**，夜晚 **Birds**）
- Hero 同样使用 [@fxshelf/card-orbit](https://github.com/Luzhaotian/fxshelf/tree/main/packages/card-orbit)
- 区块：Hero → 关于 → 作品（单一列表）→ 技能 → 博客 → 经验领域；Hero 补 `#top`，旧锚点 `#enterprise` / `#github` 保留为 `#work` 内的不可见别名
- 部分章节交替「实体毛玻璃 / 透明」节奏

### 粒子（Particle）

- 全屏 WebGL 粒子云作为背景层，内容全宽叠在上层（轻透 scrim 保证可读）
- 粒子从章节剪影采样，滚动切换时 GPU morph 过渡；减少动效 / 移动端回退为静态剪影水印
- 桌面端章节吸附滚动（`prefers-reduced-motion` 时关闭）
- 区块：Hero → 关于 → 作品 → 实验室 → 技能 → 博客 → 经验领域
- 公共控件沿用静奢 chrome（左侧竖栏、主题 / 语言按钮）

### 蓝图（Blueprint）· 默认

- 开场：九叠篆「卢」印记 + swarm 光标群；点击或下滑持续逐屏把整页画出来（无跳过）
- 绘制中保留语言 / 主题切换；平板及以上走绘制，手机端直接落成态
- 收尾：灰色「卢」盖章完稿 + 光标计数旁白 → 大字姓名与编号索引页脚
- 落成后进入常驻作品集，并恢复左右 chrome
- 区块：Hero → 关于 → 作品 → 实验室 → 技能 → 博客 → 经验领域
- 共建引擎源码在 `styles/blueprint/swarm/`（见 `SOURCE.md`）

---

## 用 AI Skill 复用本站风格

仓库内置 Cursor Agent Skills，他人可拉代码后**只保留一套风格**并换成自己的内容，还可按需上线。

| Skill | 调用                   | 说明                     |
| ----- | ---------------------- | ------------------------ |
| 蓝图  | `/portfolio-blueprint` | 保留 Blueprint，去掉其余 |
| 静奢  | `/portfolio-atelier`   | 保留 Atelier，去掉其余   |
| 经典  | `/portfolio-classic`   | 保留 Classic，去掉其余   |
| 粒子  | `/portfolio-particle`  | 保留 Particle，去掉其余  |

### 推荐流程

1. 克隆 `https://github.com/Jader-S/astra-portfolio`（模板原始来源见文末）
2. **先确认**保留哪套风格
3. **生成前**选择填写个人信息，或「仅预览」使用根目录 `site-content.yaml` 占位
4. 保留 `site-content.yaml`，之后可随时改，再让 AI 同步到 `data/` + `lib/i18n/`
5. 本地 `npm install && npm run dev` 验证
6. **可选上线**（非必须）：需要时再走 GitHub / 部署；只要本地预览可跳过

站内点**右侧 AI 按钮**可复制当前风格提示词（已含上述可选上线一步）。  
在 Cursor：对话输入 `/portfolio-blueprint` / `/portfolio-atelier` / `/portfolio-classic` / `/portfolio-particle`，或 **Customize → Skills**；也可把本仓库当 Remote Skill 源导入。

### Skill 文件

```
.cursor/skills/
  portfolio-blueprint/
    SKILL.md
    references/…          # 只留蓝图 + 同步内容 / 可选上线
  portfolio-atelier/
    SKILL.md
    references/
      strip-style.md      # 只留静奢
      apply-content.md    # 同步 site-content.yaml
      go-live.md          # 可选：注册 / 提交 / 部署
  portfolio-classic/
    SKILL.md
    references/…          # 同上（只留经典）
  portfolio-particle/
    SKILL.md
    references/…          # 同上（只留粒子）
```

### 可选：注册 GitHub · 提交 · 上线

Skill 会先问你要不要上线。**选「只要本地」就不会强制部署。**

若选择上线，AI 按 `references/go-live.md` 引导，大致包括：

| 步骤 | 内容                                                     |
| ---- | -------------------------------------------------------- |
| 账号 | 没有 GitHub 时协助注册；检查本机 Git                     |
| 仓库 | 在你账号下新建空仓库（建议名 `portfolio`）               |
| 推送 | 把 `origin` 改成你的仓库，`commit` + `push` 到 `main`    |
| 部署 | **推荐 GitHub Pages**（模板已有 Actions）；也可选 Vercel |

GitHub Pages 首次启用：仓库 **Settings → Pages → Source** 选 **GitHub Actions**，推送 `main` 后访问：

`https://<你的用户名>.github.io/<仓库名>/`

更细的命令与排错见：

- [`.cursor/skills/portfolio-blueprint/references/go-live.md`](./.cursor/skills/portfolio-blueprint/references/go-live.md)
- [`.cursor/skills/portfolio-atelier/references/go-live.md`](./.cursor/skills/portfolio-atelier/references/go-live.md)
- [`.cursor/skills/portfolio-classic/references/go-live.md`](./.cursor/skills/portfolio-classic/references/go-live.md)
- [`.cursor/skills/portfolio-particle/references/go-live.md`](./.cursor/skills/portfolio-particle/references/go-live.md)

---

## 本地开发

```bash
npm install
npm run dev
```

- 蓝图（默认）：<http://localhost:5555/blueprint>
- 静奢：<http://localhost:5555/atelier>
- 经典：<http://localhost:5555/classic>
- 粒子：<http://localhost:5555/particle>

端口由 `.env` 的 `PORT` 控制（`npm run dev` 通过 `--env-file=.env` 注入）。若 `.next` 缓存异常：`npm run dev:clean`。

### 环境要求

- Node.js `22.23.2`（见 `.nvmrc`；nvm 进入目录会自动切换）
- npm 9+（见 `.npmrc`，registry 为 `https://registry.npmjs.org/`）

### 常用命令

| 命令                               | 说明                                      |
| ---------------------------------- | ----------------------------------------- |
| `npm run dev`                      | 开发服务器                                |
| `npm run dev:clean`                | 清 `.next` 后启动                         |
| `npm run build`                    | 生产构建                                  |
| `npm run preview`                  | 模拟 GitHub Pages 静态预览                |
| `npm start`                        | Next.js 生产服务（非静态导出）            |
| `npm run lint` / `lint:fix`        | ESLint                                    |
| `npm run format` / `format:check`  | Prettier                                  |
| `npm run typecheck`                | TypeScript 类型检查（`tsc --noEmit`）     |
| `npm test` / `test:watch`          | 单元测试（Vitest）                        |
| `npm run test:coverage`            | 单元测试 + 覆盖率（`coverage/`）          |
| `npm run test:e2e:install`         | 首次安装 Playwright Chromium（CI / 本机） |
| `npm run test:e2e` / `test:e2e:ui` | E2E；会自动起 `npm run dev`               |
| `npm run clean`                    | 删除 `.next`                              |

首次跑 E2E：`npm run test:e2e:install && npm run test:e2e`。

---

## 项目结构

```
app/
  page.tsx                 # / → 默认蓝图，或按上次风格跳转
  blueprint/ · atelier/ · classic/ · particle/   # 各风格路由（layout 含独立 favicon）
  layout.tsx · globals.css
styles/
  registry.ts · types.ts   # 风格注册表（DEFAULT_STYLE / 竖栏顺序）
  README.md                # 如何新增风格
  shared/                  # 公共：StyleRail、SkillShareRail、Providers、Uno 共享层
  blueprint/               # 蓝图：BuildPhase + settled + swarm 模块 + uno.ts + meta
  atelier/                 # 静奢：components + uno.ts + meta
  classic/                 # 经典：components + Vanta + uno.ts + meta + vendor
  particle/                # 粒子：components + engine + assets + uno.ts + meta
components/                # 应用壳：I18n / Theme / Viewport / SkipLink
data/                      # 结构数据（id / tech / 链接…）
lib/                       # style · theme · skillShare · site · i18n …
e2e/                       # Playwright E2E
test/                      # 单测渲染辅助（renderWithProviders）
vitest.config.ts · playwright.config.ts · vitest.setup.ts
site-content.yaml          # 内容模板（预览占位 / 正式填写）
.cursor/skills/            # portfolio-blueprint · atelier · classic · particle
uno.config.ts              # 合并 shared + 各风格 uno 的配置
public/                    # favicon-* · particle/ 剪影 · card-orbit/ 演示图
scripts/
.github/workflows/         # ci.yml · deploy.yml · update-blogs.yml
```

扩展风格步骤见 [`styles/README.md`](./styles/README.md)。

---

## 自定义内容

1. **优先**编辑根目录 [`site-content.yaml`](./site-content.yaml)（Skill / AI 按此同步）
2. 或直接改 `data/` + `lib/i18n/locales/{zh,en}.ts`

### 分工

| 层                   | 职责                                     |
| -------------------- | ---------------------------------------- |
| `site-content.yaml`  | 对人友好的内容草稿 / 占位                |
| `data/*`             | 结构：id、技术标签、链接、顺序（无文案） |
| `lib/i18n/locales/*` | 中英文文案，按 id 查找                   |

`data/` 每个 id 必须在 zh、en **两侧**都有文案，否则 `tsc` / 构建报错。

### 主要数据文件

| 文件            | 说明                 |
| --------------- | -------------------- |
| `profile.ts`    | GitHub、工作年限     |
| `projects.ts`   | 作品（单一列表）结构 |
| `skills.ts`     | 技能分类             |
| `experience.ts` | 经验领域             |
| `blogs.ts`      | 博客列表             |

企业项目描述建议用通用业务名，避免公开敏感公司名。

语言键：`portfolio-locale`（`zh` / `en`）。  
主题键：`portfolio-theme`（`light` / `dark` / `auto`）。  
风格键：`portfolio-style`（`blueprint` / `atelier` / `classic` / `particle`；未设置时默认 `blueprint`）。

---

## 样式体系（UnoCSS）

```
uno.config.ts
  ├── styles/shared/uno       # 公共 shortcuts / preflight
  ├── styles/blueprint/uno.ts # 蓝图 tokens + shortcuts
  ├── styles/atelier/uno.ts   # 静奢 tokens + shortcuts
  ├── styles/classic/uno.ts   # 经典 tokens + shortcuts
  └── styles/particle/uno.ts  # 粒子 tokens + shortcuts
```

通过 `<html data-style="blueprint|atelier|classic|particle" data-theme="light|dark">` 切换变量。

| 风格 | 白天强调           | 夜晚强调  | 背景气质                                                |
| ---- | ------------------ | --------- | ------------------------------------------------------- |
| 蓝图 | 线稿青 `#0D99FF`   | `#5EB8C6` | 图纸网格底 + swarm 光标共建                             |
| 静奢 | 氧化铜金 `#8f7355` | `#a68968` | 实体底 + Canvas 氛围                                    |
| 经典 | Teal `#0f766e`     | `#14b8a6` | 透明底 + Vanta（Waves / Birds）                         |
| 粒子 | 青石 `#2d6a7a`     | `#5eb8c6` | 暖纸 / 深空底 + 全屏 WebGL 粒子云背景（章节剪影 morph） |

新增组件样式时，优先写到对应风格的 `uno.ts`，再在根 `uno.config.ts` 中 spread。

### Demo 主题桥接（Phase 9）

6 个共享 Demo 从 ASTRA 移植而来，原本引用只在 `.astra-root` 下定义的变量（`--neon-cyan` / `--text-dim` / `--radius-md` / `--font-mono` …）。弹框 Portal 到 `<body>` 后这些变量在 5 套风格里全部失效，叠加硬编码深色霓虹，浅色主题下出现「深底 + 深字」。

- `styles/shared/demos/demo-tokens.css`：在 `[data-demo-theme]`（`DemoPreview` 宿主）上把整套遗留变量映射到当前风格的 `--theme-accent` / `--text-*` / `--glass-*` / `--color-background`；状态色与 `--demo-ink` 混合，浅色主题自动变深、深色主题自动变浅。
- 6 份 Demo CSS 的硬编码色已全部替换为 `--demo-*` token 与 `color-mix()`，无残留裸色值。
- `lib/demo-theme.ts`：ECharts / 2D Canvas / R3F 材质无法解析 `var()`，由 `readDemoPalette()` 读取同一组基础 token 并解析成具体 `rgb()` / `rgba()`，保证 CSS 与画布配色同源。
- 3D 工厂的舞台底色、状态灯、轨道与机械手强调色跟随主题；工业金属材质是物理固有色（albedo），不随主题染色。
- 5 套风格 × 明暗 2 态的量化走查：正文 / 次级 / 标题 / 强调 / 危险 / 警示等 9 项指标全部 ≥ 4.5:1（最低 4.66:1）；只调整 `[data-demo-theme]` 作用域内的语义色，不改站点级 `--theme-accent`。

---

## 交互组件

| 组件                           | 位置                            | 说明                                                                              |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------------------------- |
| `StyleRail`                    | 桌面左侧中部 / 移动端左侧细边条 | 桌面竖排切换 5 套风格（当前标签页整页跳转）；<768px 收成 30px 细边条 + 左滑抽屉   |
| `ProjectModalHost`             | 全局 Portal                     | 项目详情 → 关联 Demo → 弹窗内内联预览；蓝图绘制页仍保留「实验室」列表弹框视图     |
| `LabSection`                   | 四锚点主题 `#lab` 区块          | 与「作品」并列的一级区块，平铺 6 个 Demo 卡片；`returnTo: lab` 返回时直接关闭弹框 |
| `LabButton`                    | 蓝图绘制页右上角控件区          | 绘制阶段的 compact 入口，打开全部 6 个 Demo 的列表弹框                            |
| `SkillShareRail`               | 右侧中部                        | AI 圆形按钮；悬停提示；点击复制 Skill 提示词                                      |
| `LocaleToggle` / `ThemeToggle` | 导航栏                          | 语言 / 主题                                                                       |
| `BackToTop`                    | 右下角                          | 滚动超过阈值后显示                                                                |
| `CookieConsent`                | 底部                            | 同意偏好 `portfolio-cookie-consent`                                               |

---

## 代码规范与 Git

Prettier · ESLint · Husky · lint-staged（`.lintstagedrc.mjs`，跳过 `vendor/` 与 `*.min.js`）· Commitlint。

提交说明需含中文，且 header ≤ 80、subject ≤ 72：

```bash
git commit -m "feat: 拆分静奢与经典风格包"
git commit -m "docs: 更新 README"
git commit -m "ci: 增加质量门禁与组件单测"
```

---

## 测试

| 层级     | 工具                     | 范围简述                                              |
| -------- | ------------------------ | ----------------------------------------------------- |
| 单元测试 | Vitest + Testing Library | `lib/*`、chrome 控件、CookieConsent、SkipLink 等      |
| E2E      | Playwright               | 首页跳转、多风格加载、主题/语言、风格轨、导航、Cookie |

覆盖率报告：`npm run test:coverage` → `coverage/`（已 gitignore）。

---

## 构建与部署

### 作者本仓库 / 本地生产预览

```bash
npm run build && npm start   # 标准 Next.js
npm run preview              # 模拟 GitHub Pages 静态站（推荐）
```

| Workflow                       | 触发               | 作用                                         |
| ------------------------------ | ------------------ | -------------------------------------------- |
| `.github/workflows/ci.yml`     | PR / 推送 `main`   | lint · typecheck · 单元测试 · E2E（Node 22） |
| `.github/workflows/deploy.yml` | 推送 `main` / 手动 | `GITHUB_PAGES=true` 构建并部署 GitHub Pages  |

```bash
GITHUB_PAGES=true npm run build   # 产物在 out/；basePath 一般为 /portfolio
```

### 复用模板的人如何上线

1. 代码推到**你自己的** GitHub 仓库（不要一直指向本模板 `origin`，除非你故意 fork 同步）
2. **Settings → Pages → Source** 选 **GitHub Actions**
3. 确认 Actions 里 **Deploy to GitHub Pages** 成功
4. 打开 `https://<user>.github.io/<repo>/`

备选：**Vercel** Import 仓库即可（通常不要设 `GITHUB_PAGES=true`）。  
完整小白步骤由 Skill 的 `go-live.md` 携带，README 不替代逐步确认。

---

## 相关链接

- 本仓库：[Jader-S/astra-portfolio](https://github.com/Jader-S/astra-portfolio)（private）
- 本地运行：`npm run dev` 后访问 `/astra`、`/blueprint`、`/atelier`、`/classic`、`/particle` 等主题路由
- 技术日志：18 篇 MDX 在 `content/blog/`，由 `npm run gen:blog-content`（`predev` / `prebuild` 自动执行）生成 `data/blog-content.generated.json`，5 主题点击卡片在当前页弹框阅读；改动 MDX 后重跑该命令即可
- 模板来源：[Luzhaotian/portfolio](https://github.com/Luzhaotian/portfolio)（MIT，`LICENSE` 保留原作者版权）
- Hero 卡片环绕：[@fxshelf/card-orbit](https://github.com/Luzhaotian/fxshelf/tree/main/packages/card-orbit)
- 风格扩展说明：[`styles/README.md`](./styles/README.md)
- 内容模板：[`site-content.yaml`](./site-content.yaml)
- 上线指引（Skill）：[`go-live.md`（蓝图）](./.cursor/skills/portfolio-blueprint/references/go-live.md)
- 技术栈：Next.js 15 · React 19 · UnoCSS · Vitest · Playwright

## License

见 [LICENSE](./LICENSE)。
