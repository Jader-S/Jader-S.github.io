/**
 * 项目详情 + Demo 目录：Phase 4 的共享内容层。
 *
 * 与 data/projects.ts 的分工：
 *   - projects.ts 只管卡片结构（id / tech / link / highlight），名称与描述在 lib/i18n/locales/
 *   - 本文件管「点开卡片之后」要展示的东西：背景、职责、成果、关联 Demo 列表
 *
 * 文案自带 zh / en 两份（对齐 site-content.yaml 的惯例），由组件按 useI18n().locale 选择，
 * 不再往 LocaleMessages 里塞大段结构化内容。语言无关的部分（slug / 分类 / 关联关系）只有一份。
 */

import type { Locale } from "@/lib/i18n";
import type { ProjectId } from "./projects";

export type { Locale, ProjectId };
export type Localized = Record<Locale, string>;
export type DemoSlug =
  | "schneider-poi-perf"
  | "conference-board"
  | "power-grid-flow"
  | "factory-line"
  | "echarts-magnifier"
  | "lianhang-dashboard"
  | "skill-qa-agent";

export type DemoCategory = "perf" | "ai" | "schedule" | "power" | "factory";

export interface DemoMeta {
  slug: DemoSlug;
  title: Localized;
  desc: Localized;
  category: DemoCategory;
  /** 宽画布：窄屏保持桌面宽度、由宿主横向滚动 */
  wide?: boolean;
  /** 内含 R3F / WebGL：非 ASTRA 主题也会开一个独立 Canvas */
  heavy3d?: boolean;
}

/** Demo 唯一目录。slug 必须与 styles/shared/demos/registry.ts 一一对应。 */
export const demoCatalog: DemoMeta[] = [
  {
    slug: "schneider-poi-perf",
    title: {
      zh: "配电树性能基准 · Before / After",
      en: "Distribution Tree Benchmark · Before / After",
    },
    desc: {
      zh: "10k 节点配电树，O(n²) 的 Array.find 对比 Map 单遍构建，可现场跑一次基准。",
      en: "A 10k-node tree: O(n²) Array.find versus a single-pass Map build. Run the benchmark live.",
    },
    category: "perf",
  },
  {
    slug: "conference-board",
    title: { zh: "会议编排 · 周视图看板", en: "Meeting Scheduling · Week Board" },
    desc: {
      zh: "周视图拖拽改期、冲突检测、管理员 / 访客双角色，编排结果写入 localStorage。",
      en: "Drag to reschedule, conflict detection, admin/guest roles, persisted to localStorage.",
    },
    category: "schedule",
    wide: true,
  },
  {
    slug: "power-grid-flow",
    title: { zh: "配电回路电流动画", en: "Power Circuit Current Flow" },
    desc: {
      zh: "SVG 母线 / 断路器 / 回路，按带符号功率判定电流方向，虚线流动可视化。",
      en: "SVG busbars, breakers and feeders; signed power drives current direction and dash flow.",
    },
    category: "power",
  },
  {
    slug: "factory-line",
    title: { zh: "3D 工厂 · 流水线协同", en: "3D Factory · Line Coordination" },
    desc: {
      zh: "五工位 + 两台地轨机械手的 R3F 数字孪生，可调节拍、点选工位看状态。",
      en: "R3F digital twin with five stations and two rail robots; tune rates and inspect stations.",
    },
    category: "factory",
    heavy3d: true,
  },
  {
    slug: "echarts-magnifier",
    title: { zh: "ECharts 像素放大镜", en: "ECharts Pixel Magnifier" },
    desc: {
      zh: "十万点时序曲线上的圆形放大镜，视觉放大与数据放大两种模式。",
      en: "Circular lens over a 100k-point series, with both visual and data magnification modes.",
    },
    category: "power",
  },
  {
    slug: "lianhang-dashboard",
    title: { zh: "可视化大屏 · 产线 HUD", en: "Production Line HUD Dashboard" },
    desc: {
      zh: "中央 3D 产线 + 四周 ECharts HUD（KPI / OEE / 告警），宽画布。",
      en: "A 3D line at the center with ECharts KPI/OEE/alarm HUD around it. Wide canvas.",
    },
    category: "factory",
    wide: true,
    heavy3d: true,
  },
  {
    slug: "skill-qa-agent",
    title: {
      zh: "技能问答 Agent · 本地预览",
      en: "Skill QA Agent · Local Preview",
    },
    desc: {
      zh: "本地优先的学习与面试助手：导入资料、按章节自测、模拟面试，数据落在浏览器。",
      en: "Local-first study and interview assistant: import material, self-test by chapter, mock interviews — all in the browser.",
    },
    category: "ai",
  },
];

