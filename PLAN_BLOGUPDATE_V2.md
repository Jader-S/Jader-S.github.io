# PLAN_BLOGUPDATE_V2 — blogUpdate 改造需求梳理与分期计划

> 状态：**4 项主决策已拍板 · 命名表待确认 · 未改动任何代码**
> 创建：2026-11-13 ｜ 范围：`E:\Jader\blogUpdate`（Next 15 / React 19 / UnoCSS / 5 主题）
> 本轮产出只有这份文档，代码一行未动。需求确认后按 Phase 分步执行，每期单独验收。
> 2026-11-13 更新：Q1/Q2/Q3/Q4 均选方案 1（见 6.1），据此补充「3.2 默认命名总表」与「6.2 默认执行项」。

---

## 0. 先看这个：一个影响判断的发现

你反馈的「博客关联 CSDN」「作品指向 jaderai.cn」，与**当前源码**不完全一致：

| 现象     | 源码现状                                                                                                 | 旧构建 `out/`（2026-11-12 19:49）                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 博客来源 | 提交 `41b7752` 已改为 `content/blog/*.mdx` 本地静态内容，4 主题内渲染                                    | `out/_next/static/chunks/286.*.js` 里 15 条 `url: "https://jaderai.cn/blog/<slug>"`，且被渲染成可点链接 |
| CSDN     | `scripts/fetch-csdn-blogs.mjs` 默认禁用（`ALLOW_CSDN_FETCH !== "1"` 直接退出），运行时不访问任何外部平台 | 旧数据里带 `csdnProfile` / `blog.csdn.net`                                                              |
| 项目描述 | 源码 `lib/i18n/locales/*.ts` 已无 jaderai.cn                                                             | `out/_next/static/chunks/961.*.js` 仍写「纯静态部署在 jaderai.cn」                                      |

`out/` 已被 `.gitignore` 忽略，且 90d2d0f 起 dev/build 产物目录分离，**out/ 没有随源码更新**。如果你预览的是 `out/`（或某个静态托管的旧产物），看到的就是改造前的版本。

**已定（Q9 默认）**：Phase 0 用 `npm run dev` 验证并重建 `out/`，两种入口都覆盖；若能顺手确认当前入口更好。

无论入口是哪一个，第 1、4 条的最终动作不变：**彻底清掉 jaderai.cn / CSDN 的全部残留并重新构建**。

---

## 1. 八条需求 × 现状核查

| #   | 你的诉求                                                          | 现状 / 根因                                                                                                                                                                                                                                                                                                             | 是否已明确                          |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | 博客不关联 CSDN，改成主题内静态展示                               | 源码已是本地 MDX 静态页；残留：`data/blogs.ts` 与 `site-content.yaml` 各 15 条 `url` 字段、`fetch-csdn-blogs.mjs`、`npm run fetch:blogs`、停用的 workflow、README 3 处 CSDN 描述、`common.viewCsdn` / `csdn` i18n 键、`BuildPhase.tsx:172` 的 `id === "csdn"` 分支                                                      | ✅ 明确（清残留 + 本地化）          |
| 2   | 切主题不开新标签；点 blog 直接弹框                                | 主题切换：`StyleRail.tsx:50-53` → `openStyleWindow()` → `lib/style.ts:49` `window.open(..., "_blank")`，是刻意设计且被单测/E2E/README 固化。blog 新标签两处：`classic/components/ContentCard.tsx:39,71` 的 `target="_blank"`、`blueprint/components/BuildPhase.tsx:173` 的 `window.open`                                | ✅ 已定：Q1 全弹框 + 删 4 条路由    |
| 3   | 移动端主题切换器不常驻，收进侧边、点击出现                        | `StyleRail.tsx:20-25` 是 `fixed left-3 top-1/2 z-[60]` 竖排常驻（约 36–40px 宽、260–280px 高），无任何断点/折叠 state；仅 `sm:left-4` 一个响应式。移动端还有右侧常驻的 `SkillShareRail`；astra 另有 `NavRail` 在 ≤768px 变底部 tab 栏                                                                                   | ✅ 已定：Q3 左侧细边条 + 抽屉       |
| 4   | 不要任何指向 jaderai.cn 的展示                                    | 见第 0 节。源码残留共 30 处 `url` 字段（均未作为 href 渲染）+ `PLAN_INTEGRATE_ASTRA.md:76` 文档描述；旧构建 `out/` 里是真外链                                                                                                                                                                                           | ✅ 明确（全清 + 重建）              |
| 5   | 四主题补 demo 预览；企业项目可点开看详情，详情含 demo，当前页打开 | 四主题作品区块**完全没有** demo / modal / 详情：blueprint、particle 的 `WorkSection` 企业项目渲染成不可点击 `<div>`；atelier `SelectedProjects` 无 `<a>`/onClick；classic `#enterprise` 卡片不可点击。全项目唯一项目详情在 astra（`ProjectDetailPage.tsx`），唯一 demo 层在 `styles/astra/src/demos/`（6 个 lazy 组件） | ✅ 已定：Q2 卡片→详情弹窗→内联 Demo |
| 6   | 5 主题路由统一，先给全量路由清单                                  | 见第 2 节。10 条 URL 路由（astra 缺 blog），4 套区块锚点各不相同，astra 无锚点、走 zustand 行星视图                                                                                                                                                                                                                     | ✅ 已定：Q4 保留 5 条主题路径       |
| 7   | 统一命名：astra【起源】→【关于我】，【实验室】保留，其余待定      | 见第 3 节命名拍板表                                                                                                                                                                                                                                                                                                     | ⚠️ 3.2 默认命名总表待确认           |
| 8   | 静奢背景「流星」的日文改成 jaderai                                | 实为 `GlyphRain` WebGL 字符雨。改点两处：`PageDroplets.tsx:33` 传入的 `charset="ｱｲｳｴｵ…"`（实际生效）、`canvasui/GlyphRain.tsx:73` 的 `DEFAULT_CHARSET`（兜底默认）。particle 无同类硬编码文字                                                                                                                           | ✅ 明确，字符集细节待定（Q7）       |

