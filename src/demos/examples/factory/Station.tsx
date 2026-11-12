/** 统一工位封装：START / 工序 / END 共用同一个组件，只有台面高度与朝向不同。 */
import { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import type { Group, MeshStandardMaterial } from 'three';
import type { Station as StationModel, StationId } from './sim';
import {
  LAMP_IDLE,
  PROGRESS_BAR_W,
  STATION_LAYOUT,
  stationFacing,
} from './layout';
import { stationRefs, type ViewRuntime } from './runtime';

export const LABELS: Record<StationId, string> = {
  START: '上线 START',
  P1: '工序 1',
  P2: '工序 2',
  P3: '工序 3',
  END: '下线 END',
};

interface Props {
  station: StationModel;
  runtime: ViewRuntime;
  onSelect: (id: StationId) => void;
}

export default function StationView({ station, runtime, onSelect }: Props) {
  const lamp = useRef<MeshStandardMaterial>(null);
  const progress = useRef<Group>(null);
  const downAt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const refs = stationRefs(runtime, station.id);
    refs.lamp = lamp.current;
    refs.progress = progress.current;
  }, [runtime, station.id]);

  const d = STATION_LAYOUT[station.id];
  const deck = d.deckY;
  const isProcess = station.kind === 'process';
  const bodyH = Math.max(0.2, deck - 0.2);

  return (
    <group position={[d.x, 0, d.z]} rotation={[0, stationFacing(station.id), 0]}>
      {/* ── 落地机柜：把设备抬到各自的台面高度 ── */}
      <mesh position={[0, bodyH / 2, -1.05]}>
        <boxGeometry args={[2.4, bodyH, 1.5]} />
        <meshStandardMaterial color="#1c2837" metalness={0.42} roughness={0.68} />
      </mesh>
      {/* 机柜门缝 / 散热格栅 */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, bodyH * 0.55, -0.29]}>
          <boxGeometry args={[0.9, 0.03, 0.02]} />
          <meshStandardMaterial color="#3b4d62" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* ── 机床主体（点击调频率）：白色钣金 ── */}
      <mesh
        position={[0, deck + 0.25, -1.05]}
        onPointerDown={(e) => {
          downAt.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          e.stopPropagation();
          const p = downAt.current;
          if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 5) return;
          if (isProcess) onSelect(station.id);
        }}
      >
        <boxGeometry args={[2.2, 0.9, 1.3]} />
        <meshStandardMaterial color="#dbe4ee" metalness={0.35} roughness={0.55} />
      </mesh>

      {/* 后立板，撑起设备体积感 */}
      <mesh position={[0, deck + 0.8, -1.75]}>
        <boxGeometry args={[2.2, 1.5, 0.18]} />
        <meshStandardMaterial color="#9fb0c4" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 两态状态灯：贴在立板正面，从斜俯视相机方向清晰可见 */}
      <mesh position={[0, deck + 1.3, -1.62]}>
        <boxGeometry args={[1.9, 0.18, 0.12]} />
        <meshStandardMaterial
          ref={lamp}
          color={LAMP_IDLE.color}
          emissive={LAMP_IDLE.emissive}
          emissiveIntensity={LAMP_IDLE.intensity}
        />
      </mesh>

      {/* 设备三色警示灯柱 */}
      <mesh position={[1.0, deck + 1.02, -1.05]}>
        <cylinderGeometry args={[0.045, 0.045, 0.5, 10]} />
        <meshStandardMaterial color="#4a5c72" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[1.0, deck + 1.32, -1.05]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#f5b301" emissive="#f5b301" emissiveIntensity={0.85} />
      </mesh>

      {/* 料台：悬臂支腿 + 台面，零件落点正对轨道 */}
      <mesh position={[0, (deck - 0.1) / 2, 0]}>
        <boxGeometry args={[0.42, deck - 0.1, 0.42]} />
        <meshStandardMaterial color="#394b60" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, deck - 0.05, 0]}>
        <boxGeometry args={[1.02, 0.1, 0.82]} />
        <meshStandardMaterial color="#2a3a4d" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* 台面四角定位销 */}
      {[-0.4, 0.4].map((x) =>
        [-0.28, 0.28].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, deck + 0.03, z]}>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color="#f5b301" metalness={0.5} roughness={0.45} />
          </mesh>
        )),
      )}

      {/* 加工进度条：scale.x 由 SimDriver 驱动，从左端长出 */}
      <group
        ref={progress}
        position={[-PROGRESS_BAR_W / 2, deck - 0.14, 0.52]}
        scale={[0.001, 1, 1]}
      >
        <mesh position={[PROGRESS_BAR_W / 2, 0, 0]}>
          <boxGeometry args={[PROGRESS_BAR_W, 0.14, 0.09]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.3} />
        </mesh>
      </group>

      {/* 黄色安全护栏：三面围住设备，靠轨道一侧压低不挡机械手 */}
      {[-1.75, -0.35].map((z) => (
        <mesh key={`rail-${z}`} position={[0, deck + 0.22, z]}>
          <boxGeometry args={[2.9, 0.07, 0.07]} />
          <meshStandardMaterial color="#f5b301" emissive="#6b4700" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh position={[0, deck - 0.3, 0.95]}>
        <boxGeometry args={[2.9, 0.06, 0.06]} />
        <meshStandardMaterial color="#f5b301" emissive="#6b4700" emissiveIntensity={0.3} />
      </mesh>
      {[-1.35, 1.35].map((x) =>
        [-1.75, -0.35, 0.95].map((z) => (
          <mesh key={`post-${x}-${z}`} position={[x, deck / 2 + 0.05, z]}>
            <boxGeometry args={[0.07, deck + 0.1, 0.07]} />
            <meshStandardMaterial color="#f5b301" />
          </mesh>
        )),
      )}

      {/* 周边道具：控制柜 + 料箱，强化车间感 */}
      <mesh position={[1.62, 0.55, -1.3]}>
        <boxGeometry args={[0.42, 1.1, 0.55]} />
        <meshStandardMaterial color="#33445a" metalness={0.45} roughness={0.6} />
      </mesh>
      <mesh position={[1.62, 0.86, -1.01]}>
        <boxGeometry args={[0.3, 0.18, 0.02]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} />
      </mesh>
      {[-1.75, -1.35].map((x, i) => (
        <mesh key={`bin-${i}`} position={[x, 0.24, 0.35]}>
          <boxGeometry args={[0.34, 0.48, 0.42]} />
          <meshStandardMaterial color={i === 0 ? '#3f5268' : '#4a5c72'} metalness={0.3} roughness={0.7} />
        </mesh>
      ))}

      <Html
        position={[0, deck + 2.05, -1.0]}
        center
        distanceFactor={18}
        zIndexRange={[2, 1]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="fl-label">{LABELS[station.id]}</div>
      </Html>
    </group>
  );
}