export function getDemoMeta(slug: string): DemoMeta | undefined {
  return demoCatalog.find((demo) => demo.slug === slug);
}

export interface ProjectDetailText {
  background: string;
  role: string;
  outcomes: string[];
}

export interface ProjectDetailEntry {
  id: ProjectId;
  demos: DemoSlug[];
  text: Record<Locale, ProjectDetailText>;
}

/** 点开作品卡片后的详情：背景 / 职责 / 成果 / 关联 Demo。 */
export const projectDetails: ProjectDetailEntry[] = [
  {
    id: "poiConfigTools",
    demos: ["schneider-poi-perf", "power-grid-flow", "echarts-magnifier"],
    text: {
      zh: {
        background:
          "Power Operation Insight 的 POI 中低压配电配置工具，管理万点级配电系统。原实现一次性构建全量配电树、每层用 Array.find 找父节点，规模上来后首屏要等 72 秒，页面跳转 14 秒，大项目下 JS Heap 冲到 4GB 直接 OOM。",
        role: "主导性能治理与架构重构：重做树构建与索引、拆分渲染批次、梳理跨页状态与缓存；同时交付单线图 SVG 电流动画、DER 实时方向判定，以及 POAE 看板的 Vue → React 迁移。",
        outcomes: [
          "配电树 SET_LOW_TREE_DATA 72s → 2.1s（34×）",
          "页面跳转 14s → 1.2s（12×）",
          "JS Heap 4197MB OOM 归零",
          "五层 AI 协作体系落地，团队人效 +70%",
        ],
      },
      en: {
        background:
          "POI ConfigTools for Schneider Electric's low/medium-voltage systems manages tens of thousands of points. The original build materialised the whole tree and looked up parents with Array.find at every level: 72s first paint, 14s page switches, and a 4GB JS-heap OOM on large projects.",
        role: "Led the performance and architecture work: rebuilt tree construction with indexes, split render batches, reorganised cross-page state and caching; also shipped SVG current-flow diagrams, live DER direction detection and the Vue → React migration of the POAE dashboard.",
        outcomes: [
          "Tree build SET_LOW_TREE_DATA 72s → 2.1s (34×)",
          "Page transitions 14s → 1.2s (12×)",
          "4GB JS-heap OOM eliminated",
          "Five-layer AI collaboration workflow, +70% team throughput",
        ],
      },
    },
  },
  {
    id: "smartMeeting",
    demos: ["conference-board"],
    text: {
      zh: {
        background:
          "氪邦智慧办公产品线下的会议子系统，覆盖会议室预约、参会人、周视图编排与多端适配，管理员与访客权限不同。",
        role: "负责子系统前端架构与通用组件体系抽离，统一表单、看板、日程交互与状态管理，让多条业务线复用同一套交互。",
        outcomes: [
          "通用组件体系使团队效率提升 30%+",
          "周视图拖拽改期 + 冲突检测",
          "管理员 / 访客双角色权限",
          "编排结果本地持久化，刷新不丢",
        ],
      },
      en: {
        background:
          "A meeting subsystem in the smart-office product line: room booking, attendees, weekly scheduling and multi-device layouts, with separate admin and guest permissions.",
        role: "Owned the frontend architecture and the shared component system across forms, boards, schedule interactions and state, so several business lines reused one interaction model.",
        outcomes: [
          "Shared component system lifted team velocity by 30%+",
          "Drag-to-reschedule week view with conflict detection",
          "Admin / guest role separation",
          "Schedules persisted locally across reloads",
        ],
      },
    },
  },
  {
    id: "aerospaceLine",
    demos: ["factory-line", "lianhang-dashboard"],
    text: {
      zh: {
        background:
          "首都航天机械产线数字孪生，把现场工位、地轨机械手、在制品与节拍数据 1:1 映射到浏览器里，供产线监控与汇报使用。",
        role: "负责 Three.js 场景搭建、WebSocket 实时数据接入与 ECharts 可视化大屏，把 3D 场景与 KPI / OEE / 告警面板串成一套视图。",
        outcomes: [
          "五工位 + 两台地轨机械手实时协同",
          "产线节拍与在制品状态 1:1 映射",
          "KPI / OEE / 告警 HUD 与 3D 场景联动",
        ],
      },
      en: {
        background:
          "A digital twin of a Capital Aerospace Machinery production line: stations, rail robots, WIP and cycle times mapped 1:1 into the browser for monitoring and reporting.",
        role: "Built the Three.js scene, WebSocket live-data pipeline and ECharts dashboards, wiring the 3D view to KPI / OEE / alarm HUD panels.",
        outcomes: [
          "Five stations and two rail robots coordinated in real time",
          "Cycle time and WIP state mapped 1:1",
          "KPI / OEE / alarm HUD synced to the 3D scene",
        ],
      },
    },
  },
  {
    id: "skillQaAgent",
    demos: ["skill-qa-agent"],
    text: {
      zh: {
        background:
          "技能问答 Agent，浏览器内用 sql.js 承载结构化题库，做检索式问答与练习。",
        role: "独立完成前端交互、状态管理与本地数据层，让题库查询完全跑在客户端。",
        outcomes: [
          "浏览器内 SQL 检索，无需后端",
          "Zustand 状态分层",
          "Vite + TypeScript 全量类型覆盖",
        ],
      },
      en: {
        background:
          "A skill-Q&A agent that runs a structured question bank entirely in the browser with sql.js.",
        role: "Built the frontend interaction, state model and local data layer end to end.",
        outcomes: [
          "In-browser SQL queries, no backend",
          "Layered Zustand state",
          "Full Vite + TypeScript typing",
        ],
      },
    },
  },
];