---

## 2. 全量路由 / 区块 / 名称清单（第 6 条交付）

### 2.1 URL 路由表（共 10 条）

| #   | URL                      | 文件                                 | 类型         | 备注                                                                                             |
| --- | ------------------------ | ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------ |
| 1   | `/`                      | `app/page.tsx`                       | 客户端重定向 | 内联脚本读 `localStorage["portfolio-style"]` 后 `location.replace` 到主题路径；默认 `/blueprint` |
| 2   | `/blueprint`             | `app/blueprint/page.tsx`             | 主题首页     | 默认主题，桌面先播绘制动画 `BuildPhase`，移动端直接 `SettledHome`                                |
| 3   | `/atelier`               | `app/atelier/page.tsx`               | 主题首页     | 静奢                                                                                             |
| 4   | `/classic`               | `app/classic/page.tsx`               | 主题首页     | 经典                                                                                             |
| 5   | `/particle`              | `app/particle/page.tsx`              | 主题首页     | 粒子                                                                                             |
| 6   | `/astra`                 | `app/astra/page.tsx`                 | 主题首页     | 原生 R3F，`dynamic ssr:false`                                                                    |
| 7   | `/blueprint/blog/[slug]` | `app/blueprint/blog/[slug]/page.tsx` | 博客详情     | `<BlogPostPage theme="blueprint" />`                                                             |
| 8   | `/atelier/blog/[slug]`   | `app/atelier/blog/[slug]/page.tsx`   | 博客详情     | 同上，theme=atelier                                                                              |
| 9   | `/classic/blog/[slug]`   | `app/classic/blog/[slug]/page.tsx`   | 博客详情     | 卡片带 `target="_blank"`                                                                         |
| 10  | `/particle/blog/[slug]`  | `app/particle/blog/[slug]/page.tsx`  | 博客详情     | 同上，theme=particle                                                                             |
| —   | `/astra/blog/[slug]`     | **不存在**                           | —            | astra 的「日志」行星直接 `window.location.href = "/blueprint"` 离开太空主题                      |
| —   | `/blog`                  | **不存在**                           | —            | `content/blog/` 只是 15 个 MDX 内容文件，由 `components/BlogPostPage.tsx` 用 `fs.readFile` 读    |

补充：

- `next.config.ts` **无** redirects / rewrites；`GITHUB_PAGES=true` 构建时整体加 `/portfolio` basePath（`lib/site.ts`）。
- 4 个 blog 详情页内容完全相同，仅 `THEME` 常量不同；`app/layout.tsx` 挂 I18nProvider + SkipLink + 3 个 FOUC 初始化脚本，**不挂 StyleRail**。
- 主题记忆 key：`portfolio-style`（`lib/style.ts:16`）；另有 `portfolio-theme`（明暗）、`portfolio-locale`。

### 2.2 各主题首页区块 / 锚点对照

