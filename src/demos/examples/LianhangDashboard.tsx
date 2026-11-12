/**
 * 联夯 IMS · 可视化大屏 demo（v2）。
 *
 * 参考效果：3D 数字孪生工厂线铺满全屏作为背景，四周是半透明科技风 HUD 浮层，
 * 带直角括号边框与青色微光。浮层内容：
 *   · 顶部：标题 + KPI 指标块 + 实时时钟
 *   · 左列：设备状态分布（饼图）+ 产线实时产出（折线）
 *   · 右列：OEE 综合效率（环形仪表）+ 开动率（半圆仪表）+ 告警等级分布（饼图）
 *   · 底部：实时报警数据表
 * 全部纯前端模拟数据，每 1.6s 走一格。中央 3D 仍可拖拽旋转。无外部依赖。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import FactoryLine from './FactoryLine';
import './LianhangDashboard.css';

interface Vars {
  cyan: string;
  purple: string;
  dim: string;
  faint: string;
  grid: string;
  ok: string;
  warn: string;
  bad: string;
}
function readVars(): Vars {
  const s = getComputedStyle(document.documentElement);
  const g = (k: string, fb: string) => s.getPropertyValue(k).trim() || fb;
  return {
    cyan: g('--neon-cyan', '#22d3ee'),
    purple: g('--neon-purple', '#a855f7'),
    dim: g('--text-dim', '#94a3b8'),
    faint: g('--text-faint', '#64748b'),
    grid: 'rgba(148,163,184,0.12)',
    ok: '#34d399',
    warn: '#f59e0b',
    bad: '#f43f5e',
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const walk = (v: number, step: number, lo: number, hi: number) =>
  clamp(v + (Math.random() - 0.5) * 2 * step, lo, hi);

type Level = 'crit' | 'warn' | 'info';
interface Alarm {
  id: number;
  level: Level;
  site: string;
  text: string;
  t: string;
}
const ALARM_SEED: Array<{ level: Level; site: string; text: string }> = [
  { level: 'warn', site: 'A-02', text: 'CNC-2 主轴温度偏高 68℃' },
  { level: 'info', site: 'C-04', text: '装配线节拍恢复至标准' },
  { level: 'crit', site: 'E-01', text: '包装线急停按钮触发' },
  { level: 'info', site: 'B-03', text: '检测工位标定完成' },
];
let alarmId = 100;
const SITES = ['A-01', 'A-02', 'B-03', 'C-04', 'D-02', 'E-01'];
function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(
    d.getSeconds(),
  ).padStart(2, '0')}`;
}
function clockLabel() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes(),
  )}:${p(d.getSeconds())}`;
}

interface DashData {
  trend: number[];
  oee: { a: number; p: number; q: number };
  health: number[];
  dial: number;
  stateDist: { run: number; idle: number; fault: number; maint: number };
  alarms: Alarm[];
  kpi: {
    plan: number;
    actual: number;
    onlineUp: number;
    onlineDown: number;
    online: number;
    faultCount: number;
    faultTime: number;
    alarm: number;
  };
}

function initData(): DashData {
  const trend = Array.from({ length: 24 }, (_, i) =>
    Math.round(120 + 40 * Math.sin(i / 3) + Math.random() * 14),
  );
  return {
    trend,
    oee: { a: 92, p: 88, q: 99 },
    health: [96, 91, 98, 87, 94],
    dial: 86,
    stateDist: { run: 118, idle: 14, fault: 4, maint: 6 },
    alarms: ALARM_SEED.map((a) => ({ id: alarmId++, ...a, t: nowLabel() })),
    kpi: { plan: 4200, actual: 3968, onlineUp: 86, onlineDown: 3928, online: 142, faultCount: 4, faultTime: 18, alarm: 0 },
  };
}

function stepData(d: DashData): DashData {
  const base = d.trend[d.trend.length - 1];
  const next = Math.round(clamp(base + (Math.random() - 0.5) * 18, 70, 200));
  const trend = [...d.trend.slice(1), next];

  const oee = {
    a: walk(d.oee.a, 1.2, 85, 99),
    p: walk(d.oee.p, 1.5, 80, 96),
    q: walk(d.oee.q, 0.6, 96, 100),
  };
  const health = d.health.map((h) => Math.round(walk(h, 1.4, 78, 100)));
  const dialNext = Math.round(clamp(d.dial + (Math.random() - 0.5) * 3, 78, 96));

  // 设备状态分布：总量跟随在线设备数，四类占比随机游走
  const total = Math.round(walk(d.kpi.online, 2, 130, 150));
  const run = Math.round(total * (0.78 + Math.random() * 0.05));
  const fault = Math.round(total * (0.02 + Math.random() * 0.03));
  const maint = Math.round(total * (0.03 + Math.random() * 0.03));
  const idle = Math.max(0, total - run - fault - maint);
  const stateDist = { run, idle, fault, maint };

  let alarms = d.alarms;
  let alarmCount = d.kpi.alarm;
  if (Math.random() < 0.2) {
    const pool: Array<{ level: Level; text: string }> = [
      { level: 'warn', text: `产线${1 + Math.floor(Math.random() * 5)} 节拍波动` },
      { level: 'info', text: '设备自检通过' },
      { level: 'crit', text: `产线${1 + Math.floor(Math.random() * 5)} 通讯中断` },
      { level: 'warn', text: '能耗超阈值预警' },
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    alarms = [
      { id: alarmId++, level: pick.level, site: SITES[Math.floor(Math.random() * SITES.length)], text: pick.text, t: nowLabel() },
      ...d.alarms,
    ].slice(0, 8);
    alarmCount = alarms.filter((x) => x.level !== 'info').length;
  }

  const actual = d.kpi.actual + Math.round(Math.random() * 6);
  const faultCount = clamp(d.kpi.faultCount + (Math.random() < 0.12 ? 1 : 0) - (Math.random() < 0.05 ? 1 : 0), 0, 30);
  const faultTime = clamp(d.kpi.faultTime + (Math.random() < 0.2 ? 1 : -1), 0, 90);

  return {
    trend,
    oee,
    health,
    dial: dialNext,
    stateDist,
    alarms,
    kpi: {
      plan: d.kpi.plan,
      actual,
      onlineUp: Math.round(walk(d.kpi.onlineUp, 2, 80, 96)),
      onlineDown: actual,
      online: total,
      faultCount,
      faultTime,
      alarm: alarmCount,
    },
  };
}

/* ── ECharts 封装：init / 自适应 / 销毁 ── */
function EChartPanel({ option }: { option: echarts.EChartsOption }) {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const c = echarts.init(ref.current, undefined, { renderer: 'canvas' });
    chart.current = c;
    const ro = new ResizeObserver(() => c.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      c.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, { notMerge: false, lazyUpdate: true });
  }, [option]);
  return <div ref={ref} className="dash__chart" />;
}

