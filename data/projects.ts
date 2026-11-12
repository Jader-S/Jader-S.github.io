/**
 * 项目数据：只管理「结构」——id、技术标签、链接、精选标记与展示顺序。
 *
 * 项目的名称与描述（中英文）不在这里，而在 lib/i18n/locales/ 中：
 *   - 企业项目 → zh.ts / en.ts 的 enterprise.projects.<id>
 *   - 开源项目 → zh.ts / en.ts 的 github.projects.<id>
 *   - id 一一对应，例如 poiConfigTools → enterprise.projects.poiConfigTools
 *
 * 类型绑定：data 里每个 id 都必须在 zh / en 两份文案中存在，
 * 漏写任何一处的文案都会编译报错（这就是防中英文漂移的机制）。
 *
 * 内容源：site-content.yaml（同步自 E:\Jader\blog\src\i18n\zh.ts 的 projects.list）
 * 只收录原站已有的真实项目，不编造条目。
 *
 * ── 如何新增一个项目 ─────────────────────────────────────────────
 *   1. 在下方对应数组里加一条：{ id: "xxx", tech: [...] }
 *   2. 保存后运行 tsc / build，会报错提示 zh.ts、en.ts 缺少 xxx 的文案
 *   3. 到 locales 两个文件里补上 { name, description }，报错即消失
 * ── 如何调整展示 ─────────────────────────────────────────────────
 *   改数组里条目的顺序 = 调卡片顺序；删掉条目 = 下架；改 tech = 换技术标签。
 */

export interface Project<Id extends string = string> {
  /** 唯一 id（驼峰命名），对应 i18n 文案 enterprise.projects / github.projects 下的 key */
  id: Id;
  /** 卡片底部的技术标签，最多展示 5 个，超出显示 +N（语言无关，中英文共用） */
  tech: string[];
  /** 项目链接：仅「开源项目」区块会渲染成外链卡片；企业项目区块不渲染链接 */
  link?: string;
  /** 是否「精选」：卡片显示精选角标，常用于重点项目 */
  highlight?: boolean;
}

/** 校验数组元素形状，同时保留每个元素的 id 字面量类型（用于推导 id 联合类型，供文案查找表类型绑定） */
function defineProjects<const T extends readonly Project[]>(items: T): T {
  return items;
}

/** 企业精选项目（页面「近期企业项目」区块，渲染顺序 = 数组顺序） */
export const enterpriseProjects = defineProjects([
  {
    // 施耐德电气 POI 中低压配电 · 性能治理与架构重构
    id: "poiConfigTools",
    tech: ["React", "TypeScript", "ECharts", "SVG", "SignalR"],
    highlight: true,
  },
  {
    // 氪邦 · 智慧会议子系统
    id: "smartMeeting",
    tech: ["Vue 3", "TypeScript", "ECharts", "多端适配"],
    highlight: true,
  },
  {
    // 联夯 · 首都航天机械产线数字孪生
    id: "aerospaceLine",
    tech: ["Three.js", "Vue 2", "WebSocket", "ECharts"],
    highlight: true,
  },
]);

/** 开源项目（页面「开源项目」区块，渲染顺序 = 数组顺序；link 会渲染为外链卡片） */
export const githubProjects = defineProjects([
  {
    // ASTRA 3D 星图作品站
    id: "astraPortfolio",
    tech: ["Vite", "React", "R3F", "MDX", "GSAP"],
    link: "https://github.com/Jader-S/Jader-S.github.io",
    highlight: true,
  },
  {
    // 技能问答 Agent
    id: "skillQaAgent",
    tech: ["React", "TypeScript", "Vite", "Zustand", "sql.js"],
    link: "https://github.com/Jader-S/skill-qa-agent",
    highlight: true,
  },
]);

/** 企业项目 id 联合类型（供 i18n 文案查找表 Record<EnterpriseProjectId, ...> 绑定） */
export type EnterpriseProjectId = (typeof enterpriseProjects)[number]["id"];
/** 开源项目 id 联合类型（同上） */
export type GithubProjectId = (typeof githubProjects)[number]["id"];