| 主题      | 区块顺序                                                                                      | 导航文案（zh）                                      |
| --------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| blueprint | `#top` → `#about` → `#work` → `#skills` → `#blog` → `#experience`                             | 首页 → 关于 → 作品 → 技能 → 博客 → 领域             |
| particle  | `#top` → `#about` → `#work` → `#skills` → `#blog` → `#experience`                             | 同 blueprint                                        |
| atelier   | `#top` → `#selected` → `#about` → `#work` → `#skills` → `#blog` → `#experience`               | 精选 → 关于 → 作品 → 技能 → 博客 → 领域             |
| classic   | Hero（**无 id**）→ `#about` → `#skills` → `#enterprise` → `#github` → `#blog` → `#experience` | 关于 → 技能 → 企业精选 → 开源项目 → 博客 → 经验领域 |
| astra     | 无 section/锚点，单 `/astra` 路由 + 6 个 zustand 行星视图                                     | 全景 / 起源 / 作品 / 实验室 / 日志 / 联络           |

### 2.3 astra 内部视图（非 URL 路由）

| 中文标签 | PlanetId   | 拉丁名      | 点击行为                                                                    |
| -------- | ---------- | ----------- | --------------------------------------------------------------------------- |
| 起源     | `about`    | ORIGO       | 3D 飞行 → `<AboutPage/>` 玻璃面板                                           |
| 作品     | `projects` | ARTIFEX     | 3D 飞行 → `<ProjectsPage/>` → 卡片再进 `<ProjectDetailPage/>`（局部 state） |
| 实验室   | `demos`    | FORGE       | 3D 飞行 → `<DemosPage/>`，内联 lazy demo 组件                               |
| 日志     | `blog`     | LOGOS       | **不飞行**，整页跳 `/blueprint`                                             |
| 联络     | `contact`  | ECHO        | 3D 飞行 → `<ContactPage/>`                                                  |
| 母星     | `home`     | ASTRA PRIME | 返航全景；导航轨过滤掉此项，HUD 显示「全景」                                |

`PLANETS[].route` 字段（`/about`、`/projects` …）是配置残留，**代码里从未读取**（`blog` 的 route 甚至写着 `/blueprint`）。

### 2.4 三种「统一」方向（Q4 待拍板）

1. **保留 5 条主题路径**，补齐各主题缺失的能力（astra 补 blog / demo 入口），并统一 5 套的区块顺序与命名 —— 改动最可控，主题仍是独立 URL。
2. **收敛成单一 `/` + `?style=xxx`**，主题只作为状态，内容路由全局唯一（`/blog`、`/projects`）—— 路由最干净，但 `styleInitScript` / `StyleRail` / E2E / basePath 全要重写，且 5 套特效引擎切换时的清理风险最高。
3. **主题路径保留，内容路由去主题前缀**：`/blog/[slug]`、`/projects/[id]` 全局共享，视觉由 `portfolio-style` 决定 —— 折中，但弹框化后内容路由本来就可能删掉。

> 提示：若 Q1 选「博客全改弹框」，10 条路由会直接减到 6 条（`/` + 5 主题页），「路由统一」的复杂度大幅下降。

---

## 3. 命名拍板表（第 7 条交付）

**已定**：astra「起源」→「关于我」；astra「实验室」保留。
**改点**：`styles/astra/src/config/site.ts:82`（`label.zh`）、`styles/astra/src/i18n/zh.ts:5`（`nav.about`）、`en.ts` 对应项。

| 层 / 位置                         | 现值                                                    | 建议                          | 你的决定 |
| --------------------------------- | ------------------------------------------------------- | ----------------------------- | -------- |
| astra `nav.about` / ORIGO         | 起源                                                    | **关于我**（已定）            | ✅       |
| astra `nav.demos` / FORGE         | 实验室                                                  | **实验室**（已定保留）        | ✅       |
| astra `nav.projects` / ARTIFEX    | 作品                                                    | 作品 / 企业项目 / 项目详情    | ☐        |
| astra `nav.blog` / LOGOS          | 日志                                                    | 日志 / 博客 / 技术笔记        | ☐        |
| astra `nav.contact` / ECHO        | 联络                                                    | 联络 / 联系我                 | ☐        |
| astra `nav.home` / ASTRA PRIME    | 全景 / 母星                                             | 统一成「首页」或「全景」      | ☐        |
| 四主题 `nav #about`               | 关于                                                    | 关于我（与 astra 一致）       | ☐        |
| 四主题 `nav #work`                | 作品                                                    | 实验室 / 企业项目 / 作品      | ☐        |
| 四主题 `nav #blog`                | 博客                                                    | 日志 / 技术笔记 / 博客        | ☐        |
| 四主题 `nav #experience`          | 领域                                                    | 经验领域 / 领域               | ☐        |
| atelier `nav #selected`           | 精选                                                    | 精选 / 并入「作品」           | ☐        |
| classic `#enterprise` / `#github` | 企业精选 / 开源项目                                     | 合并成「作品」或保留两段      | ☐        |
| 主题显示名 `t.style`              | 蓝图 / 静奢 / 经典 / 粒子 / 太空                        | 是否改成更直白的命名          | ☐        |
| 主题 URL slug                     | `/blueprint` `/atelier` `/classic` `/particle` `/astra` | 保留 or 语义化（如 `/space`） | ☐        |
| 通用按钮 `common.viewCsdn`        | 「查看博客」                                            | 随 Q6 一起删/改               | ☐        |

