/**
 * 施耐德配电回路 · SVG 电流方向动画（纯前端，无后端）。
 *
 * 拓扑：主母线(固定) + 顶部进线回路「连接电网」(固定，不可删) +
 *       若干个动态回路（母线 → 断路器 → 设备[耗电/储能]）。
 *
 * 电流方向逻辑：每条回路的断路器带一个「带符号功率」(kW)：
 *   power > 0 → 母线 → 设备（正向 / 青）
 *   power < 0 → 设备 → 母线（反向 / 琥珀）
 *   power = 0 → 无流（灰）
 * 动画用 stroke-dashoffset 流动虚线实现（方向由符号决定、速度由 |功率| 决定）。
 *
 * 交互：
 *  - 控制台：＋ 耗电回路 / ＋ 储能回路 动态增删
 *  - 点击断路器：水平拖拽调功率（左减右增），默认中间 0
 *  - 选中断路器：右侧面板可数字直接输入、看方向、删除回路
 */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import DemoStage from '@/ui/DemoStage';
import './PowerGridFlow.css';

type DevType = 'load' | 'storage';
interface Circuit {
  id: string;
  dev: DevType;
  /** 带符号功率 (kW)：正=消耗(母线→设备)，负=馈电(设备→母线) */
  power: number;
}

const MAX = 500; // 功率可调范围 ±500 kW
const COL_W = 160;
const BUS_Y = 96;
const BRK_Y = 150;
const BRK_H = 48;
const DEV_Y = 300;
const DEV_H = 48;
const H = 430;

const uid = () => 'ck_' + Math.random().toString(36).slice(2, 8);

