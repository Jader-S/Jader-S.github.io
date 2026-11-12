/**
 * Demo registry. Lazy-loaded components so heavy chunks (Sandpack, AI) only
 * land when the demo tab is actually opened. See ADR-5 / DESIGN §10.
 */
import { lazy, type ComponentType } from 'react';

export type DemoCategory = 'perf' | 'ai' | 'shader' | 'schedule' | 'power' | 'factory';

export interface DemoEntry {
  slug: string;
  title: string;
  category: DemoCategory;
  Component: ComponentType;
}

// Heavy: code sandbox — keep lazy.
const SchneiderPOI = lazy(() => import('./examples/SchneiderPOI'));
const ConferenceBoard = lazy(() => import('./examples/ConferenceBoard'));
const PowerGridFlow = lazy(() => import('./examples/PowerGridFlow'));
const FactoryLine = lazy(() => import('./examples/FactoryLine'));
const EChartMagnifier = lazy(() => import('./examples/EChartMagnifier'));
const LianhangDashboard = lazy(() => import('./examples/LianhangDashboard'));

export const demoRegistry: DemoEntry[] = [
  {
    slug: 'schneider-poi-perf',
    title: 'Schneider POI · Before / After',
    category: 'perf',
    Component: SchneiderPOI,
  },
  {
    slug: 'conference-board',
    title: '会议编排 · 周视图看板',
    category: 'schedule',
    Component: ConferenceBoard,
  },
  {
    slug: 'power-grid-flow',
    title: '施耐德 · 配电回路电流动画',
    category: 'power',
    Component: PowerGridFlow,
  },
  {
    slug: 'factory-line',
    title: '3D 工厂 · 流水线协同',
    category: 'factory',
    Component: FactoryLine,
  },
  {
    slug: 'echarts-magnifier',
    title: '施耐德 · ECharts 像素放大镜',
    category: 'power',
    Component: EChartMagnifier,
  },
  {
    slug: 'lianhang-dashboard',
    title: '联夯 · 可视化大屏',
    category: 'factory',
    Component: LianhangDashboard,
  },
];

export function getDemo(slug: string) {
  return demoRegistry.find((d) => d.slug === slug);
}