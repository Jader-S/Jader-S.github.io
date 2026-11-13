# PLAN_BLOGUPDATE_V2 — blogUpdate 改造需求梳理与分期计划

> 状态：**Phase 1（`3b238b1`）+ Phase 2（`2dc4734`）+ Phase 3（`ef1879e`）+ Phase 4（`c0e171a`）+ Phase 5（`4a25c13`）+ Phase 6（`70acb55`）已交付 · 全部分期完成**
> 创建：2026-11-13 ｜ 范围：`E:\Jader\blogUpdate`（Next 15 / React 19 / UnoCSS / 5 主题）
> 需求确认后按 Phase 分步执行，每期单独验收、单独提交。
> 2026-11-13 更新 1：Q1/Q2/Q3/Q4 均选方案 1（见 6.1），补充「3.2 默认命名总表」与「6.2 默认执行项」。
> 2026-11-13 更新 2：命名表按默认确认；Phase 1 完成并提交，验收结果见第 8 节。
> 2026-11-13 更新 3：Phase 2 完成并提交，路由 10 → 6 条、静态导出 24 → 9 页，验收结果见第 9 节。
> 2026-11-13 更新 4：Phase 3 完成并提交（移动端主题切换抽屉），验收结果见第 10 节。
> 2026-11-13 更新 5：Phase 4 完成并提交（共享项目详情 + 内联 Demo），验收结果见第 11 节。
> 2026-11-13 更新 6：Phase 5 完成并提交（命名 / 六段锚点 / 语言双轨统一），验收结果见第 12 节。

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

> ⚠️ 下表是 **Phase 2 改造前** 的快照（10 条）。4 条 `blog/[slug]` 已删除，实际只剩 6 条，见第 9 节。

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

### 6.3 已确认

- **3.2 默认命名总表**：用户确认按默认执行（2026-11-13）。
- 四主题暂不新增独立「联系我们」区块（保持 6 段）。

---

## 7. 分期边界（不在 Phase 1 范围）

- 不做博客弹框化（Phase 2）、移动端抽屉（Phase 3）、共享 Demo 与项目详情（Phase 4）、路由与命名统一（Phase 5）；
- 不重写 ASTRA 序章叙事 / 15 篇博客正文（`PLAN_INTEGRATE_ASTRA.md` 的 Phase 3）；
- 不处理 GitHub Pages / Cloudflare 部署链路。

---

## 8. Phase 1 交付记录（2026-11-13 · commit `3b238b1`）

**改动范围**：25 files，+324 / −471。

| 项            | 落地内容                                                                                                                                                                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1a 主题切换   | `lib/style.ts` 的 `openStyleWindow` → `goToStyle`（整页导航，导航函数可注入以便单测）；`StyleRail` 去掉 `target="_blank"`，改用原生 `<a href>`、仅当前主题阻止默认行为；`StyleProvider` 同步；单测 / E2E / README 断言一并更新                                             |
| 1b 博客链接   | classic `ContentCard` 按 `href` 是否站内决定是否新标签；blueprint `BuildPhase` 的 `open` 分支改 `location.assign`，顺手删掉死掉的 `csdn` 分支                                                                                                                              |
| 1c 外链清理   | 删 `data/blogs.ts` 的 `url` 字段与 15 条值、`site-content.yaml` 15 条 `url`、`scripts/fetch-csdn-blogs.mjs`、`npm run fetch:blogs`、停用的 `update-blogs.yml.disabled`、README 3 处 CSDN 描述、i18n 的 `viewCsdn` / `footer.csdn` 键、`PLAN_INTEGRATE_ASTRA.md` 的旧链说明 |
| 1d 静奢字符雨 | `PageDroplets.tsx` 的 `charset` 与 `GlyphRain.tsx` 的 `DEFAULT_CHARSET` 改为 `JADERAIjaderai0123456789*+-<>·.`                                                                                                                                                             |

**验收**