/* ── 通用科技边框框体 ── */
function Frame({
  title,
  extra,
  className,
  children,
}: {
  title: string;
  extra?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`hud-frame${className ? ' ' + className : ''}`}>
      <span className="hud-frame__c hud-frame__c--tl" />
      <span className="hud-frame__c hud-frame__c--tr" />
      <span className="hud-frame__c hud-frame__c--bl" />
      <span className="hud-frame__c hud-frame__c--br" />
      <header className="hud-frame__head">
        <i className="hud-frame__tick" />
        <h3 className="hud-frame__title">{title}</h3>
        {extra && <span className="hud-frame__extra">{extra}</span>}
      </header>
      <div className="hud-frame__body">{children}</div>
    </section>
  );
}

/* ── 折线：产线实时产出 ── */
function lineOption(d: DashData, v: Vars): echarts.EChartsOption {
  return {
    animationDuration: 500,
    grid: { left: 32, right: 12, top: 14, bottom: 18 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8,12,22,0.92)',
      borderColor: v.grid,
      textStyle: { color: v.dim, fontSize: 11 },
    },
    xAxis: {
      type: 'category',
      data: d.trend.map((_, i) => `${i}`),
      axisLabel: { color: v.faint, fontSize: 9, interval: 5 },
      axisLine: { lineStyle: { color: v.dim } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: v.faint, fontSize: 9 },
      splitLine: { lineStyle: { color: v.grid } },
      axisLine: { show: false },
    },
    series: [
      {
        type: 'line',
        data: d.trend,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: v.cyan, width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34,211,238,0.34)' },
            { offset: 1, color: 'rgba(34,211,238,0.02)' },
          ]),
        },
      },
    ],
  };
}

