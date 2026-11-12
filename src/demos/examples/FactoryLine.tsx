/**
 * 3D 工厂流水线 demo 入口。
 * 五工位交错分布在中央地轨两侧、料台有高低差；两台地轨机械手沿轨行走、
 * 回转 + 升降 + IK 臂展取放零件；配围栏/桁架/照明等车间环境。
 * 纯前端、零新增依赖、零外部模型。详见 ASTRA_FACTORY_DESIGN.md。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '@/state/useStore';
import { detectWebGL2 } from '@/utils/device';
import {
  RATE_MAX,
  RATE_MIN,
  createSim,
  getStation,
  resetSim,
  setStationRate,
  stateLabel,
  type SimState,
  type StationId,
} from './factory/sim';
import { createViewRuntime } from './factory/runtime';
import { LABELS } from './factory/Station';
import Scene from './factory/Scene';
import './FactoryLine.css';

function TunePanel({ sim, id, onClose }: { sim: SimState; id: StationId; onClose: () => void }) {
  // 只让这个小面板每 100ms 刷新，不牵动 3D 场景重渲染
  const [, force] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => force((v) => v + 1), 100);
    return () => window.clearInterval(timer);
  }, []);

  const s = getStation(sim, id);
  const pct = Math.round(s.progress * 100);
  const busy = s.state === 'PROCESSING';

  return (
    <div className="fl-panel" role="group" aria-label={`${LABELS[id]} 设置`}>
      <div className="fl-panel__head">
        <span className="fl-panel__title">{LABELS[id]}</span>
        <button type="button" className="fl-panel__close" onClick={onClose} aria-label="关闭">
          ✕
        </button>
      </div>

      <div className="fl-panel__row">
        <span>当前状态</span>
        <b className={busy ? 'is-busy' : ''}>{stateLabel(s)}</b>
      </div>
      <div className="fl-panel__row">
        <span>加工进度</span>
        <b>{pct}%</b>
      </div>
      <div className="fl-progress">
        <i style={{ width: `${pct}%` }} />
      </div>

      <label className="fl-panel__label" htmlFor="fl-rate">
        生产频率 <b>{s.rate.toFixed(1)} 件/秒</b>
      </label>
      <input
        id="fl-rate"
        type="range"
        min={RATE_MIN}
        max={RATE_MAX}
        step={0.1}
        value={s.rate}
        onChange={(e) => setStationRate(sim, id, Number(e.target.value))}
      />
      <div className="fl-panel__input">
        <input
          type="number"
          min={RATE_MIN}
          max={RATE_MAX}
          step={0.1}
          value={s.rate}
          aria-label="生产频率数值"
          onChange={(e) => setStationRate(sim, id, Number(e.target.value))}
        />
        <span>件/秒 · 单件约 {(1 / s.rate).toFixed(1)}s</span>
      </div>
      <p className="fl-panel__hint">
        调慢会堵住上下游：加工完须等下游机械手搬走，并等上游放新料后才重新开工。
      </p>
    </div>
  );
}

export default function FactoryLine({ bare = false }: { bare?: boolean }) {
  const simRef = useRef<SimState>(createSim());
  const runtimeRef = useRef(createViewRuntime());
  const setHeavy3DDemoActive = useStore((s) => s.setHeavy3DDemoActive);
  const [selected, setSelected] = useState<StationId | null>(null);
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const webglOk = useMemo(() => detectWebGL2(), []);

  // 激活期间暂停全局背景星系 Canvas，避免双 WebGL context 并行
  useEffect(() => {
    setHeavy3DDemoActive(true);
    return () => setHeavy3DDemoActive(false);
  }, [setHeavy3DDemoActive]);

  if (!webglOk) {
    return (
      <div className="fl-fallback">
        当前环境不支持 WebGL2，无法运行 3D 产线演示。请在支持硬件加速的浏览器中打开。
      </div>
    );
  }

  const sim = simRef.current;

  const togglePause = () => {
    const next = !paused;
    sim.paused = next;
    setPaused(next);
  };
  const doReset = () => {
    resetSim(sim);
    setPaused(false);
    setTimeScale(1);
    setSelected(null);
  };
  const toggleSpeed = () => {
    const next = timeScale === 1 ? 2 : 1;
    sim.timeScale = next;
    setTimeScale(next);
  };

  return (
    <div className="fl-root">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 35, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => setSelected(null)}
      >
        <Scene sim={sim} runtime={runtimeRef.current} onSelect={bare ? () => {} : setSelected} />
      </Canvas>

      <div className="fl-legend" style={bare ? { display: 'none' } : undefined}>
        <span className="fl-legend__item">
          <i className="fl-legend__dot fl-legend__dot--idle" /> 空闲 / 等待
        </span>
        <span className="fl-legend__item">
          <i className="fl-legend__dot fl-legend__dot--busy" /> 加工中
        </span>
        <span className="fl-legend__tip">双地轨机械手沿轨取放 · 点工序设备调频率 · 拖拽旋转 · 双指/滚轮缩放</span>
      </div>

      <div className="fl-toolbar" style={bare ? { display: 'none' } : undefined}>
        <button type="button" onClick={togglePause} data-active={paused}>
          {paused ? '继续' : '暂停'}
        </button>
        <button type="button" onClick={toggleSpeed} data-active={timeScale === 2}>
          {timeScale}×
        </button>
        <button type="button" onClick={doReset}>重置</button>
      </div>

      {!bare && selected && <TunePanel sim={sim} id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
