/**
 * 工厂 demo 的几何布局 + 机械臂运动学。
 * 零 three / React 依赖，可独立单测。依赖方向：layout → sim（仅取类型与阶段时长）。
 *
 * 产线形态（v2 真实化）：
 *  - 中央一条沿 X 的地轨，两台机械手在滑台上行走。
 *  - 五个工位交错分布在轨道两侧（Z 正负交替），间距拉开，料台有高低差。
 *  - 机械手靠「轨道行走 + 底座回转 + 立柱升降 + 两连杆臂展」四组自由度取放零件。
 *  - 取料/放料姿态由 2 连杆 IK 实时解算，夹爪挂点精确落在料台零件中心。
 */

import { PHASE_DURATION, type RobotId, type RobotPhase, type StationId } from './sim';

/* ───────────────────────── 1. 工位与轨道布局 ───────────────────────── */

export interface StationLayout {
  /** 沿轨道方向的坐标 */
  x: number;
  /** 料台中心相对轨道的侧向偏移：>0 在 +Z 侧，<0 在 -Z 侧 */
  z: number;
  /** 料台顶面高度（高低差来源） */
  deckY: number;
}

/** 间距 5.4（原 4）、Z 交错、台面 1.00~1.52 高低错落 */
export const STATION_LAYOUT: Record<StationId, StationLayout> = {
  START: { x: -10.8, z: 2.42, deckY: 0.92 },
  P1: { x: -5.4, z: -2.62, deckY: 1.50 },
  P2: { x: 0.0, z: 2.08, deckY: 1.08 },
  P3: { x: 5.4, z: -2.38, deckY: 1.76 },
  END: { x: 10.8, z: 2.55, deckY: 0.92 },
};

/** 兼容老的按 X 取值调用 */
export const STATION_X: Record<StationId, number> = Object.fromEntries(
  (Object.keys(STATION_LAYOUT) as StationId[]).map((id) => [id, STATION_LAYOUT[id].x]),
) as Record<StationId, number>;

/** 工位正面朝轨道：+Z 侧工位整体旋转 180°，局部 +Z 指向轨道 */
export function stationFacing(id: StationId): number {
  return STATION_LAYOUT[id].z > 0 ? Math.PI : 0;
}

/** 中央地轨 */
export const RAIL = {
  halfSpan: 12.9,
  gauge: 0.9,
  y: 0.14,
};

/** 零件中心 = 料台顶面 + 半高 + 微小间隙 */
export const PART_LIFT = 0.13;
export const PART_SIZE = 0.24;

export function stationPartPos(id: StationId): [number, number, number] {
  const d = STATION_LAYOUT[id];
  return [d.x, d.deckY + PART_LIFT, d.z];
}

/** 机械手停泊位（各管半条产线） */
export const ROBOT_HOME_X: Record<RobotId, number> = { R1: -5.4, R2: 5.4 };
/** 机械手基座恒在轨道中心线上 */
export const ROBOT_Z = 0;

/* ───────────────────────── 2. 机械臂尺寸与 FK ───────────────────────── */

/**
 * baseY：肩关节相对滑台的高度（立柱 + 回转座）
 * L1 大臂 / L2 小臂 / L3 腕到夹爪座 / END 夹爪座到零件挂点
 */
export const ARM = {
  /** 抬高肩关节：取放时形成「肘在上、夹爪下探」的拱形，臂不会被设备遮挡 */
  baseY: 1.85,
  L1: 1.62,
  L2: 1.55,
  L3: 0.38,
  END: 0.22,
  bigW: 0.36,
  smallW: 0.3,
};

/** 腕部到夹爪挂点的长度 */
export const GRIP_LEN = ARM.L3 + ARM.END;

/** 夹爪开合：grip=1 张开，grip=0 闭合 */
export function fingerOffset(grip: number): number {
  return 0.09 + grip * 0.13;
}

/** 五个关节角：j1=底座回转(y)，j2/j3/j4=肩/肘/腕俯仰(x)，grip=夹爪开合 */
export interface Pose {
  j1: number;
  j2: number;
  j3: number;
  j4: number;
  grip: number;
}

/**
 * 正运动学：以肩为原点，返回夹爪挂点在「yaw 之后的局部平面」中的坐标。
 * r 沿局部 +Z，y 沿 +Y。用于单测校验 IK，不参与渲染（渲染用 three 的世界坐标）。
 */