/* ── 环形仪表：OEE ── */
function oeeOption(d: DashData, v: Vars): echarts.EChartsOption {
  const oee = Math.round((d.oee.a * d.oee.p * d.oee.q) / 10000);
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 220,
        endAngle: -40,
        min: 0,
        max: 100,
        radius: '94%',
        center: ['50%', '56%'],
        progress: { show: true, width: 8, itemStyle: { color: v.cyan } },
        axisLine: { lineStyle: { width: 8, color: [[1, 'rgba(148,163,184,0.18)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-2%'],
          formatter: '{value}%',
          color: v.cyan,
          fontSize: 26,
          fontFamily: 'system-ui, sans-serif',
        },
        data: [{ value: oee, name: 'OEE' }],
      },
    ],
  };
}

/* ── 半圆仪表：开动率 ── */
function dialOption(d: DashData, v: Vars): echarts.EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: '124%',
        center: ['50%', '86%'],
        progress: { show: true, width: 7, roundCap: true, itemStyle: { color: v.purple } },
        axisLine: { lineStyle: { width: 7, color: [[1, 'rgba(148,163,184,0.16)']] } },
        axisTick: { distance: -10, length: 3, lineStyle: { color: v.grid, width: 1 } },
        splitLine: { distance: -10, length: 8, lineStyle: { color: v.grid, width: 1 } },
        axisLabel: { distance: -2, color: v.faint, fontSize: 8 },
        pointer: {
          icon: 'path://M2,0 L-2,0 L-0.5,-52 L0.5,-52 Z',
          length: '62%',
          width: 4,
          offsetCenter: [0, '8%'],
          itemStyle: { color: v.purple },
        },
        anchor: { show: true, size: 8, itemStyle: { color: v.purple } },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-8%'],
          formatter: '{value}%',
          color: v.purple,
          fontSize: 20,
          fontFamily: 'system-ui, sans-serif',
        },
        data: [{ value: d.dial, name: '开动率' }],
      },
    ],
  };
}

/* ── 饼图：通用 ── */
function pieOption(
  items: Array<{ name: string; value: number; color: string }>,
  v: Vars,
): echarts.EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(8,12,22,0.92)',
      borderColor: v.grid,
      textStyle: { color: v.dim, fontSize: 11 },
      formatter: '{b}：{c} ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 8,
      textStyle: { color: v.dim, fontSize: 10 },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: 'rgba(8,12,22,0.55)', borderWidth: 2 },
        label: { color: v.dim, fontSize: 10, formatter: '{d}%' },
        labelLine: { length: 6, length2: 6 },
        data: items.map((it) => ({ name: it.name, value: it.value, itemStyle: { color: it.color } })),
      },
    ],
  };
}

const LEVEL_TEXT: Record<Level, string> = { crit: '严重', warn: '预警', info: '提示' };