export function getProjectDetail(id: string): ProjectDetailEntry | undefined {
  return projectDetails.find((entry) => entry.id === id);
}

/** 弹框 UI 文案（与内容分开，避免把交互词塞进 projectDetails） */
export const projectModalCopy = {
  zh: {
    lab: "实验室",
    labSub: "7 个可交互 Demo · 点开在当前页预览",
    background: "项目背景",
    role: "我的职责",
    stack: "技术栈",
    outcomes: "关键成果",
    demos: "关联 Demo",
    noDemos: "该项目暂无关联 Demo，可去实验室看全部实现。",
    backToProject: "← 返回项目详情",
    backToLab: "← 返回实验室",
    close: "关闭",
    viewDetails: "查看详情",
    loading: "正在加载 Demo…",
    error: "这个 Demo 暂时无法加载，换个试试。",
    wideHint: "← 左右滑动查看完整画布 →",
    heavyHint: "该 Demo 含 3D 场景，加载时会占用一个 WebGL 画布。",
    demoCount: (count: number) => `共 ${count} 个`,
  },
  en: {
    lab: "Lab",
    labSub: "7 interactive demos · open and preview in this page",
    background: "Background",
    role: "My role",
    stack: "Stack",
    outcomes: "Outcomes",
    demos: "Related demos",
    noDemos: "No demo is linked to this project yet — open the lab to see them all.",
    backToProject: "← Back to project",
    backToLab: "← Back to lab",
    close: "Close",
    viewDetails: "View details",
    loading: "Loading demo…",
    error: "This demo could not be loaded. Try another one.",
    wideHint: "← Scroll horizontally to see the full canvas →",
    heavyHint: "This demo renders a 3D scene and needs its own WebGL canvas.",
    demoCount: (count: number) => `${count} total`,
  },
} as const;