export function fkGripLocal(p: Pose): { r: number; y: number } {
  const a1 = p.j2;
  const a2 = p.j2 + p.j3;
  const a3 = a2 + p.j4;
  return {
    r: ARM.L1 * Math.sin(a1) + ARM.L2 * Math.sin(a2) + GRIP_LEN * Math.sin(a3),
    y: ARM.L1 * Math.cos(a1) + ARM.L2 * Math.cos(a2) + GRIP_LEN * Math.cos(a3),
  };
}

/* ───────────────────────── 3. 一次搬运的几何上下文 ───────────────────────── */

export interface DockPoint {
  x: number;
  /** 零件中心高度 */
  y: number;
  z: number;
  /** 料台顶面高度 */
  deckY: number;
}

export interface CycleGeom {
  src: DockPoint;
  dst: DockPoint;
  homeX: number;
}

export function dockOf(id: StationId): DockPoint {
  const d = STATION_LAYOUT[id];
  return { x: d.x, y: d.deckY + PART_LIFT, z: d.z, deckY: d.deckY };
}

export function cycleGeom(from: StationId, to: StationId, homeX: number): CycleGeom {
  return { src: dockOf(from), dst: dockOf(to), homeX };
}

/** 默认几何：源在 -Z 侧、目标在 +Z 侧，供无上下文的调用（含单测）使用 */
export const DEFAULT_GEOM: CycleGeom = {
  src: { x: -5.4, y: 1.63, z: -2.62, deckY: 1.5 },
  dst: { x: 0.0, y: 1.21, z: 2.08, deckY: 1.08 },
  homeX: -5.4,
};

/* ───────────────────────── 4. 轨道行走 / 立柱升降 ───────────────────────── */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const phaseT01 = (phase: RobotPhase, phaseT: number) =>
  easeInOut(clamp01(phaseT / (PHASE_DURATION[phase] || 1)));

/** 立柱升降：补偿料台高低差，让肩关节始终处在舒适作业高度 */
const BASE_DECK = 1.18;
export function liftFor(deckY: number): number {
  return (deckY - BASE_DECK) * 0.7;
}

/** 滑台在轨道上的 X 坐标 */
export function railXAt(phase: RobotPhase, phaseT: number, g: CycleGeom = DEFAULT_GEOM): number {
  if (phase === 'IDLE') return g.homeX;
  const t = phaseT01(phase, phaseT);
  switch (phase) {
    case 'APPROACH':
      return mix(g.homeX, g.src.x, t);
    case 'GRIP':
    case 'LIFT':
      return g.src.x;
    case 'TRANSFER':
      return mix(g.src.x, g.dst.x, t);
    case 'DESCEND':
    case 'RELEASE':
      return g.dst.x;
    case 'RETRACT':
      return mix(g.dst.x, g.homeX, t);
    default:
      return g.homeX;
  }
}

/** 升降立柱的 Y 偏移 */
export function liftYAt(phase: RobotPhase, phaseT: number, g: CycleGeom = DEFAULT_GEOM): number {
  if (phase === 'IDLE') return 0;
  const t = phaseT01(phase, phaseT);
  const a = liftFor(g.src.deckY);
  const b = liftFor(g.dst.deckY);
  switch (phase) {
    case 'APPROACH':
      return mix(0, a, t);
    case 'GRIP':
    case 'LIFT':
      return a;
    case 'TRANSFER':
      return mix(a, b, t);
    case 'DESCEND':
    case 'RELEASE':
      return b;
    case 'RETRACT':
      return mix(b, 0, t);
    default:
      return 0;
  }
}

/* ───────────────────────── 5. 姿态：IK + 阶段目标 ───────────────────────── */

/**
 * 2 连杆 IK：把夹爪挂点送到相对肩的 (r, h)。
 * 末端 L3' 保持竖直向下（夹爪自上而下抓料台），故先解腕部到 (r, h + GRIP_LEN)。
 */
