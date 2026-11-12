import * as THREE from "three-vanta";

type LegacyGeometryConstructor = new (...args: never[]) => THREE.BufferGeometry;

const LEGACY_GEOMETRY_ALIASES: Array<[string, LegacyGeometryConstructor]> = [
  ["PlaneBufferGeometry", THREE.PlaneGeometry as LegacyGeometryConstructor],
  ["BoxBufferGeometry", THREE.BoxGeometry as LegacyGeometryConstructor],
  ["SphereBufferGeometry", THREE.SphereGeometry as LegacyGeometryConstructor],
  ["CylinderBufferGeometry", THREE.CylinderGeometry as LegacyGeometryConstructor],
  ["RingBufferGeometry", THREE.RingGeometry as LegacyGeometryConstructor],
  ["TubeBufferGeometry", THREE.TubeGeometry as LegacyGeometryConstructor],
  ["ConeBufferGeometry", THREE.ConeGeometry as LegacyGeometryConstructor],
  ["CircleBufferGeometry", THREE.CircleGeometry as LegacyGeometryConstructor],
  ["TorusBufferGeometry", THREE.TorusGeometry as LegacyGeometryConstructor],
  ["TorusKnotBufferGeometry", THREE.TorusKnotGeometry as LegacyGeometryConstructor],
  ["PolyhedronBufferGeometry", THREE.PolyhedronGeometry as LegacyGeometryConstructor],
  ["IcosahedronBufferGeometry", THREE.IcosahedronGeometry as LegacyGeometryConstructor],
  ["OctahedronBufferGeometry", THREE.OctahedronGeometry as LegacyGeometryConstructor],
  ["TetrahedronBufferGeometry", THREE.TetrahedronGeometry as LegacyGeometryConstructor],
  [
    "DodecahedronBufferGeometry",
    THREE.DodecahedronGeometry as LegacyGeometryConstructor,
  ],
];

type PatchedThree = typeof THREE &
  Record<string, LegacyGeometryConstructor> & {
    VertexColors: boolean | number;
  };

let cached: PatchedThree | null = null;

/**
 * Vanta 专用 THREE（0.151）+ 兼容补丁：
 * - *BufferGeometry 别名
 * - BufferAttribute.length（CPU 小鸟读这个填颜色，缺失会全白）
 * - VertexColors 常量（旧材质 API）
 */
export function getVantaTHREE(): typeof THREE {
  if (cached) return cached;

  const patched = {
    ...THREE,
  } as PatchedThree;

  for (const [legacy, modern] of LEGACY_GEOMETRY_ALIASES) {
    patched[legacy] = modern;
  }

  // 旧版 Vanta：vertexColors: THREE.VertexColors
  if (patched.VertexColors == null) {
    patched.VertexColors = true;
  }

  // 旧版 Vanta：attributes.position.length === array.length
  const proto = THREE.BufferAttribute.prototype as THREE.BufferAttribute & {
    length?: number;
  };
  if (!("length" in proto)) {
    Object.defineProperty(proto, "length", {
      configurable: true,
      enumerable: false,
      get(this: THREE.BufferAttribute) {
        return this.array.length;
      },
    });
  }

  cached = patched;
  return patched;
}