### 3.2 默认命名总表（Q1–Q4 拍板后收敛，待你一句确认）

| 层 / 位置                                              | 现值                                       | 默认定案         | 理由                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| astra `ORIGO`                                          | 起源                                       | **关于我**       | 你已定；改 `site.ts:82` + `zh.ts:5` + `en.ts`                                                                    |
| astra `FORGE`                                          | 实验室                                     | **实验室**       | 你已定保留                                                                                                       |
| astra `ARTIFEX`                                        | 作品                                       | 作品             | 保留，点进项目详情面板（Q2 方案 1）                                                                              |
| astra `LOGOS`                                          | 日志                                       | 博客             | 与四主题统一；Q1 后改为弹框，不再跳 `/blueprint`                                                                 |
| astra `ECHO`                                           | 联络                                       | 联系我           | 语义直白，与「关于我」成套                                                                                       |
| astra `ASTRA PRIME`                                    | 全景 / 母星（两种叫法）                    | 统一「全景」     | 去掉「母星」，NavRail 与 PLANETS 对齐                                                                            |
| 四主题 `#about`                                        | 关于                                       | 关于我           | 与 astra 一致                                                                                                    |
| 四主题 `#work`                                         | 作品                                       | 作品             | 卡片弹详情 + 内联 Demo（Q2 方案 1）                                                                              |
| 四主题 `#blog`                                         | 博客                                       | 博客             | 保留；Q1 后由独立页改弹框                                                                                        |
| 四主题 `#experience`                                   | 领域                                       | 经验领域         | 与 classic 现有文案一致                                                                                          |
| atelier `#selected`、classic `#enterprise` / `#github` | 三段式                                     | **并入 `#work`** | 四主题统一 6 段顺序 `#top → #about → #work → #skills → #blog → #experience`；开源项目作为 `#work` 内一组卡片保留 |
| 主题显示名 / URL slug                                  | 蓝图 / 静奢 / 经典 / 粒子 / 太空；5 条路径 | **全部保留**     | Q4 方案 1；改路径要处理旧链 404 与 E2E，收益低                                                                   |
| `common.viewCsdn`                                      | 「查看博客」                               | 删除该键         | 随 Q6 全清                                                                                                       |

**两点边界说明**：

1. astra 是 3D 行星式、无 section 锚点，「统一」对它只指**导航语义与名称**，不强行造锚点；astra 保留「作品」「实验室」两个独立行星，四主题则合并为一个「作品」弹窗（内含 Demo），这是 Q2 方案 1 的直接结果。
2. 四主题目前**没有独立「联系我们」区块**（联系方式散在 footer）。默认不新增，保持 6 段结构；若你要补，放 Phase 5 一起做。

---

## 4. Demo 与项目数据现状（第 5 条依据）

**6 个 demo 组件**（`styles/astra/src/demos/registry.ts`，`React.lazy`）：

| slug                 | 标题                           | 技术风险                                                            |
| -------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `schneider-poi-perf` | Schneider POI · Before / After | 低                                                                  |
| `power-grid-flow`    | 施耐德 · 配电回路电流动画      | 低（ECharts/SVG）                                                   |
| `echarts-magnifier`  | 施耐德 · ECharts 像素放大镜    | 低（ECharts）                                                       |
| `conference-board`   | 会议编排 · 周视图看板          | 低                                                                  |
| `lianhang-dashboard` | 联夯 · 可视化大屏              | 低                                                                  |
| `factory-line`       | 3D 工厂 · 流水线协同           | **高**：R3F + 依赖 astra 的 `useStore.heavy3DDemoActive` + 专属 CSS |