- `npm run typecheck` ✓（先清掉 `.next-dev/types/app/hmr-probe/` 里昨天 HMR 探针的残留类型，基线从 2 错降到 0）
- `npm run lint` ✓ 0 warning ｜ `npm run test` ✓ 16 files / 47 tests
- `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` ✓ 静态导出 24 页（含 15 篇博客）；`out/` 已重建为**无 basePath** 的根路径产物（面向 jaderai.cn），复验其中无 `jaderai.cn` / CSDN 字样
- 提交 hook（eslint --fix + prettier --write + commitlint）通过；提交后复验 typecheck / lint / test 全绿，工作区干净

**过渡措施（已在 Phase 2 移除）**：4 条 `blog/[slug]` 路由曾补 `generateStaticParams()`，否则 `output: "export"` 构建失败；Phase 2 删除路由时一并移除，同时清理了 `.next-dev/types/app/*/blog/` 的类型残留。

**未完成 / 风险**

- E2E 未跑通：本机缺 Playwright chromium，两条用例都在 `browserType.launch` 阶段失败（与改动无关，测试文件已正常加载）。装好浏览器后跑 `npm run test:e2e` 验证 `rails.spec.ts` 的同标签导航断言；已列入 Phase 6 全量验收。
- GitHub 外链仍保留 `target="_blank"`（外站，刻意保留）；站内链接已全部当前页打开。

**下一步（当时）**：Phase 2 博客弹框化 —— 删 4 条 `blog/[slug]` 路由、5 主题统一弹框读本地 MDX、astra「日志」不再跳 `/blueprint`。已完成，见第 9 节。

---

## 9. Phase 2 交付记录（2026-11-13 · commit `2dc4734`）

**改动范围**：37 files，+772 / −185。路由 **10 条 → 6 条**，静态导出 **24 页 → 9 页**。

| 项            | 落地内容                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2a 静态正文   | `scripts/gen-blog-content.mjs` 从 15 篇 MDX 去 frontmatter 生成 `data/blog-content.generated.json`（62 KB）；`predev` / `prebuild` 自动执行；`.prettierignore` 排除生成文件；`data/blog-content.ts` 暴露 `getBlogContent(slug)`                                                                                                                                          |
| 2b 共享弹框   | `lib/blog-modal.ts` 用 zustand 外部 store（`openBlog` / `openBlogIndex` / `closeBlog`）；`components/BlogModalHost.tsx` 用 `createPortal` 挂到 body，支持正文 / 列表两模式、Esc / 遮罩 / 关闭按钮、焦点陷阱、body 滚动锁定、`aria-modal`；`styles/shared/blog-modal.module.css` 用 `html[data-style]` 变量主题化并给 astra 做霓虹特化；挂在 `AppProviders` 供 5 主题共用 |
| 2c 四主题入口 | 4 个 `BlogSection` 的 `<a href>` 改 `<button onClick={openBlog}>`；classic `ContentCard` 新增 `onClick` 且优先于 `href`；blueprint `BuildPhase` 的 CUSTOM `open` action 由 `href` 改 `slug` 并调 `openBlog`（同步改 `portfolio-actions.js` 的 JSDoc 类型）                                                                                                               |
| 2d ASTRA 日志 | `Planet.tsx` / `NavRail.tsx` / `FallbackRoute.tsx` 三处 `window.location.href = "/blueprint"` 改 `openBlogIndex()`；`site.ts` 的 blog `route` 改 `/astra`（仅元数据）；删 astra i18n 过期的 `coming` 占位文案；更新 `AstraContentPanel` 注释                                                                                                                             |
| 2e 删路由     | 删 `app/{blueprint,atelier,classic,particle}/blog/[slug]/page.tsx` 与 `components/BlogPostPage.tsx`；`BlogPostReader` 改为弹框内正文组件（去掉 back 链接）；README / `PLAN_INTEGRATE_ASTRA.md` 同步                                                                                                                                                                      |

**两个架构决定**

- **用外部 store 而非 Context**：ASTRA 的 `<Canvas>` 走 R3F 独立 reconciler，React Context 穿透不可靠；blueprint 绘制动画也脱离 React 树发起 action。命令式 API 在任何位置都能触发弹框。
- **用静态生成数据而非运行时读文件**：5 个主题页都是 `"use client"` + `ssr:false` 动态导入，运行时拿不到 `node:fs`；项目又是 `output: "export"`，没有服务端可按需读文件。正文必须在 dev / build 前固化，同时天然兼容 basePath。

