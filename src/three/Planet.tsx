/**
 * Single planet — procedural icosahedron + emissive rim shader.
 * Hover / active / visited states per UI spec §3.
 *
 * V2（导航可发现性）：
 *  - IDLE 下标签常驻（编号 + 中文名 + 拉丁名），hover/active 才展开描述；
 *  - 不可见 hit sphere 保证移动端 ≥44px 的投影点击区，触屏 tap 直接选中；
 *  - HOP（星球间直跳）期间保持聚焦态可见性 + 缩放渐变，避免行星群体闪现。
 */
import { useMemo, useRef, type CSSProperties } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, type PlanetConfig } from '@/config/site';
import { useStore, requestFlyTo, planetWorldPos, type PlanetId } from '@/state/useStore';
import { useT } from '@/i18n';
import { Html } from '@react-three/drei';
import { getPlanetTexture } from './planetTextures';

interface Props {
  planet: PlanetConfig;
}

const _tmpWp = new THREE.Vector3();

const vert = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHover;
  uniform float uActive;
  uniform float uLocked;
  uniform sampler2D uTex;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    float ndl = dot(vNormal, vec3(0.0, 0.0, 1.0));
    vec3 surf = texture2D(uTex, vUv).rgb;
    vec3 col = surf;
    // 霓虹边缘辉光：靠 fresnel 收窄到行星轮廓，品牌色由 uColor 提供
    float rim = pow(1.0 - max(ndl, 0.0), 3.0);
    col += uColor * rim * 1.3;
    // 交互高亮（hover / active / locked）叠加
    col = mix(col, vec3(0.13, 0.82, 0.93), uHover * 0.5);
    col = mix(col, vec3(0.66, 0.33, 0.97), uActive * 0.6);
    col = mix(col, vec3(0.3), uLocked * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Planet({ planet }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const fadeRef = useRef(1); // 可见性渐变（0=隐藏）
  const t = useT();
  const lang = useStore((s) => s.prefs.language);

  const hoveredId = useStore((s) => s.hoveredPlanet);
  const flight = useStore((s) => s.flight);
  const activeId = useStore((s) => s.activePlanet);
  const hoppingFrom = useStore((s) => s.hoppingFrom);
  const visited = useStore((s) => s.prefs.visited);
  const navHintSeen = useStore((s) => s.prefs.navHintSeen);
  const setHover = useStore((s) => s.setHover);

  const isHover = hoveredId === planet.id;
  const isActive = activeId === planet.id;
  const isVisited = visited.includes(planet.id as PlanetId);
  const isNavPlanet = planet.id !== 'home';
  const navIndex = useMemo(
    () => PLANETS.filter((p) => p.id !== 'home').findIndex((p) => p.id === planet.id),
    [planet.id],
  );
  const num = navIndex >= 0 ? String(navIndex + 1).padStart(2, '0') : null;

  // 公转参数：半径 R + 初相，角速度沿用星系差速公式（与粒子一致）
  const orbit = useMemo(() => {
    const x = planet.position[0];
    const z = planet.position[2];
    const R = Math.hypot(x, z);
    const theta0 = Math.atan2(z, x);
    const speed = 0.14 * (1 + 1.6 / (R + 1));
    return { R, theta0, speed, y: planet.position[1] };
  }, [planet.position]);

  const isTarget = activeId === planet.id;
  const focused = !!activeId && flight === 'VIEWING';
  const isHop = hoppingFrom !== null;
  // 目标行星仅在 FLYING_IN 俯冲期间暂停公转（保证相机精准锁定）
  const paused = isTarget && flight === 'FLYING_IN';
  /*
   * 可见性（修复切换时的群体闪现）：
   *  - VIEWING：只显示当前目标。
   *  - HOP（A→B）：只显示出发星 A 与目标星 B，其余保持隐藏；B 以缩放渐变出现。
   *  - 首次俯冲 / IDLE：星系全可见，从原位俯冲不闪。
   */
  const dim =
    !!activeId &&
    !isTarget &&
    (focused || (isHop && planet.id !== hoppingFrom));

  const tex = useMemo(() => {
    let fallback: THREE.Texture;
    const t = getPlanetTexture(planet.id as PlanetId, planet.color, (real) => {
      if (matRef.current) matRef.current.uniforms.uTex.value = real;
      fallback?.dispose();
    });
    fallback = t;
    return t;
  }, [planet.id, planet.color]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(planet.color) },
        uHover: { value: 0 },
        uActive: { value: 0 },
        uLocked: { value: planet.unlocked ? 0 : 1 },
        uTex: { value: tex },
      },
      vertexShader: vert,
      fragmentShader: frag,
    });
  }, [planet.color, planet.unlocked, tex]);

  const geo = useMemo(() => new THREE.IcosahedronGeometry(planet.radius, 4), [planet.radius]);
  // 不可见热区半径：投影到屏幕 ≈44px 触控目标（视口拉近后约 0.6 世界单位）
  const hitRadius = Math.max(planet.radius * 2.4, 0.6);

  const handleSelect = () => {
    const st = useStore.getState();
    if (st.flight === 'FLYING_IN' || st.flight === 'FLYING_OUT') return;
    if (!planet.unlocked) return;
    requestFlyTo(planet.id as PlanetId);
  };

  // V3/1A：hover 单轨化 —— hoveredPlanet 只由 PlanetLabel 的 DOM 事件写入。
  // 3D hit sphere 不再触发 setHover：鼠标落在 <Html> 标签上时 raycast 会
  // pointerOut，与 DOM 的 mouseenter 互相覆盖 → 展开态反复跳动。
  useFrame((state, dt) => {
    const time = state.clock.elapsedTime;
    if (groupRef.current && !paused) {
      const theta = orbit.theta0 + time * orbit.speed;
      groupRef.current.position.set(
        Math.cos(theta) * orbit.R,
        orbit.y,
        Math.sin(theta) * orbit.R,
      );
    }
    // 可见性缩放渐变（而非 visible 硬切 → 消除闪现）
    if (groupRef.current) {
      const target = dim ? 0.001 : 1;
      fadeRef.current += (target - fadeRef.current) * Math.min(1, dt * 7);
      groupRef.current.scale.setScalar(fadeRef.current);
      groupRef.current.visible = fadeRef.current > 0.02;
    }

    if (groupRef.current) {
      const wp = groupRef.current.getWorldPosition(_tmpWp);
      planetWorldPos[planet.id] = [wp.x, wp.y, wp.z];
    }

    if (ref.current) ref.current.rotation.y += dt * 0.18;
    matRef.current.uniforms.uTime.value += dt;
    const hoverTarget = isHover ? 1 : 0;
    const activeTarget = isActive ? 1 : 0;
    const u = matRef.current.uniforms;
    u.uHover.value += (hoverTarget - u.uHover.value) * Math.min(1, dt * 8);
    u.uActive.value += (activeTarget - u.uActive.value) * Math.min(1, dt * 8);

    const scale = isHover ? 1.12 : 1.0;
    ref.current?.scale.setScalar(
      ref.current.scale.x + (scale - ref.current.scale.x) * Math.min(1, dt * 8),
    );
  });

  // IDLE 常驻标签；飞行 / 聚焦态隐藏（避免穿越途中飘着标签）
  const showLabel = flight === 'IDLE' || (isHover && focused === false && !isHop);
  const isHintTarget = isNavPlanet && navIndex === 0 && !navHintSeen && !isVisited;

  return (
    <group ref={groupRef} position={planet.position} visible={true}>
      <mesh ref={ref} geometry={geo}>
        <primitive ref={matRef} attach="material" object={material} />
      </mesh>

      {/* 不可见点击热区：桌面放大命中面积、移动端可直接 tap。
          V3/1A：hover 已单轨到 DOM 标签，这里只保留 onClick 供点击星球本体。 */}
      <mesh
        onClick={(e) => {
          if (!planet.unlocked) return;
          e.stopPropagation();
          handleSelect();
        }}
      >
        <sphereGeometry args={[hitRadius, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {/* 不可见点击热区：桌面放大命中面积、移动端可直接 tap。
          V3/1A：hover 已单轨到 DOM 标签，这里只保留 onClick 供点击星球本体。 */}
      <mesh
        onClick={(e) => {
          if (!planet.unlocked) return;
          e.stopPropagation();
          handleSelect();
        }}
      >
        <sphereGeometry args={[hitRadius, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {showLabel && isNavPlanet && (
        <PlanetLabel
          num={num}
          expanded={isHover}
          hint={isHintTarget}
          name={planet.name}
          cnLabel={planet.label[lang as 'zh' | 'en']}
          text={planet.description[lang as 'zh' | 'en']}
          color={planet.color}
          ariaLabel={t.hud.planetChipAria(planet.name)}
          onHover={(hovering) => setHover(hovering ? (planet.id as PlanetId) : null)}
          onSelect={handleSelect}
        />
      )}
    </group>
  );
}

interface LabelProps {
  num: string | null;
  expanded: boolean;
  hint: boolean;
  name: string;
  cnLabel: string;
  text: string;
  color: string;
  ariaLabel: string;
  onHover: (hovering: boolean) => void;
  onSelect: () => void;
}

function PlanetLabel({
  num,
  expanded,
  hint,
  name,
  cnLabel,
  text,
  color,
  ariaLabel,
  onHover,
  onSelect,
}: LabelProps) {
  // 固定像素尺寸（不随距离缩放）：标签始终清晰可读、可点，像一组导航菜单。
  // 视口拉近后 distanceFactor 会把 chip 缩到不足 10px，故移除。
  // V3/1A：hover/focus 全部由 DOM 事件单轨驱动，data-expanded 与 CSS 展开态同源。
  return (
    <Html position={[0, PLANET_LABEL_Y, 0]} center zIndexRange={[9, 0]}>
      <button
        type="button"
        className={`planet-chip${hint ? ' planet-chip--hint' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-label={ariaLabel}
        data-expanded={expanded ? 'true' : 'false'}
        style={{ '--chip-color': color } as CSSProperties}
      >
        {num && <span className="planet-chip__num">{num}</span>}
        <span className="planet-chip__main">
          <span className="planet-chip__label">{cnLabel}</span>
          <span className="planet-chip__name">{name}</span>
        </span>
        <span className="planet-chip__desc">{text}</span>
      </button>
    </Html>
  );
}

// 标签悬浮在星球上方（视口拉近后略下调，避免离球体太远）
const PLANET_LABEL_Y = 1.0;