**现成的「项目 ↔ demo」关联**（`styles/astra/src/i18n/zh.ts:178-249`，可直接提炼成统一数据层）：

| 项目                                       | 关联 demo                                                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 施耐德 · POI 中低压配电 (`poiConfigTools`) | `power-grid-flow`、`echarts-magnifier`                                                                    |
| 氪邦 · 智慧会议子系统 (`smartMeeting`)     | `conference-board`                                                                                        |
| 联夯 · 首都航天机械 (`aerospaceLine`)      | `factory-line`、`lianhang-dashboard`                                                                      |
| Skill QA Agent (`github`)                  | `embedUrl: "qa-agent/index.html"` — **该静态产物已不存在**（`public/qa-agent/` 被删），当前必定走错误兜底 |

四主题统一数据层 `data/projects.ts` 只有 `id / tech / link / highlight`，名称与描述在 `lib/i18n/locales/*.ts`，**没有详情正文、没有 demo 关联字段** —— Phase 4 要先扩数据模型。

**已知技术债**（Phase 4 前需先验证）：

- `FactoryLine` 与 astra 的 zustand store / 双 WebGL 互斥逻辑耦合，抽到共享层要解耦；
- `ProjectEmbed.tsx:132,164` 与 `ProjectDetailPage.tsx:142` 仍有 `target="_blank"`，与「当前页打开」冲突；
- `DemoStage` 是平移缩放容器非预览器，四主题复用时要决定 demo 是「弹窗内嵌」还是「详情弹窗内切换」。

---

## 5. 分期计划（确认需求后逐期执行，不一次性交付）

| Phase                 | 内容                                                                                                                                                                                                                          | 主要文件                                                                                                                                                                                                                    | 验收                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **0 基线**            | 记录 `typecheck / lint / test / e2e / build` 基线；确认预览入口；必要时重建 `out/`                                                                                                                                            | —                                                                                                                                                                                                                           | 基线数据留档，不动业务代码                                                                 |
| **1 低风险修正**      | 1a 主题切换改当前页（含单测/E2E/README 同步）<br>1b 去掉 blog 的两处新标签<br>1c 清 jaderai.cn / CSDN 全部残留（数据、脚本、npm script、workflow、README、i18n、文档）<br>1d 静奢字符集改 JADERAI                             | `StyleRail.tsx`、`lib/style.ts`、`StyleProvider.tsx`、`ContentCard.tsx`、`BuildPhase.tsx`、`data/blogs.ts`、`site-content.yaml`、`scripts/`、`package.json`、`README.md`、`lib/i18n/*`、`PageDroplets.tsx`、`GlyphRain.tsx` | 5 主题切换不开新标签；全仓无 jaderai.cn / CSDN 运行时痕迹；静奢背景为 JADERAI 字形；测试绿 |
| **2 博客弹框化**      | 抽共享 `BlogModal`（构建时静态内容 + 客户端弹框），5 主题统一；astra「日志」不再跳 `/blueprint`；按 Q1 决定 4 条 `blog/[slug]` 去留                                                                                           | `components/`、`app/*/blog/[slug]/`、`BlogSection.tsx` ×4、`NavRail.tsx`、`Planet.tsx`、`FallbackRoute.tsx`                                                                                                                 | 5 主题点博客都在当前页弹框；无新标签；深链策略明确                                         |
| **3 移动端切换器**    | 按 Q3 形态实现抽屉/浮层，<768px 默认收起；处理 astra 底部 tab 与 `SkillShareRail` 的层级冲突；补键盘/无障碍                                                                                                                   | `StyleRail.tsx`、`lib/breakpoints.ts`、各主题 NavBar、`hud.css`                                                                                                                                                             | 390px / 768px 两档走查，主题切换可达且不遮挡内容                                           |
| **4 Demo + 项目详情** | 4a 扩 `data/projects.ts` 数据模型（详情字段 + demo slug）<br>4b 抽共享 demo 层（含 R3F 解耦验证）<br>4c 共享 `ProjectDetailModal`（项目详情 + demo 列表 + 当前页内联预览）<br>4d 四主题作品卡片接上；处理 `qa-agent` 失效产物 | `data/projects.ts`、`lib/i18n/*`、`styles/shared/`、`styles/astra/src/demos/`、`WorkSection.tsx` ×2、`SelectedProjects.tsx`、`WorkIndex.tsx`、`ProjectsSection.tsx`                                                         | 5 主题企业项目均可点开详情、内含 demo、当前页预览；无新标签                                |
| **5 路由与命名统一**  | 按 Q4 + 第 3 节拍板表统一 URL / 锚点 / 文案；旧路径加重定向或 alias；更新测试与文档                                                                                                                                           | `app/`、`styles/registry.ts`、`lib/style.ts`、`styles/*/meta.ts`、`lib/i18n/*`、`styles/astra/src/config/site.ts`                                                                                                           | 5 主题路由/命名表一致；旧链不 404                                                          |
| **6 全量验收**        | typecheck / lint / test / e2e / build；5 主题 × 桌面/移动端走查；重建静态产物                                                                                                                                                 | —                                                                                                                                                                                                                           | 全绿 + 视觉走查记录                                                                        |

