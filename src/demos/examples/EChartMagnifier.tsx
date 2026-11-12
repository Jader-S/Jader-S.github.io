/**
 * 施耐德运行时 · ECharts 像素放大镜（纯前端，无后端）。
 *
 * 两种放大模式（可切换）：
 *   · 视觉放大 —— 从 ECharts 画布快照取区域位图放大（保留原功能，dpr 缩放保清晰）。
 *   · 数据放大 —— 按真实数据点在 Canvas 圆形 clip 内重新绘制局部曲线
 *                （清晰、不模糊、不丢细节，高密数据也能看清真实形态）。
 * 两者均叠加：手绘十字坐标轴 + 自适应刻度（自动避重叠）+ 当前点醒目标注（原图 + 放大镜内）。
 * 主图支持 dataZoom（inside 滚轮 + slider），放大镜坐标变换自动跟随。
 *
 * 交互：移动光标 → 圆形放大镜跟随；离开 → 隐藏。镜面半径 / 放大倍率可调，模式可切换。
 * 视觉：跟随站点主题（CSS 变量），深色玻璃 + 霓虹青/紫。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useT } from '@/i18n';
import './EChartMagnifier.css';

type Pt = [number, number]; // [index, value]

const N = 100000; // 数据点规模：十万级
const R_MIN = 60;
const R_MAX = 200;
const S_MIN = 2;
const S_MAX = 10;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface Vars {
  cyan: string;
  purple: string;
  dim: string;
  faint: string;
  grid: string;
  bg: string; // 不透明主题底色：放大镜铺底 + ECharts 实心底，杜绝透出主图重叠
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
    // 取不透明实色；--glass-bg 可能为半透明，这里兜底成纯暗底
    bg: g('--bg', '#0a0e1a') || '#0a0e1a',
  };
}

function buildOption(data: Pt[], v: Vars): echarts.EChartsOption {
  return {
    animation: false,
    backgroundColor: 'transparent', // 主图保留玻璃穿透感；放大镜内防重叠由 canvas fillRect 兜底
    grid: { left: 56, right: 20, top: 22, bottom: 64 },
    tooltip: { show: false },
    // dataZoom：主图可缩放（inside 滚轮 / slider 拖拽），放大镜两种模式的坐标变换自动跟随。
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
        bottom: 10,
        height: 20,
        backgroundColor: 'rgba(148,163,184,0.06)',
        fillerColor: 'rgba(34,211,238,0.16)',
        borderColor: 'rgba(148,163,184,0.28)',
        handleStyle: { color: v.cyan, borderColor: v.cyan },
        moveHandleStyle: { color: v.cyan },
        dataBackground: {
          lineStyle: { color: v.dim, width: 1 },
          areaStyle: { color: 'rgba(34,211,238,0.10)' },
        },
        selectedDataBackground: {
          lineStyle: { color: v.cyan, width: 1 },
          areaStyle: { color: 'rgba(34,211,238,0.18)' },
        },
        textStyle: { color: v.faint, fontSize: 10 },
      },
    ],
    xAxis: {
      type: 'value',
      min: 0,
      max: data.length - 1,
      name: 't',
      nameTextStyle: { color: v.dim, fontSize: 11 },
      axisLine: { lineStyle: { color: v.dim } },
      axisLabel: { color: v.faint, fontSize: 10, formatter: (val: number) => Math.round(val).toString() },
      splitLine: { lineStyle: { color: v.grid } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      name: 'v',
      nameTextStyle: { color: v.dim, fontSize: 11 },
      axisLine: { lineStyle: { color: v.dim } },
      axisLabel: { color: v.faint, fontSize: 10 },
      splitLine: { lineStyle: { color: v.grid } },
    },
    series: [
      {
        type: 'line',
        data,
        showSymbol: false,
        sampling: 'lttb',
        lineStyle: { color: v.cyan, width: 1 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34,211,238,0.28)' },
            { offset: 1, color: 'rgba(34,211,238,0.02)' },
          ]),
        },
      },
    ],
  };
}

/** 自适应步长：保证刻度间距 ≥ 26px，绝不重叠（设计稿「自动避重叠」）。 */
function niceStep(range: number, targetCount: number): number {
  const raw = range / Math.max(1, targetCount);
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
  const norm = raw / mag;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

export default function EChartMagnifier() {
  const t = useT();
  const [params, setParams] = useState({ radius: 110, scale: 4 });
  const [mode, setMode] = useState<'visual' | 'data'>('visual');
  const [ready, setReady] = useState(false);
  const [readout, setReadout] = useState<{ idx: number; val: number } | null>(null);

  const chartRef = useRef<echarts.ECharts | null>(null);
  const ecCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const varsRef = useRef<Vars>(readVars());
  const dprRef = useRef<number>(Math.max(1, window.devicePixelRatio || 1));
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const lastReadoutRef = useRef<{ idx: number; val: number } | null>(null);

  // 万点级密集时序：多频叠加 + 微噪声，铺满主图后单像素宽度塞入海量点。
  const data = useMemo<Pt[]>(() => {
    const arr: Pt[] = new Array(N);
    for (let i = 0; i < N; i++) {
      const y =
        0.62 * Math.sin(i / 130) +
        0.27 * Math.sin(i / 19 + 1.3) +
        0.12 * Math.sin(i / 4.7) +
        (Math.random() - 0.5) * 0.05;
      arr[i] = [i, +y.toFixed(4)];
    }
    return arr;
  }, []);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawRef.current();
    });
  }, []);

  // 放大镜绘制：每帧从 ECharts 快照取区域放大 + 手绘刻度 + 圆角标签。
  const drawLens = () => {
    const overlay = overlayRef.current;
    const ec = ecCanvasRef.current;
    const chart = chartRef.current;
    const wrap = wrapRef.current;
    if (!overlay || !ec || !chart || !wrap) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    const dpr = dprRef.current;
    const cssW = wrap.clientWidth;
    const cssH = wrap.clientHeight;
    if (overlay.width !== Math.round(cssW * dpr) || overlay.height !== Math.round(cssH * dpr)) {
      overlay.width = Math.round(cssW * dpr);
      overlay.height = Math.round(cssH * dpr);
      overlay.style.width = cssW + 'px';
      overlay.style.height = cssH + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const p = pointerRef.current;
    if (!p) {
      if (lastReadoutRef.current !== null) {
        lastReadoutRef.current = null;
        setReadout(null);
      }
      return;
    }

    const v = varsRef.current;
    const R = params.radius;
    const M = params.scale;
    const mx = p.x; // 真实鼠标坐标
    const my = p.y;
    // 放大镜 UI 圆心：偏移出鼠标，让原图上的选中点可见。
    // 优先偏到右上（不遮挡光标处选中点）；空间不足时按 右上→左上→右下→左下 依次回退；都不放得下则夹紧居中。
    const pad = 10;
    const gap = 16;
    const fits = (x: number, y: number) =>
      x - R >= pad && x + R <= cssW - pad && y - R >= pad && y + R <= cssH - pad;
    const candidates: Array<[number, number]> = [
      [mx + R + gap, my - R - gap], // 右上
      [mx - R - gap, my - R - gap], // 左上
      [mx + R + gap, my + R + gap], // 右下
      [mx - R - gap, my + R + gap], // 左下
    ];
    let cx = 0;
    let cy = 0;
    const hit = candidates.find(([x, y]) => fits(x, y));
    if (hit) {
      [cx, cy] = hit;
    } else {
      cx = clamp(mx, R + pad, cssW - R - pad);
      cy = clamp(my, R + pad, cssH - R - pad);
    }
    const half = (R / M) * dpr; // 源区域半宽（ECharts 后备像素，围绕鼠标 mx,my）

    // —— 放大镜覆盖的数据窗口（半径 R/M 对应数据坐标，围绕鼠标 mx,my，两种模式共用）——
    const wL = (chart.convertFromPixel({ gridIndex: 0 }, [mx - R / M, my]) as number[])[0];
    const wR = (chart.convertFromPixel({ gridIndex: 0 }, [mx + R / M, my]) as number[])[0];
    const wT = (chart.convertFromPixel({ gridIndex: 0 }, [mx, my - R / M]) as number[])[1];
    const wB = (chart.convertFromPixel({ gridIndex: 0 }, [mx, my + R / M]) as number[])[1];

    // —— 圆形 clip 内的放大内容 ——
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    // 先铺不透明主题底色：放大镜内永远实心，既不透出下方主图，也能兜住圆形越界区域
    ctx.fillStyle = v.bg;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

    if (mode === 'visual') {
      // 视觉放大：从 ECharts 画布快照位图放大（保留原功能，依赖 ec 已就绪）
      if (ec) {
        // 源：鼠标处矩形（mx,my）；目标：绘制到偏移后的放大镜圆心（cx,cy）
        ctx.drawImage(ec, mx * dpr - half, my * dpr - half, half * 2, half * 2, cx - R, cy - R, R * 2, R * 2);
      }
    } else {
      // 数据放大：用真实数据点，在圆形 clip 内用 Canvas 重新绘制局部曲线
      // —— 清晰、不模糊、不丢细节：无论主图多密，放大镜内都是按真实数据重绘 ——
      const cxC = (wL + wR) / 2;
      const cyC = (wT + wB) / 2;
      const rx = (wR - wL) / 2 || 1;
      const ry = (wT - wB) / 2 || 1;
      const mapX = (d: number) => cx + (d - cxC) * (R / rx);
      const mapY = (d: number) => cy - (d - cyC) * (R / ry);

      const iLo = Math.max(0, Math.floor(wL));
      const iHi = Math.min(data.length - 1, Math.ceil(wR));

      // 面积填充
      ctx.beginPath();
      ctx.moveTo(mapX(data[iLo][0]), cy + R);
      for (let i = iLo; i <= iHi; i++) ctx.lineTo(mapX(data[i][0]), mapY(data[i][1]));
      ctx.lineTo(mapX(data[iHi][0]), cy + R);
      ctx.closePath();
      const ag = ctx.createLinearGradient(0, cy - R, 0, cy + R);
      ag.addColorStop(0, 'rgba(34,211,238,0.22)');
      ag.addColorStop(1, 'rgba(34,211,238,0.02)');
      ctx.fillStyle = ag;
      ctx.fill();

      // 曲线（局部数据量很小，逐点绘制清晰）
      ctx.beginPath();
      for (let i = iLo; i <= iHi; i++) {
        const x = mapX(data[i][0]);
        const y = mapY(data[i][1]);
        if (i === iLo) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = v.cyan;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(cx, cy, R * 0.25, cx, cy, R);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    ctx.restore();

    // —— 霓虹镜框 ——
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = v.cyan;
    ctx.shadowColor = v.cyan;
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.restore();

    // —— 当前点（最近数据索引，基于真实鼠标 mx,my）——
    const cursorData = chart.convertFromPixel({ gridIndex: 0 }, [mx, my]) as number[];
    const idx = clamp(Math.round(cursorData[0]), 0, data.length - 1);
    const val = data[idx][1];
    const pp = chart.convertToPixel({ gridIndex: 0 }, [idx, val]) as number[];

    // —— 原图当前点标记（放大镜之外也展示选中点）——
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pp[0] - 7, pp[1]);
    ctx.lineTo(pp[0] + 7, pp[1]);
    ctx.moveTo(pp[0], pp[1] - 7);
    ctx.lineTo(pp[0], pp[1] + 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pp[0], pp[1], 3.2, 0, Math.PI * 2);
    ctx.fillStyle = v.purple;
    ctx.fill();
    ctx.restore();

    // —— 自适应刻度窗口（复用上方 wL..wB）——
    const target = Math.max(3, Math.floor((2 * R) / 26));

    const xStep = niceStep(Math.abs(wR - wL), target);
    const yStep = niceStep(Math.abs(wT - wB), target);

    ctx.save();
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'middle';

    // X 刻度（沿镜底）
    ctx.fillStyle = v.faint;
    ctx.strokeStyle = 'rgba(148,163,184,0.35)';
    ctx.lineWidth = 1;
    const xStart = Math.ceil(Math.min(wL, wR) / xStep) * xStep;
    for (let tv = xStart; tv <= Math.max(wL, wR); tv += xStep) {
      const px = (chart.convertToPixel({ gridIndex: 0 }, [tv, (wT + wB) / 2]) as number[])[0];
      if (px < cx - R || px > cx + R) continue;
      ctx.beginPath();
      ctx.moveTo(px, cy + R - 10);
      ctx.lineTo(px, cy + R - 4);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(tv).toString(), px, cy + R - 18);
    }
    // Y 刻度（沿镜左）
    const yStart = Math.ceil(Math.min(wT, wB) / yStep) * yStep;
    const yPrec = yStep < 0.01 ? 4 : yStep < 0.1 ? 3 : yStep < 1 ? 2 : 1;
    for (let tv = yStart; tv <= Math.max(wT, wB); tv += yStep) {
      const py = (chart.convertToPixel({ gridIndex: 0 }, [(wL + wR) / 2, tv]) as number[])[1];
      if (py < cy - R || py > cy + R) continue;
      ctx.beginPath();
      ctx.moveTo(cx - R + 4, py);
      ctx.lineTo(cx - R + 10, py);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(tv.toFixed(yPrec), cx - R + 12, py);
    }
    ctx.restore();

    // —— 放大镜内当前点（醒目：交点十字 + 圆点，两种模式都精确定位）——
    // 数据模式：窗口线性映射（cx,cy 已是偏移后的放大镜圆心）；
    // 视觉模式：把原图数据点 pp 按倍率 M 映射到偏移后的放大镜坐标。
    const lx0 = mode === 'data' ? cx + (idx - (wL + wR) / 2) * (R / ((wR - wL) / 2 || 1)) : cx + (pp[0] - mx) * M;
    const ly0 = mode === 'data' ? cy - (val - (wT + wB) / 2) * (R / ((wT - wB) / 2 || 1)) : cy + (pp[1] - my) * M;
    const dC = Math.hypot(lx0 - cx, ly0 - cy);
    if (dC <= R) {
      // 交点十字（贯穿镜面，标出当前点的横纵坐标）
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx - R, ly0);
      ctx.lineTo(cx + R, ly0);
      ctx.moveTo(lx0, cy - R);
      ctx.lineTo(lx0, cy + R);
      ctx.stroke();
      ctx.restore();

      // 当前点圆点
      ctx.save();
      ctx.beginPath();
      ctx.arc(lx0, ly0, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = v.purple;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = v.cyan;
      ctx.shadowColor = v.cyan;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    // —— 圆角数值标签 ——
    ctx.save();
    const label1 = `t = ${idx}`;
    const label2 = `v = ${val.toFixed(3)}`;
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    const wMax = Math.max(ctx.measureText(label1).width, ctx.measureText(label2).width);
    const lw = wMax + 18;
    const lh = 34;
    let lx = cx - R + 8;
    let ly = cy - R + 8;
    if (lx + lw > cx + R) lx = cx + R - lw - 4;
    if (ly + lh > cy + R) ly = cy + R - lh - 4;
    const r = 8;
    ctx.beginPath();
    ctx.moveTo(lx + r, ly);
    ctx.arcTo(lx + lw, ly, lx + lw, ly + lh, r);
    ctx.arcTo(lx + lw, ly + lh, lx, ly + lh, r);
    ctx.arcTo(lx, ly + lh, lx, ly, r);
    ctx.arcTo(lx, ly, lx + lw, ly, r);
    ctx.closePath();
    ctx.fillStyle = 'rgba(10,15,25,0.82)';
    ctx.fill();
    ctx.strokeStyle = v.cyan;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = v.cyan;
    ctx.fillText(label1, lx + 9, ly + 11);
    ctx.fillStyle = v.dim;
    ctx.fillText(label2, lx + 9, ly + 24);
    ctx.restore();

    const last = lastReadoutRef.current;
    if (!last || last.idx !== idx || Math.abs(last.val - val) > 1e-9) {
      lastReadoutRef.current = { idx, val };
      setReadout({ idx, val });
    }
  };
  drawRef.current = drawLens;

  // 初始化 ECharts + 主题跟随 + 尺寸自适应 + 指针监听。
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let chart: echarts.ECharts | null = null;
    try {
      chart = echarts.init(wrap, undefined, {
        renderer: 'canvas',
        devicePixelRatio: dprRef.current,
      });
    } catch {
      return;
    }
    chartRef.current = chart;
    varsRef.current = readVars();
    chart.setOption(buildOption(data, varsRef.current));
    // 主图缩放（dataZoom）后，坐标变换变化，放大镜需重绘
    chart.on('dataZoom', scheduleDraw);

    const grab = () => {
      ecCanvasRef.current = (wrap.querySelector('canvas') as HTMLCanvasElement) ?? null;
    };
    grab();
    requestAnimationFrame(grab);
    setReady(true);

    const ro = new ResizeObserver(() => {
      chart?.resize();
      requestAnimationFrame(grab);
      scheduleDraw();
    });
    ro.observe(wrap);

    const mo = new MutationObserver(() => {
      const nv = readVars();
      varsRef.current = nv;
      chart?.setOption(buildOption(data, nv));
      requestAnimationFrame(grab);
      scheduleDraw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        pointerRef.current = null;
      } else {
        pointerRef.current = { x, y };
      }
      scheduleDraw();
    };
    const onLeave = () => {
      pointerRef.current = null;
      scheduleDraw();
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    return () => {
      ro.disconnect();
      mo.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      chart?.dispose();
      chartRef.current = null;
      ecCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 参数 / 模式变更时重绘（若悬停中）。
  useEffect(() => {
    scheduleDraw();
  }, [params, mode, scheduleDraw]);

  const m = t.demos.magnifier;

  return (
    <div className="ecm">
      <div className="ecm__narrative">
        <div>
          <h4>{m.problem}</h4>
          <p>{m.problemBody}</p>
        </div>
        <div>
          <h4>{m.thinking}</h4>
          <p>{m.thinkingBody}</p>
        </div>
        <div>
          <h4>{m.result}</h4>
          <p>{m.resultBody}</p>
        </div>
      </div>

      <div className="ecm__stage">
        <div className="ecm__chart" ref={wrapRef} />
        <canvas className="ecm__overlay" ref={overlayRef} />
        {!ready && <div className="ecm__loading">{t.loading}</div>}
      </div>

      <p className="ecm__hint">{m.hint}</p>

      <div className="ecm__params">
        <label className="ecm__param">
          <span>{m.radius}</span>
          <input
            type="range"
            min={R_MIN}
            max={R_MAX}
            value={params.radius}
            onChange={(e) => setParams((p) => ({ ...p, radius: +e.target.value }))}
          />
          <i>{params.radius}px</i>
        </label>
        <label className="ecm__param">
          <span>{m.scale}</span>
          <input
            type="range"
            min={S_MIN}
            max={S_MAX}
            step={0.5}
            value={params.scale}
            onChange={(e) => setParams((p) => ({ ...p, scale: +e.target.value }))}
          />
          <i>{params.scale.toFixed(1)}×</i>
        </label>
        <div className="ecm__seg" role="group" aria-label={m.mode}>
          <span className="ecm__seg-label">{m.mode}</span>
          <button
            type="button"
            className={`ecm__seg-btn${mode === 'visual' ? ' is-active' : ''}`}
            onClick={() => setMode('visual')}
          >
            {m.modeVisual}
          </button>
          <button
            type="button"
            className={`ecm__seg-btn${mode === 'data' ? ' is-active' : ''}`}
            onClick={() => setMode('data')}
          >
            {m.modeData}
          </button>
        </div>
        <span className="ecm__meta">
          {m.points(N)} · {m.dpr} {dprRef.current}
        </span>
      </div>

      <div className="ecm__readout">
        {readout ? m.readout(readout.idx, readout.val) : m.noEcharts}
      </div>
    </div>
  );
}
