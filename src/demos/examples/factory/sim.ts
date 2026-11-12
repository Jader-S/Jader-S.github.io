/**
 * 工厂流水线纯逻辑 FSM —— 不 import three / React，可独立单测。
 *
 * 设计要点（ASTRA_FACTORY_DESIGN.md §2 / §3，v2 产线真实化）：
 *  - 5 工位：START / P1 / P2 / P3 / END，交错分布在中央地轨两侧、料台有高低差。
 *    每个工位最多持有一个零件。
 *  - 2 台地轨机械手（滑台沿轨道行走），各负责半条产线的相邻流转，
 *    IDLE 时扫描自己负责的段，谁的两端同时就绪就认领谁；每次只抓一个零件。
 *  - 工序三态 WAIT_IN → PROCESSING → WAIT_OUT → WAIT_IN：
 *    加工完必须等下游机械手搬走；搬走后还必须等上游机械手放料才重新开工。
 *  - progress += dt * rate，rate 即生产频率（件/秒）。
 *  - 零件位置由 location 推导，渲染层只读，不反向写状态。
 */

export type StationId = 'START' | 'P1' | 'P2' | 'P3' | 'END';
export type RobotId = 'R1' | 'R2';
export type StationKind = 'start' | 'process' | 'end';
export type StationState = 'WAIT_IN' | 'PROCESSING' | 'WAIT_OUT';
export type RobotPhase =
  | 'IDLE'
  | 'APPROACH'
  | 'GRIP'
  | 'LIFT'
  | 'TRANSFER'
  | 'DESCEND'
  | 'RELEASE'
  | 'RETRACT';

export const STATION_IDS: StationId[] = ['START', 'P1', 'P2', 'P3', 'END'];
export const PROCESS_IDS: StationId[] = ['P1', 'P2', 'P3'];

/** 一段相邻流转 */
export interface RobotSegment {
  from: StationId;
  to: StationId;
}

/**
 * R1 管左半（START→P1、P1→P2），R2 管右半（P2→P3、P3→END）。
 * 两台工作区间不重叠，不会在轨道上互相穿越；交接工位 P2 由状态机门控互斥。
 */
export const ROBOT_DEFS: { id: RobotId; homeX: number; segments: RobotSegment[] }[] = [
  {
    id: 'R1',
    homeX: -5.4,
    segments: [
      { from: 'START', to: 'P1' },
      { from: 'P1', to: 'P2' },
    ],
  },
  {
    id: 'R2',
    homeX: 5.4,
    segments: [
      { from: 'P2', to: 'P3' },
      { from: 'P3', to: 'END' },
    ],
  },
];

export const ROBOT_DEF_MAP: Record<RobotId, (typeof ROBOT_DEFS)[number]> = Object.fromEntries(
  ROBOT_DEFS.map((d) => [d.id, d]),
) as Record<RobotId, (typeof ROBOT_DEFS)[number]>;

/** 一次搬运 cycle 的阶段顺序（IDLE 不在其中，RETRACT 后回到 IDLE） */
export const PHASE_ORDER: RobotPhase[] = [
  'APPROACH', 'GRIP', 'LIFT', 'TRANSFER', 'DESCEND', 'RELEASE', 'RETRACT',
];

/** 各阶段时长（秒），由 timeScale 统一缩放；行走段留足时间体现地轨运动 */
export const PHASE_DURATION: Record<RobotPhase, number> = {
  IDLE: 0,
  APPROACH: 0.75,
  GRIP: 0.25,
  LIFT: 0.4,
  TRANSFER: 1.2,
  DESCEND: 0.6,
  RELEASE: 0.25,
  RETRACT: 0.7,
};

export const RATE_MIN = 0.2;
export const RATE_MAX = 2.0;
export const RATE_DEFAULT = 1.0;
/** 上线固定节拍：料台空时每 1.2s 产出一个零件 */
export const START_INTERVAL = 1.2;

export interface Station {
  id: StationId;
  kind: StationKind;
  state: StationState;
  partId: string | null;
  progress: number;
  rate: number;
}

export interface Robot {
  id: RobotId;
  /** 轨道停泊位 */
  homeX: number;
  /** 段扫描起点，轮询避免某一段饥饿 */
  cursor: number;
  phase: RobotPhase;
  phaseT: number;
  partId: string | null;
  /** 本次 cycle 的实际源/目标工位（渲染层做 IK、行走插值与取放过渡用） */
  carryFrom: StationId;
  carryTo: StationId;
}

export interface Part {
  id: string;
  location: { type: 'station' | 'robot'; id: string };
}

export interface SimState {
  stations: Station[];
  robots: Robot[];
  parts: Record<string, Part>;
  finished: number;
  nextPartSeq: number;
  startTimer: number;
  paused: boolean;
  timeScale: number;
}

export function createSim(): SimState {
  return {
    stations: STATION_IDS.map((id) => ({
      id,
      kind: id === 'START' ? 'start' : id === 'END' ? 'end' : 'process',
      state: 'WAIT_IN',
      partId: null,
      progress: 0,
      rate: RATE_DEFAULT,
    })),
    robots: ROBOT_DEFS.map((d) => ({
      id: d.id,
      homeX: d.homeX,
      cursor: 0,
      phase: 'IDLE' as RobotPhase,
      phaseT: 0,
      partId: null,
      carryFrom: d.segments[0].from,
      carryTo: d.segments[0].to,
    })),
    parts: {},
    finished: 0,
    nextPartSeq: 0,
    startTimer: 0,
    paused: false,
    timeScale: 1,
  };
}

