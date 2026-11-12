/**
 * 车间环境：地面、中央地轨、安全围栏、厂房立柱与照明。
 * 全部为静态几何 + 共享 geometry/material，不参与每帧更新。
 */
import { BoxGeometry, MeshBasicMaterial, MeshStandardMaterial, DoubleSide } from 'three';
import { RAIL, STATION_LAYOUT } from './layout';
import type { StationId } from './sim';

/* ── 共享几何 / 材质：静态物件复用，避免为每根栏杆新建对象 ── */
const POST_GEO = new BoxGeometry(0.09, 1.5, 0.09);
const POST_MAT = new MeshStandardMaterial({ color: '#c99a2b', metalness: 0.55, roughness: 0.45 });
const MESH_LINE_MAT = new MeshStandardMaterial({ color: '#4b6a8d', metalness: 0.6, roughness: 0.5 });
const SLEEPER_GEO = new BoxGeometry(0.2, 0.07, RAIL.gauge + 0.62);
const SLEEPER_MAT = new MeshStandardMaterial({ color: '#233142', metalness: 0.35, roughness: 0.8 });
const STRIPE_GEO = new BoxGeometry(0.3, 0.012, 0.5);
const STRIPE_MAT = new MeshStandardMaterial({ color: '#101820', roughness: 0.9 });
const NET_MAT = new MeshBasicMaterial({
  color: '#6d93b5',
  transparent: true,
  opacity: 0.075,
  side: DoubleSide,
  depthWrite: false,
});
const PANEL_MAT = new MeshStandardMaterial({
  color: '#8fb4d8',
  emissive: '#7fb6e8',
  emissiveIntensity: 0.45,
  roughness: 0.5,
});

const X_MIN = -14.2;
const X_MAX = 14.2;
const Z_MIN = -6.0;
const Z_MAX = 6.0;

/** 沿一条线段均匀取点，用于立柱阵列 */
function along(n: number, from: number, to: number): number[] {
  return Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));
}

/** 地面 + 网格 + 轨道两侧黄黑警示带 + 工位地面定位标记 */
function Ground() {
  const stripeX = along(14, -12.6, 12.6);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[40, 18]} />
        <meshStandardMaterial color="#0b1220" roughness={0.94} metalness={0.06} />
      </mesh>
      <gridHelper args={[40, 40, '#173544', '#101f2b']} position={[0, -0.005, 0]} />

      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, s * 1.5]}>
            <planeGeometry args={[27.2, 0.5]} />
            <meshStandardMaterial
              color="#c39726"
              emissive="#5c4000"
              emissiveIntensity={0.18}
              roughness={0.85}
            />
          </mesh>
          {stripeX.map((x, i) => (
            <mesh
              key={i}
              geometry={STRIPE_GEO}
              material={STRIPE_MAT}
              position={[x, 0.016, s * 1.5]}
              rotation={[0, 0.6, 0]}
            />
          ))}
        </group>
      ))}

      {/* 工位地面定位标记 */}
      {(Object.keys(STATION_LAYOUT) as StationId[]).map((id) => {
        const d = STATION_LAYOUT[id];
        return [-1.5, 1.5].map((dx) =>
          [-1.1, 1.1].map((dz) => (
            <mesh
              key={`${id}-${dx}-${dz}`}
              position={[d.x + dx, 0.012, d.z + dz]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.6, 0.045]} />
              <meshStandardMaterial color="#4f6f8c" roughness={0.8} />
            </mesh>
          )),
        );
      })}
    </>
  );
}

