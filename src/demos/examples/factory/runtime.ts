/**
 * 渲染层共享运行时：所有 mesh / material 的引用注册表。
 *
 * 为什么需要它：sim 每帧都在变，但不想每帧 setState 触发 React 重渲染 60fps。
 * 子组件挂载时把 three 对象注册进来，SimDriver 的单个 useFrame 直接改这些对象。
 */
import { Vector3, type Group, type Mesh, type MeshStandardMaterial, type Object3D } from 'three';
import { ROBOT_DEFS, type RobotId, type StationId } from './sim';

export interface ArmRefs {
  /** 滑台：沿轨道 X 行走 */
  carriage: Group | null;
  /** 升降立柱 + 机械臂：Y 方向补偿料台高低差 */
  column: Group | null;
  yaw: Group | null;
  shoulder: Group | null;
  elbow: Group | null;
  wrist: Group | null;
  fingerL: Mesh | null;
  fingerR: Mesh | null;
  anchor: Object3D | null;
}

export interface StationRefs {
  lamp: MeshStandardMaterial | null;
  progress: Group | null;
}

export interface ViewRuntime {
  arms: Partial<Record<RobotId, ArmRefs>>;
  stations: Partial<Record<StationId, StationRefs>>;
  /** 固定零件池：mesh 复用，靠 visible 控制，不做动态增删 */
  partPool: (Mesh | null)[];
  /** 每台机械手夹爪的世界坐标，由 FK 每帧更新 */
  gripperPos: Record<RobotId, Vector3>;
}

export function createViewRuntime(): ViewRuntime {
  const gripperPos = {} as Record<RobotId, Vector3>;
  for (const d of ROBOT_DEFS) gripperPos[d.id] = new Vector3();
  return { arms: {}, stations: {}, partPool: [], gripperPos };
}

export function armRefs(rt: ViewRuntime, id: RobotId): ArmRefs {
  let refs = rt.arms[id];
  if (!refs) {
    refs = {
      carriage: null,
      column: null,
      yaw: null,
      shoulder: null,
      elbow: null,
      wrist: null,
      fingerL: null,
      fingerR: null,
      anchor: null,
    };
    rt.arms[id] = refs;
  }
  return refs;
}

export function stationRefs(rt: ViewRuntime, id: StationId): StationRefs {
  let refs = rt.stations[id];
  if (!refs) {
    refs = { lamp: null, progress: null };
    rt.stations[id] = refs;
  }
  return refs;
}
