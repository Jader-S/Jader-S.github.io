/** 固定零件池：mesh 复用、靠 visible 控制，避免每帧动态增删 React 节点。 */
import type { ViewRuntime } from './runtime';
import { PART_POOL_SIZE, PART_SIZE } from './layout';

export default function PartPool({ runtime }: { runtime: ViewRuntime }) {
  return (
    <group>
      {Array.from({ length: PART_POOL_SIZE }, (_, i) => (
        <mesh
          key={i}
          visible={false}
          ref={(o) => {
            runtime.partPool[i] = o;
          }}
        >
          <boxGeometry args={[PART_SIZE, PART_SIZE, PART_SIZE]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.85}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