export default function LianhangDashboard() {
  const [data, setData] = useState<DashData>(initData);
  const [vars, setVars] = useState<Vars>(readVars);
  const [clock, setClock] = useState(clockLabel);

  useEffect(() => {
    const id = window.setInterval(() => setData((d) => stepData(d)), 1600);
    const ck = window.setInterval(() => setClock(clockLabel()), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(ck);
    };
  }, []);

  useEffect(() => {
    const mo = new MutationObserver(() => setVars(readVars()));
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    return () => mo.disconnect();
  }, []);

  const lineOpt = useMemo(() => lineOption(data, vars), [data, vars]);
  const oeeOpt = useMemo(() => oeeOption(data, vars), [data, vars]);
  const dialOpt = useMemo(() => dialOption(data, vars), [data, vars]);
  const statePie = useMemo(
    () =>
      pieOption(
        [
          { name: '运行', value: data.stateDist.run, color: vars.ok },
          { name: '待机', value: data.stateDist.idle, color: vars.cyan },
          { name: '故障', value: data.stateDist.fault, color: vars.bad },
          { name: '维护', value: data.stateDist.maint, color: vars.purple },
        ],
        vars,
      ),
    [data, vars],
  );
  const alarmPie = useMemo(() => {
    const c = { crit: 0, warn: 0, info: 0 };
    data.alarms.forEach((a) => (c[a.level] += 1));
    return pieOption(
      [
        { name: '严重', value: c.crit, color: vars.bad },
        { name: '预警', value: c.warn, color: vars.warn },
        { name: '提示', value: c.info, color: vars.cyan },
      ],
      vars,
    );
  }, [data, vars]);

  const rate = Math.round((data.kpi.actual / data.kpi.plan) * 100);
  const kpiTiles: Array<{ label: string; value: number | string; unit?: string; accent?: boolean; danger?: boolean }> = [
    { label: '计划生产', value: data.kpi.plan },
    { label: '实际完成', value: data.kpi.actual },
    { label: '完成率', value: rate, unit: '%' },
    { label: '上线数量', value: data.kpi.onlineUp },
    { label: '下线数量', value: data.kpi.onlineDown },
    { label: '在线设备', value: data.kpi.online, unit: '台' },
    { label: '故障次数', value: data.kpi.faultCount, danger: data.kpi.faultCount > 0 },
    { label: '实时告警', value: data.kpi.alarm, danger: data.kpi.alarm > 0 },
  ];

  return (
    <div className="dash">
      <div className="dash__scene">
        <FactoryLine bare />
      </div>
      <div className="dash__scan" aria-hidden="true" />

      <div className="dash__hud">
        {/* 顶部：品牌 + KPI + 时钟 */}
        <header className="dash__top">
          <Frame title="联夯 IMS · 智能管控中心" extra="CAPITAL AEROSPACE · DTCC" className="dash__brand hud-frame--bar">
            <span className="dash__brand-sub">数字孪生 · 生产运营实时看板</span>
          </Frame>
          <Frame title="核心指标" className="dash__kpi-frame hud-frame--bar">
            <div className="dash__kpis">
              {kpiTiles.map((k) => (
                <div className={`dash__kpi${k.danger ? ' is-danger' : ''}`} key={k.label}>
                  <span className="dash__kpi-label">{k.label}</span>
                  <span className="dash__kpi-value" style={{ color: k.danger ? vars.bad : undefined }}>
                    {k.value}
                    {k.unit && <i>{k.unit}</i>}
                  </span>
                </div>
              ))}
            </div>
          </Frame>
          <Frame title="系统时间" className="dash__clock-frame hud-frame--bar">
            <span className="dash__clock">{clock}</span>
            <span className="dash__clock-tag">
              <i className="dash__live-dot" /> LIVE
            </span>
          </Frame>
        </header>

        {/* 左列 */}
        <aside className="dash__col dash__col--left">
          <Frame title="设备状态分布" extra="实时" className="dash__pane">
            <EChartPanel option={statePie} />
          </Frame>
          <Frame title="产线实时产出" extra="近 24 周期" className="dash__pane">
            <EChartPanel option={lineOpt} />
          </Frame>
        </aside>

        {/* 右列 */}
        <aside className="dash__col dash__col--right">
          <Frame title="OEE 综合效率" className="dash__pane">
            <EChartPanel option={oeeOpt} />
          </Frame>
          <Frame title="开动率" className="dash__pane">
            <EChartPanel option={dialOpt} />
          </Frame>
          <Frame title="告警等级分布" extra="实时" className="dash__pane">
            <EChartPanel option={alarmPie} />
          </Frame>
        </aside>

        {/* 底部：实时报警表 */}
        <footer className="dash__bottom">
          <Frame title="实时报警" extra={`${data.kpi.alarm} 条待处理`} className="dash__table-frame hud-frame--bar">
            <div className="dash__table-wrap">
              <table className="dash__table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>站点</th>
                    <th>报警内容</th>
                    <th>状态</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {data.alarms.slice(0, 5).map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td className="dash__table-site">{a.site}</td>
                      <td className="dash__table-text">{a.text}</td>
                      <td>
                        <span className={`dash__chip dash__chip--${a.level}`}>{LEVEL_TEXT[a.level]}</span>
                      </td>
                      <td className="dash__table-time">{a.t}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Frame>
        </footer>
      </div>
    </div>
  );
}