**验收**

- `npm run typecheck` ✓（清理 `.next-dev/types/app/*/blog/` 旧路由类型残留后通过，非源码问题）
- `npm run lint` ✓ 0 warning ｜ `npm run test` ✓ 18 files / **57 tests**（新增 10 个：弹框 6 + 四主题入口 4）
- `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` ✓ 静态导出 9 页，路由表仅 `/` + 5 主题 + `/_not-found`
- `out/` 已清空重建：无 `blog/` 目录、无 `/blog/` 深链、无 `jaderai.cn` / CSDN；15 篇正文已进客户端 bundle
- dev `:5555` 五主题均 200，旧深链 `/blueprint/blog/<slug>` 返回 404
- 提交 hook（eslint --fix + prettier --write + commitlint）通过；提交后复验 typecheck / lint / test 全绿，工作区干净

**未完成 / 风险**

- E2E 仍未跑通（本机缺 Playwright chromium，Phase 1 遗留）；弹框的**真实浏览器交互**尚未端到端验证，单测已覆盖核心逻辑。Phase 6 补 `blog-modal` E2E。
- 15 篇正文（原始 62 KB JSON）随 `AppProviders` 进入每个主题页首屏 bundle；后续可改成打开弹框时动态 import 优化。
- astra 的语言偏好存在自己的 zustand store，未与根 `I18nProvider` 同步，弹框在 astra 下的文案语言可能与星图 UI 不一致 —— Phase 5 统一命名时一并处理。
- 改动 `content/blog/*.mdx` 后需重跑 `npm run gen:blog-content`（或重启 dev / 重新 build，pre-hook 会自动执行）。

**当时的下一步**：Phase 3 移动端主题切换器抽屉（<768px 收成左侧 28–32px 细边条 + 点击展开），按 Q3 方案 1 执行 —— 已完成，见第 10 节。

---

## 10. Phase 3 交付记录（2026-11-13 · commit `ef1879e`）

**改动范围**：8 files，+665 / −56。

| 项            | 落地内容                                                                                                                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3a 样式文案   | 新建 `styles/shared/style-rail.module.css`（30px 细边条 / 遮罩 / 左滑面板 / 5 主题列表，走 `html[data-style]` 变量，含 astra 霓虹边框、reduced-motion、≥768px 隐藏规则）；`lib/i18n/types.ts` + zh/en 补 `railLabel` / `drawerTitle` / `openMenu` / `closeMenu` / `current` 五个键 |
| 3b 组件改造   | `StyleRail.tsx` 桌面竖排改 `hidden md:flex`（行为不变）；<768px 只露 30px 左侧细边条，点击 Portal 出左滑抽屉；遮罩 / Esc / 关闭按钮收起、Tab 焦点循环、焦点返回、body 滚动锁定、跨断点自动收起；选中当前主题 `preventDefault`，其他主题走原生 `href` 同标签整页跳转                |
| 3c 测试与文档 | `StyleRail.test.tsx` 从 1 → 5 用例；`e2e/rails.spec.ts` 新增 390×844 视口的 2 条用例；README 三处描述更新（并修正「项目详情已弹框」的超前表述，该项属 Phase 4）                                                                                                                    |

**两个架构决定**

- **显隐用 CSS 而非 JS 视口分支**：`StyleRail` 挂在 `AppProviders` 内会被 SSR。若首帧按 `window.innerWidth` 分支，服务端默认 mobile 与客户端 desktop 会产生 hydration mismatch，手机还会闪一下桌面竖栏。`useViewport()` 只用于「视口回到桌面时同步收起 state」，不参与渲染决策。
- **抽屉 Portal 到 `<body>`**：与博客弹框同理，particle 有 snap-scroll 容器、blueprint 绘制态有 transform 层，直接渲染会被裁剪。层级 `80`（遮罩）/ `60`（细边条）高于右侧 `SkillShareRail`（60）与 astra 底部 tab（`--z-panel: 20`），低于博客弹框（9999）。

