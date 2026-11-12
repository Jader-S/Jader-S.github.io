/**
 * 技能数据：只管理「结构」——分类 id、每个分类下的技能 id 与展示顺序。
 *
 * 分类名与技能标签的中英文文案不在这里，而在 lib/i18n/locales/ 中：
 *   - 分类名 → zh.ts / en.ts 的 skills.categories.<分类id>.name
 *   - 技能标签 → skills.categories.<分类id>.skills.<技能id>
 *   - 例：react18 → skills.categories.coreFrameworks.skills.react18 = "React 18"
 *
 * 类型绑定：data 里每个 id 都必须在 zh / en 两份文案中存在，漏写会编译报错。
 *
 * 内容源：site-content.yaml（同步自 E:\Jader\blog\src\i18n\zh.ts 的 about.skills / tags）
 *
 * ── 如何新增一个技能 ─────────────────────────────────────────────
 *   1. 在对应分类的 skillIds 里加一个 id（如 "vitePlugin"）
 *   2. 保存后 tsc 会报错，提示 zh.ts、en.ts 缺该 id 的标签
 *   3. 到 locales 该分类的 skills 下补上标签文案，报错即消失
 * ── 展示规则 ─────────────────────────────────────────────────────
 *   第一个分类（coreFrameworks）在页面上渲染为大卡片（Bento 主格），
 *   其余分类为小卡片；分类与技能的展示顺序 = 数组顺序。
 */

export interface SkillCategory<
  Id extends string = string,
  SkillId extends string = string,
> {
  /** 唯一 id（驼峰命名），对应 i18n 文案 skills.categories 下的 key */
  id: Id;
  /** 该分类下的技能 id 列表（决定展示顺序），对应 skills.categories.<id>.skills 下的 key */
  skillIds: SkillId[];
}

/** 校验数组元素形状，同时保留 id 字面量类型（用于推导 id 联合类型，供文案查找表类型绑定） */
function defineCategories<const T extends readonly SkillCategory[]>(items: T): T {
  return items;
}

/** 技能分类（页面「技术栈」Bento 区块；第一项渲染为大卡片，其余为小卡片） */
export const skillCategories = defineCategories([
  {
    // 核心框架（Core Frameworks）—— 大卡片
    id: "coreFrameworks",
    skillIds: ["react18", "vue23", "typescript", "r3f", "zustand"],
  },
  {
    // 构建与工程化
    id: "buildTools",
    skillIds: ["vite", "webpack", "eslint", "vitest", "mdx"],
  },
  {
    // 数据可视化与 3D
    id: "dataVisualization",
    skillIds: ["threeJs", "echarts", "svg", "gsap", "canvas"],
  },
  {
    // 性能治理
    id: "performance",
    skillIds: ["profiling", "rendering", "memory", "virtualization"],
  },
  {
    // AI 工程与 Agent
    id: "aiEngineering",
    skillIds: ["langgraph", "mcp", "aiAgent", "copilot", "sse"],
  },
  {
    // 后端协作与全栈
    id: "backend",
    skillIds: ["fastapi", "postgresql", "sqlalchemy", "docker", "pytest"],
  },
  {
    // 工业互联网与实时
    id: "industrial",
    skillIds: ["digitalTwin", "signalr", "websocket", "industrialProtocols"],
  },
  {
    // 工程实践
    id: "practices",
    skillIds: ["git", "cicd", "designDocs", "unitTesting", "codeReview"],
  },
]);

/** 技能分类 id 联合类型（供 i18n 文案查找表类型绑定） */
export type SkillCategoryId = (typeof skillCategories)[number]["id"];
/** 全部技能 id 联合类型 */
export type SkillId = (typeof skillCategories)[number]["skillIds"][number];

/** 某个分类下的技能 id 联合类型（用于收紧该分类的文案查找表类型） */
export type CategorySkillIds<C extends SkillCategoryId> = Extract<
  (typeof skillCategories)[number],
  { id: C }
>["skillIds"][number];