/** 原地重置，保持 SimState 引用不变（渲染层持的是同一个 ref） */
export function resetSim(sim: SimState): void {
  Object.assign(sim, createSim());
}

export function getStation(sim: SimState, id: StationId): Station {
  const s = sim.stations.find((x) => x.id === id);
  if (!s) throw new Error(`unknown station: ${id}`);
  return s;
}

export function setStationRate(sim: SimState, id: StationId, rate: number): void {
  const s = getStation(sim, id);
  if (s.kind !== 'process') return;
  s.rate = Math.max(RATE_MIN, Math.min(RATE_MAX, rate));
}

export function stateLabel(s: Station): string {
  if (s.kind === 'start') return '来料';
  if (s.kind === 'end') return '出货';
  if (s.state === 'PROCESSING') return '加工中';
  return s.state === 'WAIT_OUT' ? '等待搬离' : '等待来料';
}

function spawnPart(sim: SimState, stationId: StationId): Part {
  const id = `part-${sim.nextPartSeq++}`;
  const part: Part = { id, location: { type: 'station', id: stationId } };
  sim.parts[id] = part;
  return part;
}

/** 源工位是否有一个「可以交给下游」的零件 */
function canGive(sim: SimState, id: StationId): boolean {
  const s = getStation(sim, id);
  if (s.kind === 'end' || s.partId === null) return false;
  if (s.kind === 'start') return true;
  // 工序：必须加工完成（WAIT_OUT）才允许被搬走
  return s.state === 'WAIT_OUT' && s.progress >= 1;
}

/** 目标工位是否能接收新零件 */
function canReceive(sim: SimState, id: StationId): boolean {
  const s = getStation(sim, id);
  if (s.kind === 'end') return true;
  return s.state === 'WAIT_IN' && s.partId === null;
}

function advancePhase(r: Robot): void {
  const idx = PHASE_ORDER.indexOf(r.phase);
  r.phase = PHASE_ORDER[idx + 1] ?? 'IDLE';
  r.phaseT = 0;
}

/** APPROACH 结束：夹爪闭合，零件从源工位转移到机械手 */
function pick(sim: SimState, r: Robot): void {
  const src = getStation(sim, r.carryFrom);
  const partId = src.partId;
  if (partId === null) return;
  src.partId = null;
  r.partId = partId;
  const part = sim.parts[partId];
  if (part) part.location = { type: 'robot', id: r.id };
  if (src.kind === 'process') {
    src.state = 'WAIT_IN';
    src.progress = 0;
  }
}

/** RELEASE 结束：零件落到目标工位；END 直接吸收计数 */
function place(sim: SimState, r: Robot): void {
  const dst = getStation(sim, r.carryTo);
  const partId = r.partId;
  r.partId = null;
  if (partId === null) return;
  if (dst.kind === 'end') {
    delete sim.parts[partId];
    sim.finished += 1;
  } else {
    dst.partId = partId;
    const part = sim.parts[partId];
    if (part) part.location = { type: 'station', id: dst.id };
  }
}

/**
 * 推进一帧。dtRaw 单位秒；内部 clamp 防止切后台回来后一次大跳跨过多个阶段。
 * 采用原地 mutate：R3F 的 useFrame 每帧调用，避免 60fps 触发 React 重渲染。
 */
export function stepSim(sim: SimState, dtRaw: number): void {
  if (sim.paused) return;
  const dt = Math.min(Math.max(dtRaw, 0), 0.05) * sim.timeScale;
  if (dt <= 0) return;

  // 1) 上线：料台空时按固定节拍产件，满了就等（不堆积）
  const start = getStation(sim, 'START');
  if (start.partId === null) {
    sim.startTimer += dt;
    if (sim.startTimer >= START_INTERVAL) {
      sim.startTimer = 0;
      start.partId = spawnPart(sim, 'START').id;
    }
  } else {
    sim.startTimer = 0;
  }

  // 2) 工序：进度推进 / 门控开工
  for (const s of sim.stations) {
    if (s.kind !== 'process') continue;
    if (s.state === 'PROCESSING') {
      s.progress = Math.min(1, s.progress + dt * s.rate);
      if (s.progress >= 1) s.state = 'WAIT_OUT';
    } else if (s.state === 'WAIT_IN' && s.partId !== null) {
      // 上游机械手刚放料 → 才允许开工
      s.state = 'PROCESSING';
      s.progress = 0;
    }
    // WAIT_OUT 且未被搬走 → 保持等待；WAIT_IN 且无件 → 保持等待
  }

  // 3) 地轨机械手：空闲时扫描负责段，两端同时就绪才认领一次 cycle
  for (const r of sim.robots) {
    if (r.phase === 'IDLE') {
      const def = ROBOT_DEF_MAP[r.id];
      const n = def.segments.length;
      for (let k = 0; k < n; k++) {
        const idx = (r.cursor + k) % n;
        const seg = def.segments[idx];
        if (canGive(sim, seg.from) && canReceive(sim, seg.to)) {
          r.carryFrom = seg.from;
          r.carryTo = seg.to;
          r.cursor = (idx + 1) % n;
          r.phase = 'APPROACH';
          r.phaseT = 0;
          break;
        }
      }
      continue;
    }

    r.phaseT += dt;
    const dur = PHASE_DURATION[r.phase];
    if (r.phaseT < dur) continue;

    switch (r.phase) {
      case 'APPROACH':
        pick(sim, r);
        break;
      case 'RELEASE':
        place(sim, r);
        break;
      default:
        break;
    }
    advancePhase(r);
  }
}