**验收**

- `npm run typecheck` ✓ ｜ `npm run lint` ✓ 0 warning ｜ `npm run test` ✓ 18 files / **61 tests**（新增 4 个移动端抽屉用例）
- `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` ✓ 静态导出 9 页；`out/` 已清空重建，产物 CSS 含 `@media (min-width:768px){.style-rail_handle…,.style-rail_overlay…{display:none}}`
- dev `:5555` 五主题均 200；atelier / classic / particle / astra 的 SSR HTML 含细边条与 `md:flex`，blueprint 因 `ssr:false` 由客户端 chunk 渲染（已确认 5 个 page chunk 都含新文案）；五主题 SSR 无 `target="_blank"`
- 提交 hook 通过；提交后复验 typecheck / lint / test 全绿、工作区干净

**未完成 / 风险**

- 390px / 768px 的**真实浏览器视觉走查**未做：本机仍缺 Playwright chromium（Phase 1 遗留），新增 2 条移动端 E2E 与 Phase 2 的 `blog-modal` E2E 一并留到 Phase 6。CSS 断点规则与单测已覆盖逻辑，视觉需人工在 DevTools 设备模拟下确认。
- 抽屉底部 `JADERAI · STYLES` 为静态品牌字，不随 locale 变化（刻意）。
- `blueprint` 的 `BuildPhase` / `SettledHome` 与 `app/astra/page.tsx` 各自挂 `StyleRail`（`hideChrome` 跳过全局 chrome），5 主题共用同一实现，无重复挂载。

**当时的下一步**：Phase 4 共享 Demo + 项目详情 —— 已完成，见第 11 节。

---

## 11. Phase 4 交付记录（2026-11-13 · commit `c0e171a`）

**改动范围**：47 files，+1497 / −476（其中 21 个 demo 文件为 **100% rename**，无内容改动）。

| 项              | 落地内容                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4a 数据层       | 新建 `data/project-details.ts`：3 个企业项目 + 2 个开源项目的双语详情（背景 / 职责 / 成果数组）、6 个 Demo 的中英元数据、项目→Demo 关联、弹框 UI 文案。内容按 Q8 由现有 i18n 描述 + 已落地性能数据扩写；结构字段沿用 `data/projects.ts` 的 `tech`，不重复维护                                                                                                                                                     |
| 4b 共享 Demo 层 | `styles/astra/src/demos/` **整体移到** `styles/shared/demos/`；`DemosPage.tsx` 改引 `@/styles/shared/demos/registry`；新建 `components/DemoPreview.tsx`（lazy + Suspense + ErrorBoundary + 宽画布横滚）；`vitest.config.ts` 补 `@astra` alias；`qa-agent/index.html` 失效链路整条删除（i18n 的 `embedUrl` + 14 个 `embed*` 键、`ProjectDetailPage` 的 iframe 区块、`ProjectEmbed.tsx/.css`、types 的 embed 字段） |
| 4c 共享弹框     | 新建 `lib/project-modal.ts`（zustand 外部 store，closed / project / demo / demos 四视图 + 命令式 API）、`components/ProjectModalHost.tsx`（Portal、焦点陷阱、Esc / 遮罩 / 关闭、body 滚动锁）、`styles/shared/project-modal.module.css`；挂进 `AppProviders`（5 主题含 `hideChrome` 均可达）；与博客弹框互斥                                                                                                      |
| 4d 四主题接入   | blueprint / particle `WorkSection` 企业项 `<div>` → `<button>`；classic `ProjectsSection` 企业段传 `onClick`（复用 `ContentCard`）；atelier `SelectedProjects` 卡片整体可点 + 键盘可达、`WorkIndex.IndexRow` 支持 `onClick`；blueprint 绘制态画布按 board 的 `work-t~N` 元素 id 注册 interaction，企业项目 → 详情弹框、开源项目 → GitHub 新标签；四主题作品区与蓝图控件区加 `LabButton` 打开全部 Demo             |

**三个架构决定**

