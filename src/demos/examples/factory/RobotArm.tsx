/**
 * 地轨式六轴机械手（程序化几何体，零模型依赖）。
 *
 * 结构：滑台 carriage（沿轨道 X 行走）→ 升降立柱 column（Y 补偿料台高低差）
 *      → j1 回转 → j2 肩 → j3 肘 → j4 腕 → 夹爪 + 零件挂点 anchor。
 * 关节角与 carriage/column 位移全部由 SimDriver 每帧写入，
 * anchor 的世界坐标即夹爪抓持点，零件跟随它完成「侧向伸出 + 大回转 + 轨道行走」。
 */
import { useEffect, useRef } from 'react';
import type { Group, Mesh, Object3D } from 'three';
import type { Robot } from './sim';
import { ARM, RAIL, ROBOT_HOME_X, ROBOT_Z, fingerOffset } from './layout';
import { armRefs, type ViewRuntime } from './runtime';

const YELLOW = '#ffc23d';
const JOINT = '#ffd970';
const DARK = '#6b5018';
const ACCENT: Record<Robot['id'], string> = { R1: '#22d3ee', R2: '#ff9a3d' };

const WHEELS: [number, number][] = [
  [-0.5, RAIL.gauge / 2],
  [0.5, RAIL.gauge / 2],
  [-0.5, -RAIL.gauge / 2],
  [0.5, -RAIL.gauge / 2],
];

interface Props {
  robot: Robot;
  runtime: ViewRuntime;
}

export default function RobotArm({ robot, runtime }: Props) {
  const carriage = useRef<Group>(null);
  const column = useRef<Group>(null);
  const yaw = useRef<Group>(null);
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const wrist = useRef<Group>(null);
  const fingerL = useRef<Mesh>(null);
  const fingerR = useRef<Mesh>(null);
  const anchor = useRef<Object3D>(null);

  useEffect(() => {
    const refs = armRefs(runtime, robot.id);
    refs.carriage = carriage.current;
    refs.column = column.current;
    refs.yaw = yaw.current;
    refs.shoulder = shoulder.current;
    refs.elbow = elbow.current;
    refs.wrist = wrist.current;
    refs.fingerL = fingerL.current;
    refs.fingerR = fingerR.current;
    refs.anchor = anchor.current;
  }, [runtime, robot.id]);

  const accent = ACCENT[robot.id];

  return (
    <group ref={carriage} position={[ROBOT_HOME_X[robot.id], 0, ROBOT_Z]}>
      {/* ── 地轨滑台 ── */}
      <mesh position={[0, RAIL.y + 0.19, 0]}>
        <boxGeometry args={[1.5, 0.22, RAIL.gauge + 0.62]} />
        <meshStandardMaterial color="#2b3543" metalness={0.72} roughness={0.38} />
      </mesh>
      {/* 滑台侧裙 + 机身识别灯 */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, RAIL.y + 0.08, s * (RAIL.gauge / 2 + 0.32)]}>
          <boxGeometry args={[1.44, 0.1, 0.06]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
        </mesh>
      ))}
      {WHEELS.map(([x, z], i) => (
        <mesh key={i} position={[x, RAIL.y + 0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
          <meshStandardMaterial color="#111a26" metalness={0.7} roughness={0.45} />
        </mesh>
      ))}
      {/* 滑台前后警示条 */}
      {[-0.76, 0.76].map((x) => (
        <mesh key={x} position={[x, RAIL.y + 0.32, 0]}>
          <boxGeometry args={[0.06, 0.06, RAIL.gauge + 0.62]} />
          <meshStandardMaterial color={YELLOW} emissive="#6b4700" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* ── 升降立柱 + 机械臂 ── */}
      <group ref={column} position={[0, 0, 0]}>
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.46, 0.54, 0.34, 16]} />
          <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.45} />
        </mesh>
        <mesh position={[0, (0.53 + ARM.baseY) / 2, 0]}>
          <cylinderGeometry args={[0.28, 0.34, ARM.baseY - 0.53, 16]} />
          <meshStandardMaterial color={YELLOW} metalness={0.55} roughness={0.4} />
        </mesh>
        {/* 升降导轨 */}
        <mesh position={[0, (0.53 + ARM.baseY) / 2, 0.3]}>
          <boxGeometry args={[0.1, ARM.baseY - 0.53, 0.06]} />
          <meshStandardMaterial color="#42566e" metalness={0.6} roughness={0.45} />
        </mesh>

        {/* j1 回转 */}
        <group ref={yaw} position={[0, ARM.baseY, 0]}>
          <mesh>
            <sphereGeometry args={[0.38, 16, 12]} />
            <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.35} />
          </mesh>

          {/* j2 肩 */}
          <group ref={shoulder}>
            <mesh position={[0, ARM.L1 / 2, 0]}>
              <boxGeometry args={[ARM.bigW, ARM.L1, ARM.bigW]} />
              <meshStandardMaterial color={YELLOW} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* j3 肘 */}
            <group ref={elbow} position={[0, ARM.L1, 0]}>
              <mesh>
                <sphereGeometry args={[0.3, 16, 12]} />
                <meshStandardMaterial color={JOINT} metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh position={[0, ARM.L2 / 2, 0]}>
                <boxGeometry args={[ARM.smallW, ARM.L2, ARM.smallW]} />
                <meshStandardMaterial color={YELLOW} metalness={0.5} roughness={0.4} />
              </mesh>

              {/* j4 腕 */}
              <group ref={wrist} position={[0, ARM.L2, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.18, 0.18, 0.3, 12]} />
                  <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
                </mesh>

                <group position={[0, ARM.L3, 0]}>
                  <mesh>
                    <boxGeometry args={[0.46, 0.15, 0.3]} />
                    <meshStandardMaterial color="#9fb0c4" metalness={0.6} roughness={0.35} />
                  </mesh>
                  {/* j5 夹爪两指 */}
                  <mesh ref={fingerL} position={[-fingerOffset(1), 0.18, 0]}>
                    <boxGeometry args={[0.09, 0.36, 0.18]} />
                    <meshStandardMaterial color="#cbd8e6" metalness={0.65} roughness={0.3} />
                  </mesh>
                  <mesh ref={fingerR} position={[fingerOffset(1), 0.18, 0]}>
                    <boxGeometry args={[0.09, 0.36, 0.18]} />
                    <meshStandardMaterial color="#cbd8e6" metalness={0.65} roughness={0.3} />
                  </mesh>
                  {/* 零件跟随的挂点 */}
                  <object3D ref={anchor} position={[0, ARM.END, 0]} />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