> 每期结束单独提交，你确认后再开下一期。Phase 1 可在需求部分确认后先启动（1c/1d 无歧义）。

---

## 6. 决策记录与默认执行

### 6.1 已拍板（2026-11-13）

| 项     | 决定                                                      | 直接后果                                                                                                                  |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Q1** | **① 全改弹框并删 4 条 `blog/[slug]` 路由**                | 5 主题博客都在当前页弹框读本地 MDX；astra「日志」改弹框、不再跳 `/blueprint`；URL 路由 **10 条 → 6 条**（`/` + 5 主题页） |
| **Q2** | **① 作品卡片 → 详情弹窗（含 Demo 列表）→ 弹窗内内联预览** | 四主题复用 astra 的 6 个 demo；企业项目详情需扩 `data/projects.ts` 数据模型；`factory-line` 需解耦                        |
| **Q3** | **① 移动端左侧细边条 + 点击展开抽屉**                     | <768px 默认收成 28–32px 图标条，点击滑出 5 主题，遮罩/选中收起；需避让 astra 底部 tab 与右侧 `SkillShareRail`             |
| **Q4** | **① 保留 5 条主题路径，统一区块顺序与命名**               | 不引入 `?style=xxx`；四主题统一 6 段顺序（见 3.2）；旧链不 404；`styleInitScript` / basePath 基本不动                     |

> 2.4 节「具体保留哪几条」由此定案：`/` + `/blueprint` + `/atelier` + `/classic` + `/particle` + `/astra`，共 6 条。

### 6.2 默认执行（未提异议即按此）

- **Q5 切换方式**：整页导航 `location.assign` / 原生 `<a href>`，**不用** `router.push`。p5 / vanta / R3F / WebGL 字符雨都有全局实例与 animation loop，整页导航最稳、无残留；无刷新软导航列为后续可选优化。
- **Q6 清理力度**：**全清**。删 `data/blogs.ts` 与 `site-content.yaml` 的 30 处 `url`、删 `scripts/fetch-csdn-blogs.mjs`、`package.json` 的 `fetch:blogs`、停用 workflow、README 3 处 CSDN 描述、`viewCsdn`/`csdn` i18n 键、`BuildPhase.tsx:172` 的 csdn 分支、`PLAN_INTEGRATE_ASTRA.md:76`，并重建 `out/`。
- **Q7 静奢字符集**：`JADERAIjaderai0123456789*+-<>·.`（保留字符雨质感；纯 7 字母会明显变单调）。两处都改：`PageDroplets.tsx:33` 与 `GlyphRain.tsx:73`。
- **Q8 项目详情内容**：由我从现有 i18n 描述 + 已落地性能数据（配电树 72s→2.1s、跳转 14s→1.2s、JS Heap 4GB OOM 归零等）扩写成「背景 / 职责 / 技术栈 / 成果 / 关联 Demo」；`qa-agent/index.html` 失效产物在 Phase 4 一并处理。
- **Q9 预览入口**：不再单独追问。Phase 0 用 `npm run dev` 验证并**重建 `out/`**，两种入口都覆盖。

### 6.3 仍需你确认

- **3.2 默认命名总表**：回「同意」或标出要改的行 —— 这是动代码前最后一道确认。
- 四主题是否要新增独立「联系我们」区块：默认**不加**（保持 6 段）；要加请一并说。

---

## 7. 不在本轮范围

- 不改任何代码、不跑构建、不提交；
- 不重写 ASTRA 序章叙事 / 15 篇博客正文（`PLAN_INTEGRATE_ASTRA.md` 的 Phase 3）；
- 不处理 GitHub Pages / Cloudflare 部署链路（除非 Q9 确认需要重建静态产物）。