- **demo 物理移动而非复制**：21 个文件 100% rename，实现只有一份。`tsconfig` 的 `@astra/*` 是根级 `paths`，与引用方目录无关，所以 demo 内部 5 处 `@astra/i18n` / `@astra/ui` / `@astra/state` / `@astra/utils` 引用在 shared 目录下仍解析成功；`vitest.config.ts` 补 alias 时改用数组并把 `@astra/` 放在 `@/` 之前，避免 `@` 前缀抢先匹配。Git Bash 的 `mv` / `git mv` 被 Windows 文件锁挡住，最终用 PowerShell `Move-Item` 完成。
- **详情文案用 `{zh,en}` 结构化数据**：`LocaleMessages` 只放 UI 短文案；项目背景 / 成果等大段结构化内容放 `data/project-details.ts`，按 `useI18n().locale` 取，避免污染 i18n 类型系统。
- **两个弹框共用 shell**：`ProjectModalHost` 直接复用 `blog-modal.module.css` 的 `.overlay/.panel/.bar/.close/.scroll`，只扩展内容样式；两者都是 `z-index:9999`，因此在 project-modal store 里单向关闭博客弹框（`closeBlogModal()`），避免叠层。

**验收**

- `npm run typecheck` ✓ ｜ `npm run lint` ✓ 0 warning ｜ `npm run test` ✓ 20 files / **74 tests**（新增 13：弹框 7 + 四主题入口/画布 6）
- `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` ✓ 静态导出 9 页；**5 主题全部编译通过，证明 2 个 R3F / three Demo 在非 ASTRA 主题下也能打包**；首屏 JS 252 → 258 kB，Demo 组件仍是 lazy chunk
- `out/` 已清空重建：无 `qa-agent/index.html`、`jaderai.cn`、CSDN 字样；dev `:5555` 五主题均 200，5 个 page chunk 都含新弹框与 demo registry
- 提交 hook 通过；提交后复验 typecheck / lint / test 全绿、工作区干净

**未完成 / 风险**

- **真实浏览器交互未端到端验证**：本机仍缺 Playwright chromium（Phase 1 遗留）。构建成功只证明能编译；2 个 3D Demo 在四主题下的 WebGL 上下文、宽画布横滚、3D 场景与主题 CSS 的兼容，需人工走查或 Phase 6 补 E2E。
- **语言双轨**：`SchneiderPOI` / `EChartMagnifier` 的 `useT()` 读 ASTRA 自己的 zustand `prefs.language`，四主题切到英文时 Demo 内文案仍是中文；弹框外壳与详情已跟随根 `I18nProvider`。Phase 5 统一语言状态时一起处理。
- 蓝图绘制态画布交互依赖 `scene-builder.js` 的 `duplicate()` 任务 id 规律（`d:work:{i}` / `work-t~N`），若以后改 work board 结构需同步 `portfolio-actions.js`。
- ASTRA 自己的作品详情仍是 2D 面板（主题特色），但其中「关联 Demo」按钮已改为打开共享弹框内联预览；5 主题详情形态尚未完全一致，Phase 5 可再评估。
- `public/qa-agent/` 静态产物缺失是历史问题，本轮从代码侧彻底移除引用；`lib/skillShare.ts` 里 `scripts/sync-astra.mjs` 的失效路径属另一处历史文案，不在本期范围。

**当时的下一步**：Phase 5 路由与命名统一 —— 已完成，见第 12 节。

---

## 12. Phase 5 交付记录（2026-11-13 · commit `4a25c13`）

**改动范围**：29 files，+309 / −110（含 2 个新增测试文件）。

