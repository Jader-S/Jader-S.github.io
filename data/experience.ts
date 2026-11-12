/**
 * 经验领域数据：只管理「结构」——领域 id、图标与展示顺序。
 *
 * 领域标题与描述的中英文文案不在这里，而在 lib/i18n/locales/ 中：
 *   - zh.ts / en.ts 的 experience.domains.<id> = { title, description }
 *   - 例：performance → experience.domains.performance
 *
 * 类型绑定：data 里每个 id 都必须在 zh / en 两份文案中存在，漏写会编译报错。
 *
 * 内容源：site-content.yaml（同步自 E:\Jader\blog\src\i18n\zh.ts 的 about.skills.groups）
 *
 * ── 如何新增一个领域 ─────────────────────────────────────────────
 *   1. 在下方数组里加一条：{ id: "xxx", icon: "🎯" }
 *   2. 保存后 tsc 会报错，提示 zh.ts、en.ts 缺少 xxx 的文案
 *   3. 到 locales 补上 { title, description }，报错即消失
 * ── 如何调整展示 ─────────────────────────────────────────────────
 *   改数组顺序 = 调卡片顺序；删条目 = 下架；换 icon = 换卡片图标。
 */

export interface ExperienceDomain<Id extends string = string> {
  /** 唯一 id（驼峰命名），对应 i18n 文案 experience.domains 下的 key */
  id: Id;
  /** 卡片左侧的图标 emoji（语言无关，中英文共用） */
  icon: string;
}

/** 校验数组元素形状，同时保留 id 字面量类型（用于推导 id 联合类型，供文案查找表类型绑定） */
function defineDomains<const T extends readonly ExperienceDomain[]>(items: T): T {
  return items;
}

/** 经验领域（页面「经验领域」区块，渲染顺序 = 数组顺序） */
export const experienceDomains = defineDomains([
  { id: "performance", icon: "⚡" }, // 性能治理与架构重构
  { id: "digitalTwin", icon: "🏭" }, // 数字孪生与工业互联网
  { id: "smartOffice", icon: "🏢" }, // 智慧办公与 B 端 SaaS
  { id: "powerSystems", icon: "🔌" }, // 智慧配电
  { id: "aiEngineering", icon: "🤖" }, // AI 工程与 Agent
  { id: "visualization", icon: "📊" }, // 复杂数据可视化
]);

/** 经验领域 id 联合类型（供 i18n 文案查找表 Record<ExperienceDomainId, ...> 绑定） */
export type ExperienceDomainId = (typeof experienceDomains)[number]["id"];
