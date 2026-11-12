/**
 * 场景组装 + 唯一动画驱动。
 * SimDriver 每帧：stepSim → 轨道行走/立柱升降/关节 IK → FK 夹爪世界坐标 →
 * 工位灯与进度条 → 摆放零件池，全程直接操作 three 对象，不触发 React 重渲染。
 */
import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3, type PerspectiveCamera } from 'three';
import {
  PHASE_DURATION,
  stepSim,
  type Part,
  type SimState,
  type StationId,
} from './sim';
import {
  LAMP_BUSY,
  LAMP_IDLE,
  cycleGeom,
  fingerOffset,
  liftYAt,
  poseAt,
  railXAt,
  stationPartPos,
} from './layout';
import type { ViewRuntime } from './runtime';
import StationView from './Station';
import RobotArm from './RobotArm';
import PartPool from './PartPool';
import FactoryEnvironment from './Environment';

const tmpA = new Vector3();
const tmpB = new Vector3();
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 抓取/放置阶段做位置插值，避免零件在工位与夹爪之间瞬移 */
function resolvePartPos(sim: SimState, part: Part, rt: ViewRuntime): Vector3 {
  if (part.location.type === 'station') {
    const [x, y, z] = stationPartPos(part.location.id as StationId);
    return tmpA.set(x, y, z);
  }
  const robot = sim.robots.find((r) => r.id === part.location.id);
  if (!robot) return tmpA.set(0, 0, 0);
  const gp = rt.gripperPos[robot.id];

  if (robot.phase === 'GRIP') {
    const [x, y, z] = stationPartPos(robot.carryFrom);
    return tmpA.set(x, y, z).lerp(gp, clamp01(robot.phaseT / PHASE_DURATION.GRIP));
  }
  if (robot.phase === 'RELEASE') {
    const [x, y, z] = stationPartPos(robot.carryTo);
    tmpB.set(x, y, z);
    return tmpA.copy(gp).lerp(tmpB, clamp01(robot.phaseT / PHASE_DURATION.RELEASE));
  }
  return tmpA.copy(gp);
}

function SimDriver({ sim, runtime }: { sim: SimState; runtime: ViewRuntime }) {
  useFrame((_, dt) => {
    stepSim(sim, dt);

    // 1) 地轨机械手：滑台 X / 立柱 Y / 关节 IK / FK 夹爪世界坐标
    for (const r of sim.robots) {
      const refs = runtime.arms[r.id];
      const g = cycleGeom(r.carryFrom, r.carryTo, r.homeX);
      if (refs?.carriage) refs.carriage.position.x = railXAt(r.phase, r.phaseT, g);
      if (refs?.column) refs.column.position.y = liftYAt(r.phase, r.phaseT, g);

      const pose = poseAt(r.phase, r.phaseT, g);
      if (refs?.yaw) refs.yaw.rotation.y = pose.j1;
      if (refs?.shoulder) refs.shoulder.rotation.x = pose.j2;
      if (refs?.elbow) refs.elbow.rotation.x = pose.j3;
      if (refs?.wrist) refs.wrist.rotation.x = pose.j4;
      const f = fingerOffset(pose.grip);
      if (refs?.fingerL) refs.fingerL.position.x = -f;
      if (refs?.fingerR) refs.fingerR.position.x = f;
      if (refs?.anchor) {
        refs.anchor.updateWorldMatrix(true, false);
        refs.anchor.getWorldPosition(runtime.gripperPos[r.id]);
      }
    }

    // 2) 工位：两态灯 + 进度条
    for (const s of sim.stations) {
      const refs = runtime.stations[s.id];
      const busy = s.kind === 'process' && s.state === 'PROCESSING';
      const cfg = busy ? LAMP_BUSY : LAMP_IDLE;
      if (refs?.lamp) {
        refs.lamp.color.set(cfg.color);
        refs.lamp.emissive.set(cfg.emissive);
        refs.lamp.emissiveIntensity = cfg.intensity;
      }
      if (refs?.progress) refs.progress.scale.x = Math.max(0.001, Math.min(1, s.progress));
    }

    // 3) 零件池：按 location 摆位
    const ids = Object.keys(sim.parts);
    for (let i = 0; i < runtime.partPool.length; i++) {
      const mesh = runtime.partPool[i];
      if (!mesh) continue;
      const id = ids[i];
      if (!id) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      mesh.position.copy(resolvePartPos(sim, sim.parts[id], runtime));
    }
  });
  return null;
}

/**
 * 视口自适应：按产线包围盒半宽 + 当前水平 fov 反算所需相机距离，
 * 保证交错排布的 5 工位、中央地轨与围栏在任意宽高比（尤其竖屏）下都完整可见。
 */
function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const cam = camera as PerspectiveCamera;
    cam.fov = aspect < 0.85 ? 50 : 35;
    const vFov = (cam.fov * Math.PI) / 180;
    const halfHFov = Math.atan(Math.tan(vFov / 2) * aspect);
    // 工位 ±10.8 + 设备/围栏外扩 + 透视余量
    const halfWidth = 15;
    const dist = Math.max(22, (halfWidth / Math.max(Math.tan(halfHFov), 0.08)) * 1.08);
    camera.position.set(dist * 0.16, dist * 0.42, dist * 0.9);
    camera.lookAt(0, 1.1, 0);
    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

interface Props {
  sim: SimState;
  runtime: ViewRuntime;
  onSelect: (id: StationId) => void;
}

export default function Scene({ sim, runtime, onSelect }: Props) {
  return (
    <>
      <color attach="background" args={['#070b14']} />
      <ambientLight intensity={0.78} color="#a8c8ff" />
      <directionalLight position={[8, 16, 12]} intensity={1.9} color="#fff6e8" />
      <pointLight position={[0, 7, -8]} intensity={1.2} color="#22d3ee" distance={40} />
      <pointLight position={[0, 6, 8]} intensity={0.7} color="#ffd9a0" distance={36} />

      <SimDriver sim={sim} runtime={runtime} />
      <FactoryEnvironment />
      {sim.stations.map((s) => (
        <StationView key={s.id} station={s} runtime={runtime} onSelect={onSelect} />
      ))}
      {sim.robots.map((r) => (
        <RobotArm key={r.id} robot={r} runtime={runtime} />
      ))}
      <PartPool runtime={runtime} />

      <CameraFit />
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={120}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 1.1, 0]}
      />
    </>
  );
}