| 项                  | 落地内容                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5a astra 命名       | `config/site.ts` 的 PLANETS label：起源→关于我 / About me、日志→博客 / Blog、联络→联系我 / Contact me、母星→全景 / Overview；作品 / Projects、实验室 / Forge 保留。同步 astra `i18n/zh.ts` + `en.ts` 的 `nav.*` 与 home / about / blog / contact heading；`NavRail` / `Planet` / `FallbackRoute` / `CornerGauge` 标签全部跟随字典，FallbackRoute 去掉写死的 `.zh`                              |
| 5b 四主题文案与区块 | 根 `lib/i18n/locales/*`：关于→关于我、领域 / Fields→经验领域 / Domains；删除 `navClassic` 及 `types.ts` 对应字段（classic 改读 `t.nav`）。`nav` 统一 5 条 `#about / #work / #skills / #blog / #experience`（`#top` 由 Hero 承载）；blueprint / particle NavBar 的硬编码 `LABELS` 改读 `t.nav`；章节编号按新顺序重排 `01 ABOUT / 02 WORK / 02 · OPEN SOURCE / 03 SKILLS / 04 BLOG / 05 DOMAINS` |
| 5b 区块合并         | atelier `SelectedProjects` 的 `#selected`→`#work`、`WorkIndex`→`#work-index`，`Home.tsx` 顺序改为 Hero → 关于 → 作品（两段）→ 技能 → 博客 → 经验领域；`NavBar` 观察初始项 `selected`→`top`。classic `HeroSection` 补 `id="top"`，企业段改 `id="work"`，开源段保留 `id="github"` 作为作品内一组卡片，Home 顺序同上                                                                              |
| 5c 语言双轨         | `@astra/i18n` 的 `useT()` 改读根 `useI18n().locale`（唯一真源），astra `prefs.language` 退化为镜像；`NavRail` 语言按钮改调 `setLocale()`；`CornerGauge` / `Planet` 不再各自订阅 `prefs.language`；两个共享 Demo（SchneiderPOI / EChartMagnifier）的 `useT()` 因此跟随主站语言                                                                                                                  |
| 5d 旧锚点 alias     | 在合并后的 `#work` 内保留不可见 `<span id="selected" aria-hidden="true" />` 与 `aliasId="enterprise"`；`#github` 仍是真实 section id。`output:"export"` 下没有 redirects / rewrites，且 URL 路径本期无变化（Q4 保留 5 路径、Q1 已删博客深链），故用**静态别名锚点**让浏览器原生 hash 滚动兜底，不新增 alias 页、不加 hashchange JS                                                             |
| 5e 测试与文档       | 新增 `styles/astra/src/i18n/bridge.test.tsx`（语言桥接）、`components/SectionAliases.test.tsx`（3 例）；`lib/i18n/index.test.ts` 补命名表断言；`e2e/navigation.spec.ts` / `e2e/styles.spec.ts` 改新文案与新锚点；README 更新入口说明、两处区块顺序与「日志→博客」表述                                                                                                                          |

**三个架构决定**

- **语言只保留一个真源**：根 `I18nProvider.locale` 是唯一真源，astra 的 zustand `prefs.language` 不再驱动 UI。`useT()` 被 19 个 astra 组件与 2 个共享 Demo 调用，改 hook 内部实现比逐个改调用方风险低；`NavRail` 切换按钮改调 `setLocale()`，全站语言状态联动。
- **锚点 alias 用静态 DOM 而非运行时映射**：静态导出没有 rewrites / redirects，只要 DOM 里存在 `#selected` / `#enterprise`，浏览器原生就会滚到；加 hashchange 监听反而会在 `ssr:false` 的主题上出现「锚点尚未挂载」竞态。
- **classic 开源段保留独立 `id="github"`**：既是旧链接兜底，也避免把两组卡片硬塞进同一 section 破坏毛玻璃 / 透明交替节奏；它位于 `#work` 与 `#skills` 之间，概念上仍属「作品」区块。

**验收**

- `npm run typecheck` ✓ ｜ `npm run lint` ✓ 0 warning ｜ `npm run test` ✓ 22 files / **85 tests**（较 Phase 4 的 74 新增 11 个）
- `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` ✓ 静态导出 9 页；5 主题首屏 258 kB，与 Phase 4 持平（无新增运行时依赖）
- 本轮改动文件 `prettier --check` ✓；`out/` 清空重建后无 `jaderai.cn` / `blog.csdn` / `navClassic` / `qa-agent/index.html` 残留
- dev `:5555` 六条路径（含 `/`）均 200；提交 hook 通过；提交后复验 typecheck / lint / test 全绿

