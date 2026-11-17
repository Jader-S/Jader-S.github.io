/**
 * Demo registry. Lazy-loaded components so heavy chunks (Sandpack, AI) only
 * land when the demo tab is actually opened. See ADR-5 / DESIGN §10.
 */
import { lazy, type ComponentType } from "react";

export type DemoCategory = "perf" | "ai" | "shader" | "schedule" | "power" | "factory";

export interface DemoEntry {
  slug: string;
  title: string;
  category: DemoCategory;
  Component: ComponentType;
  /** 宽画布 demo：窄屏保持桌面宽度、由宿主横向滚动，而不是压成单列丢信息 */
  wide?: boolean;
  /** 预热 chunk：hover / 进入页面时调用，避免首次点击时才下载大依赖。 */
  preload: () => Promise<unknown>;
}

// Heavy: code sandbox — keep lazy. 每个 loader 单独导出，供 preloadDemo 复用。
const loadSchneiderPOI = () => import("./examples/SchneiderPOI");
const loadConferenceBoard = () => import("./examples/ConferenceBoard");
const loadPowerGridFlow = () => import("./examples/PowerGridFlow");
const loadFactoryLine = () => import("./examples/FactoryLine");
const loadEChartMagnifier = () => import("./examples/EChartMagnifier");
const loadLianhangDashboard = () => import("./examples/LianhangDashboard");
const loadSkillQaAgent = () => import("./examples/SkillQaAgent");

const SchneiderPOI = lazy(loadSchneiderPOI);
const ConferenceBoard = lazy(loadConferenceBoard);
const PowerGridFlow = lazy(loadPowerGridFlow);
const FactoryLine = lazy(loadFactoryLine);
const EChartMagnifier = lazy(loadEChartMagnifier);
const LianhangDashboard = lazy(loadLianhangDashboard);
const SkillQaAgent = lazy(loadSkillQaAgent);

export const demoRegistry: DemoEntry[] = [
  {
    slug: "schneider-poi-perf",
    title: "Schneider POI · Before / After",
    category: "perf",
    Component: SchneiderPOI,
    preload: loadSchneiderPOI,
  },
  {
    slug: "conference-board",
    title: "会议编排 · 周视图看板",
    category: "schedule",
    Component: ConferenceBoard,
    wide: true,
    preload: loadConferenceBoard,
  },
  {
    slug: "power-grid-flow",
    title: "施耐德 · 配电回路电流动画",
    category: "power",
    Component: PowerGridFlow,
    preload: loadPowerGridFlow,
  },
  {
    slug: "factory-line",
    title: "3D 工厂 · 流水线协同",
    category: "factory",
    Component: FactoryLine,
    preload: loadFactoryLine,
  },
  {
    slug: "echarts-magnifier",
    title: "施耐德 · ECharts 像素放大镜",
    category: "power",
    Component: EChartMagnifier,
    preload: loadEChartMagnifier,
  },
  {
    slug: "lianhang-dashboard",
    title: "联夯 · 可视化大屏",
    category: "factory",
    Component: LianhangDashboard,
    wide: true,
    preload: loadLianhangDashboard,
  },
  {
    slug: "skill-qa-agent",
    title: "技能问答 Agent · Skill QA",
    category: "ai",
    Component: SkillQaAgent,
    preload: loadSkillQaAgent,
  },
];

export function getDemo(slug: string) {
  return demoRegistry.find((d) => d.slug === slug);
}

/** 预热指定 demo 的 lazy chunk，重复调用安全（模块缓存）。 */
export function preloadDemo(slug: string) {
  getDemo(slug)
    ?.preload()
    .catch(() => {
      // 预热失败交给真正的 Suspense 渲染路径报错，这里只保证不产生 unhandled rejection。
    });
}