function solveArm(r: number, h: number): { j2: number; j3: number; j4: number } {
  const { L1, L2 } = ARM;
  const wr = r;
  const wy = h + GRIP_LEN;
  const dRaw = Math.hypot(wr, wy);
  const d = clamp(dRaw, Math.abs(L1 - L2) + 0.01, L1 + L2 - 0.01);
  const phi = Math.atan2(wr, wy);
  const alpha = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const j2 = phi - alpha;
  const gamma = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  const j3 = Math.PI - gamma;
  const j4 = Math.PI - j2 - j3;
  return { j2, j3, j4 };
}

/** 待机：臂在胸前折叠、夹爪朝下张开，整体不越过厂房桁架 */
export const IDLE_POSE: Pose = { j1: 0, j2: 0.6, j3: 1.6, j4: Math.PI - 0.6 - 1.6, grip: 1 };
/** 搬运：零件举到设备上方、臂收拢，沿轨道行走时不扫到工位 */
export const CARRY_POSE: Omit<Pose, 'j1' | 'grip'> = {
  j2: 0.12,
  j3: 1.18,
  j4: Math.PI - 0.12 - 1.18,
};

/** 侧向停靠角：工位在 +Z 侧时朝向 0，在 -Z 侧时回转 180° */
function dockYaw(dock: DockPoint): number {
  return Math.atan2(0, dock.z);
}

/** 伸向某料台的 IK 姿态（假设滑台已停靠在该工位 X 上） */
function reachPose(dock: DockPoint, liftY: number, grip: number): Pose {
  const r = Math.abs(dock.z - ROBOT_Z);
  const h = dock.y - (ARM.baseY + liftY);
  const { j2, j3, j4 } = solveArm(r, h);
  return { j1: dockYaw(dock), j2, j3, j4, grip };
}

/** 各阶段「结束时」的目标姿态 */
export function poseTarget(phase: RobotPhase, g: CycleGeom = DEFAULT_GEOM): Pose {
  const srcYaw = dockYaw(g.src);
  const dstYaw = dockYaw(g.dst);
  switch (phase) {
    case 'IDLE':
      return IDLE_POSE;
    case 'APPROACH':
      return reachPose(g.src, liftFor(g.src.deckY), 1);
    case 'GRIP':
      return reachPose(g.src, liftFor(g.src.deckY), 0);
    case 'LIFT':
      return { j1: srcYaw, ...CARRY_POSE, grip: 0 };
    case 'TRANSFER':
      return { j1: dstYaw, ...CARRY_POSE, grip: 0 };
    case 'DESCEND':
      return reachPose(g.dst, liftFor(g.dst.deckY), 0);
    case 'RELEASE':
      return reachPose(g.dst, liftFor(g.dst.deckY), 1);
    case 'RETRACT':
      return IDLE_POSE;
    default:
      return IDLE_POSE;
  }
}

/** 进入某阶段前的姿态（即上一阶段结束姿态） */
export const PHASE_PREV: Record<RobotPhase, RobotPhase> = {
  IDLE: 'IDLE',
  APPROACH: 'IDLE',
  GRIP: 'APPROACH',
  LIFT: 'GRIP',
  TRANSFER: 'LIFT',
  DESCEND: 'TRANSFER',
  RELEASE: 'DESCEND',
  RETRACT: 'RELEASE',
};

/** 按阶段进度插值出当前关节姿态（纯函数，可单测） */
export function poseAt(phase: RobotPhase, phaseT: number, g: CycleGeom = DEFAULT_GEOM): Pose {
  const target = poseTarget(phase, g);
  if (phase === 'IDLE') return target;
  const prev = poseTarget(PHASE_PREV[phase], g);
  const t = phaseT01(phase, phaseT);
  return {
    j1: mix(prev.j1, target.j1, t),
    j2: mix(prev.j2, target.j2, t),
    j3: mix(prev.j3, target.j3, t),
    j4: mix(prev.j4, target.j4, t),
    grip: mix(prev.grip, target.grip, t),
  };
}

/* ───────────────────────── 6. 视觉常量 ───────────────────────── */

/** 两态状态灯配色：空闲灰蓝 / 加工中亮青 */
export const LAMP_IDLE = { color: '#53708d', emissive: '#18344d', intensity: 0.55 };
export const LAMP_BUSY = { color: '#22d3ee', emissive: '#22d3ee', intensity: 1.7 };

export const PART_POOL_SIZE = 12;
export const PROGRESS_BAR_W = 1.7;
