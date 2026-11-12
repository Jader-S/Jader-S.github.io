/**
 * GalaxyScene — 真实感螺旋星系（移植自 galaxy-demo 的 vanilla three 实现）
 *
 * 视觉构成（由远到近）：
 *   1. 真实 360° 背景球（universe.jpg 等距全景，压暗 + 纵深渐隐）
 *   2. 13 万粒子螺旋星系（自定义 GLSL：差速旋转 + 闪烁 + 加色发光）
 *   3. 核心光晕 Sprite + 盘内星云团 Sprite
 *   4. 远景静态星空壳（5000 点）
 *
 * 通过 store.galaxyViewMode(0..1) 驱动盘面倾角，飞行穿越时由正面渐转为侧视。
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/state/useStore';
import type { QualityTier } from '@/config/site';
import {
  PLANETS,
  GALAXY_SPIN_SPEED,
  GALAXY_ORBIT_SPEED,
  GALAXY_BREATH_AMP,
  GALAXY_BREATH_FREQ,
  GALAXY_SKY_SPIN,
} from '@/config/site';
import { detectReducedMotion } from '@/utils/device';
import Planet from './Planet';

function makeGlowTexture(): THREE.Texture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(255,244,214,1)');
  g.addColorStop(0.18, 'rgba(255,206,150,0.75)');
  g.addColorStop(0.45, 'rgba(255,150,92,0.25)');
  g.addColorStop(1.0, 'rgba(255,120,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeNebulaTexture(): THREE.Texture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0.0, 'rgba(150,120,255,0.55)');
  g.addColorStop(0.35, 'rgba(90,130,255,0.25)');
  g.addColorStop(1.0, 'rgba(40,60,160,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const GALAXY_COUNT: Record<QualityTier, number> = {
  ultra: 130000,
  high: 90000,
  med: 50000,
  low: 28000,
};

const galaxyVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uSpeed;
  attribute float aScale;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = color;
    // 绕局部 Y 的差速自转（内圈更快）
    float r = length(position.xz);
    float ang = uTime * uSpeed * (1.0 + 1.6 / (r + 1.0));
    float s = sin(ang), c = cos(ang);
    vec3 p = position;
    p.x = position.x * c - position.z * s;
    p.z = position.x * s + position.z * c;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = 0.55 + 0.45 * sin(uTime * 2.2 + aSeed * 5.0);
    vTwinkle = tw;
    gl_PointSize = uSize * aScale * tw * (1.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const galaxyFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha = pow(alpha, 1.7);
    vec3 col = vColor * (0.75 + 0.7 * vTwinkle);
    // 核心高光增强
    col += vec3(0.25, 0.18, 0.10) * pow(1.0 - d * 2.0, 3.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  varying vec3 vDir;
  uniform sampler2D uTex;
  uniform float uBrightness;
  uniform float uDepth;
  void main() {
    vec3 d = normalize(vDir);
    float u = atan(d.z, d.x) / 6.2831853 + 0.5;
    float v = asin(clamp(d.y, -1.0, 1.0)) / 3.1415926 + 0.5;
    vec3 col = texture2D(uTex, vec2(u, v)).rgb;
    // 下方更暗、上方保留星云层次 → 背景后退、纵深感
    float depthMask = mix(1.0, uDepth, smoothstep(0.55, -0.4, d.y));
    col *= uBrightness * depthMask;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function GalaxyScene({ quality = 'high' }: { quality?: QualityTier }) {
  const gl = useThree((s) => s.gl);
  const galaxyMatRef = useRef<THREE.ShaderMaterial>(null!);
  const galaxyGroupRef = useRef<THREE.Group>(null!);
  const starsRef = useRef<THREE.Points>(null!);
  const galaxyViewMode = useStore((s) => s.galaxyViewMode);
  // 星系盘面（粒子 + 核心光晕 + 星云团）始终作为背景可见；
  // 聚焦某行星时只隐藏"其他行星"（由 Planet 自身 dim 处理），星云不消失。

  const count = GALAXY_COUNT[quality] ?? 90000;

  // 背景全景贴图（异步加载，自动弹出）
  const bgTex = useMemo(() => {
    const t = new THREE.TextureLoader().load('/textures/universe.jpg');
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const glowTex = useMemo(() => makeGlowTexture(), []);
  const nebTex = useMemo(() => makeNebulaTexture(), []);

  // 星系粒子几何
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const aScale = new Float32Array(count);
    const aSeed = new Float32Array(count);
    const P = {
      radius: 12.5,
      branches: 4,
      spin: 0.42,
      randomness: 0.38,
      randomnessV: 0.14,
      randomnessPower: 2.6,
      insideColor: '#ffb15a',
      outsideColor: '#3f6bff',
    };
    const cIn = new THREE.Color(P.insideColor);
    const cOut = new THREE.Color(P.outsideColor);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.7) * P.radius;
      const branch = ((i % P.branches) / P.branches) * Math.PI * 2;
      const spinAngle = r * P.spin;
      const rp = P.randomnessPower;
      const randH = () =>
        Math.pow(Math.random(), rp) * (Math.random() < 0.5 ? 1 : -1) * P.randomness * (r + 0.4);
      const randV = () =>
        Math.pow(Math.random(), rp) * (Math.random() < 0.5 ? 1 : -1) * P.randomnessV * (r + 0.4);
      const a = branch + spinAngle;
      positions[i3] = Math.cos(a) * r + randH();
      positions[i3 + 1] = randV();
      positions[i3 + 2] = Math.sin(a) * r + randH();
      const col = cIn.clone().lerp(cOut, Math.min(r / P.radius, 1.0));
      col.offsetHSL((Math.random() - 0.5) * 0.02, 0.0, (Math.random() - 0.5) * 0.04);
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
      aScale[i] = Math.random() * 1.6 + 0.35;
      aSeed[i] = Math.random() * 6.2831;
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(aScale, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    return g;
  }, [count]);

  // 星云团位置（盘内随机）
  const nebulae = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 9;
      arr.push({
        pos: [Math.cos(a) * r, (Math.random() - 0.5) * 1.2, Math.sin(a) * r],
        scale: 4 + Math.random() * 5,
      });
    }
    return arr;
  }, []);

  // 远景星空壳
  const starsGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 5000;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 600 * (0.55 + 0.45 * Math.random());
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.cos(phi);
      pos[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useEffect(() => {
    if (galaxyMatRef.current) {
      galaxyMatRef.current.uniforms.uSize.value = 30 * gl.getPixelRatio();
    }
  }, [gl]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      starsGeo.dispose();
      bgTex.dispose();
      glowTex.dispose();
      nebTex.dispose();
    };
  }, [geometry, starsGeo, bgTex, glowTex, nebTex]);

  const tiltRef = useRef(0.28);
  /** 可冻结的动画时钟：供盘面公转 / 倾角呼吸使用。飞行中暂停、恢复时不跳变。 */
  const motionRef = useRef(0);
  /** 粒子盘面内层 group（不含行星）——整体公转只作用于它。 */
  const diskRef = useRef<THREE.Group>(null!);
  const reducedRef = useRef(detectReducedMotion());

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const reduced = reducedRef.current;
    const flight = useStore.getState().flight;
    const inFlight = flight === 'FLYING_IN' || flight === 'FLYING_OUT';
    // V3/2A：新增运动（盘面公转 / 倾角呼吸）在飞行中冻结、reduced 下静止。
    // 用累积时间而非绝对 t，避免飞行结束后相位突变。
    if (!reduced && !inFlight) motionRef.current += Math.min(dt, 0.05);
    const m = motionRef.current;

    // 粒子差速自转（uSpeed 提到 0.22，一圈约 25s）：reduced 下冻结相位
    if (galaxyMatRef.current) {
      galaxyMatRef.current.uniforms.uTime.value = reduced ? 0 : t;
    }
    // 远景星空壳：0.004 → 0.008
    if (starsRef.current) starsRef.current.rotation.y = reduced ? 0 : t * GALAXY_SKY_SPIN;
    // 盘面整体缓慢公转：只转粒子 / 光晕 / 星云，不带着行星走
    // （行星有自己的差速公转，且相机靠 planetWorldPos 锁定，二次公转会破坏锁定）
    if (diskRef.current) diskRef.current.rotation.y = m * GALAXY_ORBIT_SPEED;
    // 飞行穿越：正面(0.28) → 侧视(~1.45)，叠加缓慢倾角呼吸
    const breath = Math.sin(m * GALAXY_BREATH_FREQ) * GALAXY_BREATH_AMP;
    const targetTilt = 0.28 + galaxyViewMode * 1.17 + breath;
    tiltRef.current += (targetTilt - tiltRef.current) * 0.05;
    if (galaxyGroupRef.current) galaxyGroupRef.current.rotation.x = tiltRef.current;
  });

  return (
    <group>
      {/* 层 1：真实 360° 背景球 */}
      <mesh frustumCulled={false} renderOrder={-1}>
        <sphereGeometry args={[1500, 64, 32]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            uTex: { value: bgTex },
            uBrightness: { value: 0.38 },
            uDepth: { value: 0.55 },
          }}
          vertexShader={skyVertex}
          fragmentShader={skyFragment}
        />
      </mesh>

      {/* 层 4：远景星空壳 */}
      <points ref={starsRef} geometry={starsGeo} frustumCulled={false}>
        <pointsMaterial
          color={0xffffff}
          size={0.7}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 层 2+3：螺旋星系（主视觉，远景背景） */}
      <group ref={galaxyGroupRef} position={[0, -2, -24]} scale={2.0} rotation={[0.28, 0, 0]}>
        {/* 星系盘面：始终可见（含核心光晕 + 星云团），聚焦某行星时作为背景保留。
            V3/2A：这一层做整体缓慢公转，行星在其外，不跟着转。 */}
        <group ref={diskRef}>
          <points geometry={geometry} frustumCulled={false}>
            <shaderMaterial
              ref={galaxyMatRef}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              vertexColors
              uniforms={{
                uTime: { value: 0 },
                uSize: { value: 30 },
                uSpeed: { value: GALAXY_SPIN_SPEED },
              }}
              vertexShader={galaxyVertex}
              fragmentShader={galaxyFragment}
            />
          </points>

          {/* 核心光晕 */}
          <sprite scale={[9, 9, 1]}>
            <spriteMaterial
              map={glowTex}
              color={0xffd9a0}
              blending={THREE.AdditiveBlending}
              transparent
              depthWrite={false}
            />
          </sprite>

          {/* 盘内星云团 */}
          {nebulae.map((n, i) => (
            <sprite key={i} position={n.pos} scale={[n.scale, n.scale, 1]}>
              <spriteMaterial
                map={nebTex}
                color={0x6f8bff}
                blending={THREE.AdditiveBlending}
                transparent
                opacity={0.5}
                depthWrite={false}
              />
            </sprite>
          ))}
        </group>

        {/* 导航行星：嵌入星系盘面，随星系公转；聚焦时非激活行星由自身隐藏 */}
        {PLANETS.map((p) => (
          <Planet key={p.id} planet={p} />
        ))}
      </group>
    </group>
  );
}