## 13 · Phase 6 全量验收（已交付 `70acb55`）

### 改动

- 安装 Playwright chromium（官方 CDN `cdn.playwright.dev` 在本机 `ECONNRESET` 反复失败，改用 `PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright` 镜像后装好 `chromium-1243` + `chromium_headless_shell-1243`）。
- 新增 `e2e/modals.spec.ts`：atelier 下验证「博客卡 → 当前页弹框（不跳路由）/ 项目卡 → 详情弹框 → 点 Demo → 内联预览（同页、可返回、Esc 关闭）」。
- 为稳定选择器，在 `BlogSection`（atelier / blueprint）、`SelectedProjects` 卡片、`ProjectModalHost` 的 demo 按钮、`DemoPreview` 容器加 `data-testid`（atelier/blueprint 博客卡 `blog-card`、atelier 项目卡 `project-card`、弹框内 demo 按钮 `demo-item`、预览容器 `demo-preview`）。

### 验收（真实浏览器，chromium headless）

- `npx playwright test` ✓ **20 passed（全绿，4 worker）**：
  - home 重定向 ×2、chrome 主题/语言切换 ×2、rails 主题切换同标签 + 移动端抽屉 + 剪贴板 ×4、navigation 桌面跳转 + 移动菜单 + cookie ×3、styles 五主题加载 + 六段统一布局 ×6、**modals 博客弹框 + 项目详情内联 Demo ×2**。
  - 首跑曾因改源码触发 dev server HMR 重编译、8 worker 并发打热路由出现 `page.reload` 超时（非断言失败）；服务热身后续跑 + 单 spec 复跑均稳定通过，确认为偶发抖动。
- 静/动/构建终检：`npm run typecheck` ✓ ｜ `npm run lint` ✓ 0 warning ｜ `npm run test` ✓ 22 files / **85 tests** ｜ `GITHUB_PAGES=true PAGES_REPO_NAME= npm run build` ✓ 9 页 / 首屏 258 kB ｜ 改动文件 `prettier --check` ✓ ｜ dev `:5555` 六路径 200 ｜ `out/` 清空重建无 `jaderai.cn` / CSDN / `navClassic` / `qa-agent` 残留。

### 真机验证覆盖（Phase 6 已闭环的项）

| 项                                                                  | 验证方式                           | 结果 |
| ------------------------------------------------------------------- | ---------------------------------- | ---- |
| 主题切换同标签（非新窗）                                            | rails.spec 桌面 + 移动             | ✓    |
| 移动端主题抽屉（收起 / Esc / 遮罩关闭）                             | rails.spec mobile                  | ✓    |
| 博客弹框（当前页、不跳路由、Esc 关闭）                              | modals.spec + 单测                 | ✓    |
| 项目详情弹框 + 内联 Demo 预览（同页、可返回）                       | modals.spec + 单测                 | ✓    |
| 五主题加载 + 统一六段布局（#about/#work/#skills/#blog/#experience） | styles.spec                        | ✓    |
| 语言切换跟随主站（astra 桥接根 locale）                             | chrome.spec locale + 单测          | ✓    |
| 命名统一（关于我 / 经验领域 / 博客 / 全景 / 联系我）                | styles.spec 锚点 + 单测 + 字典断言 | ✓    |

### 仍留到后续（非本期范围，非缺陷）

- 15 篇博客正文 62 KB JSON 随 `AppProviders` 进首屏 bundle，后续可改打开弹框时动态 import。
- ASTRA 作品详情保留 2D 面板（主题特色，关联 Demo 已走共享弹框），四主题用共享弹框，形态未强行统一。
- `lib/skillShare.ts` 里 `scripts/sync-astra.mjs` 历史失效路径未处理。
- 3D Demo（factory-line / lianhang-dashboard）在非 ASTRA 主题的 WebGL 上下文实机渲染：构建与 lazy 加载已验证，E2E 内联预览挂载已验证 `demo-preview` 容器出现，但真机 3D 画面需人工肉眼走查（headless 下 R3F 用 SwiftShader，画面正确性不在自动化断言内）。
