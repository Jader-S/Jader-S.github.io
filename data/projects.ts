/**
 * 作品数据：只管理「结构」——id、技术标签、仓库链接、精选标记与展示顺序。
 *
 * 名称与描述（中英文）不在这里，而在 lib/i18n/locales/ 的 work.projects.<id>：
 * id 一一对应，例如 poiConfigTools → work.projects.poiConfigTools。
 *
 * 类型绑定：data 里每个 id 都必须在 zh / en 两份文案中存在，
 * 漏写任何一处都会编译报错（防中英文漂移）。
 *
 * ── 本轮改造（Phase 7）─────────────────────────────────────────
 * 原先 enterpriseProjects / githubProjects 两套数组已合并为单一 `projects`：
 * 不再区分「企业项目」与「开源项目」，所有作品卡片统一点开共享详情弹框。
 * 按用户拍板，移除 astraPortfolio（ASTRA 3D 星图作品站）卡片，
 * 保留 skillQaAgent。仓库链接只在详情弹框里作为「查看仓库」外链展示。
 *
 * ── 如何新增一个作品 ─────────────────────────────────────────────
 *   1. 在下方数组里加一条：{ id: "xxx", tech: [...] }
 *   2. 保存后运行 tsc / build，会报错提示 zh.ts、en.ts 缺少 xxx 的文案
 *   3. 到 locales 两个文件里补上 { name, description }，报错即消失
 * ── 如何调整展示 ─────────────────────────────────────────────────
 *   改数组顺序 = 调卡片顺序；删掉条目 = 下架；改 tech = 换技术标签。
 */

export interface Project<Id extends string = string> {
  /** 唯一 id（驼峰命名），对应 i18n 文案 work.projects 下的 key */
  id: Id;
  /** 卡片底部的技术标签，最多展示 5 个，超出显示 +N（语言无关，中英文共用） */
  tech: string[];
  /** 可选仓库外链：仅在共享详情弹框里渲染为「查看仓库」，卡片本身一律打开详情 */
  link?: string;
  /** 是否「精选」：卡片显示精选角标 */
  highlight?: boolean;
}

/** 校验数组元素形状，同时保留每个元素的 id 字面量类型（用于推导 id 联合类型，供文案查找表类型绑定） */
function defineProjects<const T extends readonly Project[]>(items: T): T {
  return items;
}

/** 全部作品（页面「作品」区块，渲染顺序 = 数组顺序） */
export const projects = defineProjects([
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
  {
    // 技能问答 Agent（保留仓库外链，在详情弹框里展示）
    id: "skillQaAgent",
    tech: ["React", "TypeScript", "Vite", "Zustand", "sql.js"],
    link: "https://github.com/Jader-S/skill-qa-agent",
    highlight: true,
  },
]);

/** 作品 id 联合类型（供 i18n 文案查找表 Record<ProjectId, ...> 绑定） */
export type ProjectId = (typeof projects)[number]["id"];