export default function PowerGridFlow() {
  const [circuits, setCircuits] = useState<Circuit[]>(() => [
    { id: uid(), dev: 'load', power: 0 },
    { id: uid(), dev: 'storage', power: 0 },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; startX: number; startPower: number; moved: boolean } | null>(
    null,
  );

  const n = circuits.length;
  const W = Math.max(680, 120 + n * COL_W);
  const startX = (W - n * COL_W) / 2;
  const xAt = (i: number) => startX + i * COL_W + COL_W / 2;

  function addCircuit(dev: DevType) {
    const id = uid();
    setCircuits((c) => [...c, { id, dev, power: 0 }]);
    setSelected(id);
  }
  function delCircuit(id: string) {
    setCircuits((c) => c.filter((x) => x.id !== id));
    setSelected((s) => (s === id ? null : s));
  }
  function setPower(id: string, p: number) {
    const v = Math.max(-MAX, Math.min(MAX, Math.round(p)));
    setCircuits((c) => c.map((x) => (x.id === id ? { ...x, power: v } : x)));
  }

  // 断路器水平拖拽调功率（左减右增）
  function onBreakerDown(e: ReactPointerEvent, id: string, power: number) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { id, startX: e.clientX, startPower: power, moved: false };
  }
  useEffect(() => {
    function move(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      if (!d.moved && Math.abs(dx) < 3) return;
      d.moved = true;
      setPower(d.id, d.startPower + dx * 1.5); // 灵敏度 1.5 kW/px
    }
    function up() {
      const d = dragRef.current;
      if (!d) return;
      setSelected(d.id); // 拖完或点一下都选中，弹出面板
      dragRef.current = null;
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  const sel = circuits.find((c) => c.id === selected) ?? null;

  return (
    <div className="pgf">
      {/* 控制台 */}
      <div className="pgf-console">
        <span className="pgf-console__label">控制台</span>
        <button type="button" className="pgf-btn" onClick={() => addCircuit('load')}>
          ＋ 耗电回路
        </button>
        <button type="button" className="pgf-btn" onClick={() => addCircuit('storage')}>
          ＋ 储能回路
        </button>
        <span className="pgf-console__hint">
          母线顶部「连接电网」进线回路固定，不可删除
        </span>
      </div>

      <div className="pgf-body">
        {/* 画布（DemoStage 接管平移 / 双指缩放，解决窄屏横向不可达） */}
        <DemoStage className="pgf-stage">
          <svg className="pgf-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img">
            <title>施耐德配电回路 · 电流方向动画</title>
            <desc>母线经断路器带载，功率符号决定电流方向，dash-offset 流动虚线展示电流。</desc>

            {/* 进线回路 · 连接电网（固定） */}
            <line
              x1={W / 2}
              y1={40}
              x2={W / 2}
              y2={BUS_Y}
              className="pgf-wire-base"
            />
            <circle cx={W / 2} cy={40} r={4} className="pgf-grid-dot" />
            <text x={W / 2} y={26} className="pgf-grid-label" textAnchor="middle">
              连接电网
            </text>

            {/* 主母线（固定） */}
            <rect x={60} y={BUS_Y - 6} width={W - 120} height={12} rx={5} className="pgf-bus" />
            <text x={68} y={BUS_Y - 12} className="pgf-bus-label">
              主母线 Busbar
            </text>

            {circuits.map((c, i) => {
              const x = xAt(i);
              const positive = c.power > 0;
              const active = Math.abs(c.power) > 0;
              const dur = active
                ? Math.max(0.5, 2.6 - (Math.abs(c.power) / MAX) * 2.0)
                : 0;
              const color = positive ? 'var(--neon-cyan)' : '#f59e0b';
              return (
                <g key={c.id}>
                  {/* 电线：母线→断路器、断路器→设备 */}
                  <FlowSeg x={x} y1={BUS_Y} y2={BRK_Y} power={c.power} dur={dur} color={color} />
                  <FlowSeg
                    x={x}
                    y1={BRK_Y + BRK_H}
                    y2={DEV_Y}
                    power={c.power}
                    dur={dur}
                    color={color}
                  />

                  {/* 删除 ✕ */}
                  <g
                    className="pgf-del"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      delCircuit(c.id);
                    }}
                  >
                    <circle cx={x} cy={BUS_Y + 26} r={9} />
                    <text x={x} y={BUS_Y + 30} textAnchor="middle">
                      ×
                    </text>
                  </g>

                  {/* 断路器 */}
                  <g
                    className={`pgf-breaker ${selected === c.id ? 'is-sel' : ''}`}
                    onPointerDown={(e) => onBreakerDown(e, c.id, c.power)}
                  >
                    <rect x={x - 44} y={BRK_Y} width={88} height={BRK_H} rx={8} />
                    <text x={x} y={BRK_Y + 18} textAnchor="middle" className="pgf-breaker__name">
                      QF{i + 1}
                    </text>
                    <text x={x} y={BRK_Y + 36} textAnchor="middle" className="pgf-breaker__val">
                      {c.power > 0 ? '+' : ''}
                      {c.power} kW
                    </text>
                  </g>

                  {/* 设备 */}
                  <g className={`pgf-device pgf-device--${c.dev}`}>
                    <rect x={x - 44} y={DEV_Y} width={88} height={DEV_H} rx={8} />
                    <text x={x} y={DEV_Y + 20} textAnchor="middle" className="pgf-device__name">
                      {c.dev === 'load' ? '耗电模块' : '储能模块'}
                    </text>
                    <text x={x} y={DEV_Y + 37} textAnchor="middle" className="pgf-device__sub">
                      {c.dev === 'load' ? 'LOAD' : 'ESS'}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </DemoStage>

        {/* 控制面板 */}
        <aside className="pgf-panel">
          {sel ? (
            <>
              <div className="pgf-panel__title">
                {sel.dev === 'load' ? '耗电回路' : '储能回路'} · QF
                {circuits.findIndex((c) => c.id === sel.id) + 1}
              </div>
              <label className="pgf-field">
                <span>功率 (kW，正=消耗 / 负=馈电)</span>
                <input
                  type="number"
                  min={-MAX}
                  max={MAX}
                  value={sel.power}
                  onChange={(e) => setPower(sel.id, Number(e.target.value))}
                />
              </label>
              <input
                className="pgf-range"
                type="range"
                min={-MAX}
                max={MAX}
                value={sel.power}
                onChange={(e) => setPower(sel.id, Number(e.target.value))}
              />
              <div className="pgf-readout">
                <span
                  className="pgf-readout__dir"
                  style={{ color: sel.power > 0 ? 'var(--neon-cyan)' : sel.power < 0 ? '#f59e0b' : 'var(--text-dim)' }}
                >
                  {sel.power > 0 ? '正向 · 母线→设备' : sel.power < 0 ? '反向 · 设备→母线' : '无流'}
                </span>
                <span className="pgf-readout__mag">|{Math.abs(sel.power)}| kW</span>
              </div>
              <p className="pgf-tip">提示：直接在断路器上左右拖拽也能调功率。</p>
              <button type="button" className="pgf-btn pgf-btn--danger" onClick={() => delCircuit(sel.id)}>
                删除该回路
              </button>
            </>
          ) : (
            <div className="pgf-panel__empty">
              <p>点击任意断路器</p>
              <p className="pgf-panel__sub">左右拖拽调功率，或在此直接输入数字</p>
            </div>
          )}

          <div className="pgf-legend">
            <span>
              <i style={{ background: 'var(--neon-cyan)' }} /> 正向 母线→设备
            </span>
            <span>
              <i style={{ background: '#f59e0b' }} /> 反向 设备→母线
            </span>
            <span>
              <i className="pgf-legend__off" /> 无流
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** 一段竖直电线的「基础线 + 流动虚线」 */
function FlowSeg({
  x,
  y1,
  y2,
  power,
  dur,
  color,
}: {
  x: number;
  y1: number;
  y2: number;
  power: number;
  dur: number;
  color: string;
}) {
  const active = Math.abs(power) > 0;
  const positive = power > 0;
  return (
    <>
      <line x1={x} y1={y1} x2={x} y2={y2} className="pgf-wire-base" />
      {active && (
        <line
          x1={x}
          y1={y1}
          x2={x}
          y2={y2}
          className="pgf-wire-flow"
          style={{
            stroke: color,
            color,
            filter: `drop-shadow(0 0 5px ${color})`,
            animationName: positive ? 'pgfFlowDown' : 'pgfFlowUp',
            animationDuration: `${dur}s`,
          }}
        />
      )}
    </>
  );
}