/** 中央地轨：双钢轨 + 枕木 + 拖链线槽 + 两端缓冲器 */
function RailTrack() {
  const sleepers = along(20, -RAIL.halfSpan + 0.4, RAIL.halfSpan - 0.4);
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[RAIL.halfSpan * 2 + 0.8, 0.06, RAIL.gauge + 1.0]} />
        <meshStandardMaterial color="#16202d" metalness={0.35} roughness={0.8} />
      </mesh>
      {sleepers.map((x, i) => (
        <mesh key={i} geometry={SLEEPER_GEO} material={SLEEPER_MAT} position={[x, 0.065, 0]} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, RAIL.y, s * (RAIL.gauge / 2)]}>
          <boxGeometry args={[RAIL.halfSpan * 2, 0.13, 0.13]} />
          <meshStandardMaterial color="#8fa6bd" metalness={0.85} roughness={0.28} />
        </mesh>
      ))}
      {/* 中间拖链线槽 + 发光条 */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[RAIL.halfSpan * 2, 0.05, 0.22]} />
        <meshStandardMaterial color="#243346" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.122, 0]}>
        <boxGeometry args={[RAIL.halfSpan * 2, 0.012, 0.05]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} />
      </mesh>
      {/* 两端缓冲器 / 限位 */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (RAIL.halfSpan + 0.15), 0, 0]}>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.3, 0.72, 1.5]} />
            <meshStandardMaterial color="#33445a" metalness={0.5} roughness={0.55} />
          </mesh>
          <mesh position={[-s * 0.2, 0.42, 0]}>
            <boxGeometry args={[0.12, 0.34, 1.1]} />
            <meshStandardMaterial color="#f5b301" emissive="#7a5400" emissiveIntensity={0.45} />
          </mesh>
        </group>
      ))}
      {/* 轨道刻度 */}
      {along(9, -10.8, 10.8).map((x, i) => (
        <mesh key={i} position={[x, 0.012, -0.95]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.055, 0.22]} />
          <meshStandardMaterial color="#3c5a70" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** 安全围栏：后侧与左右两端为完整网片，靠相机一侧只留立柱（保证视线通透） */
function SafetyFence() {
  const longPosts = along(13, X_MIN, X_MAX);
  const sidePosts = along(6, Z_MIN, Z_MAX);
  return (
    <group>
      {longPosts.map((x, i) => (
        <group key={`p-${i}`}>
          <mesh geometry={POST_GEO} material={POST_MAT} position={[x, 0.75, Z_MIN]} />
          <mesh geometry={POST_GEO} material={POST_MAT} position={[x, 0.75, Z_MAX]} />
        </group>
      ))}
      {sidePosts.map((z, i) =>
        [X_MIN, X_MAX].map((x) => (
          <mesh key={`s-${i}-${x}`} geometry={POST_GEO} material={POST_MAT} position={[x, 0.75, z]} />
        )),
      )}

      {/* 上/下横杆：后侧 + 左右两端；前侧只保留下横杆，避免遮挡 */}
      {[0.34, 1.5].map((y) => (
        <group key={y}>
          <mesh position={[0, y, Z_MIN]}>
            <boxGeometry args={[X_MAX - X_MIN, 0.07, 0.07]} />
            <meshStandardMaterial color="#c99a2b" metalness={0.55} roughness={0.45} />
          </mesh>
          {[X_MIN, X_MAX].map((x) => (
            <mesh key={x} position={[x, y, 0]}>
              <boxGeometry args={[0.07, 0.07, Z_MAX - Z_MIN]} />
              <meshStandardMaterial color="#c99a2b" metalness={0.55} roughness={0.45} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.34, Z_MAX]}>
        <boxGeometry args={[X_MAX - X_MIN, 0.07, 0.07]} />
        <meshStandardMaterial color="#c99a2b" metalness={0.55} roughness={0.45} />
      </mesh>

      {/* 半透明防护网片 */}
      <mesh position={[0, 0.92, Z_MIN]} material={NET_MAT}>
        <planeGeometry args={[X_MAX - X_MIN, 1.15]} />
      </mesh>
      {[X_MIN, X_MAX].map((x) => (
        <mesh key={x} position={[x, 0.92, 0]} rotation={[0, Math.PI / 2, 0]} material={NET_MAT}>
          <planeGeometry args={[Z_MAX - Z_MIN, 1.15]} />
        </mesh>
      ))}
      {/* 后侧网片水平加强筋 */}
      {[0.65, 0.95, 1.25].map((y) => (
        <mesh key={y} position={[0, y, Z_MIN + 0.01]} material={MESH_LINE_MAT}>
          <boxGeometry args={[X_MAX - X_MIN, 0.018, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

/** 厂房结构：立柱、顶部桁架、条形照明 */
function FactoryProps() {
  const pillars: [number, number][] = [
    [X_MIN + 0.4, Z_MIN + 0.4],
    [X_MAX - 0.4, Z_MIN + 0.4],
    [X_MIN + 0.4, Z_MAX - 0.4],
    [X_MAX - 0.4, Z_MAX - 0.4],
  ];
  return (
    <group>
      {pillars.map(([x, z], i) => (
        <mesh key={i} position={[x, 2.4, z]}>
          <boxGeometry args={[0.42, 4.8, 0.42]} />
          <meshStandardMaterial color="#2a394b" metalness={0.45} roughness={0.7} />
        </mesh>
      ))}
      {[Z_MIN + 0.4, Z_MAX - 0.4].map((z) => (
        <mesh key={z} position={[0, 4.7, z]}>
          <boxGeometry args={[X_MAX - X_MIN, 0.24, 0.3]} />
          <meshStandardMaterial color="#2f4055" metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      {/* 吊挂在桁架下的工位照明 */}
      {[Z_MIN + 0.4, Z_MAX - 0.4].map((z) =>
        along(4, -10.5, 10.5).map((x, i) => (
          <group key={`${z}-${i}`} position={[x, 0, z]}>
            {[-0.9, 0.9].map((dx) => (
              <mesh key={dx} position={[dx, 4.58, 0]}>
                <boxGeometry args={[0.04, 0.24, 0.04]} />
                <meshStandardMaterial color="#5b6d82" metalness={0.6} roughness={0.45} />
              </mesh>
            ))}
            <mesh position={[0, 4.44, 0]} material={PANEL_MAT}>
              <boxGeometry args={[2.2, 0.08, 0.26]} />
            </mesh>
          </group>
        )),
      )}
      <pointLight position={[-7, 4.2, -3.4]} intensity={0.55} color="#bfe0ff" distance={26} />
      <pointLight position={[7, 4.2, 3.4]} intensity={0.55} color="#ffe9c4" distance={26} />
    </group>
  );
}

export default function FactoryEnvironment() {
  return (
    <>
      <Ground />
      <RailTrack />
      <SafetyFence />
      <FactoryProps />
    </>
  );
}
