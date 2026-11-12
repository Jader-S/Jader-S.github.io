/**
 * Top-level 3D route: Canvas + 真实感螺旋星系场景 + 行星导航 + 第一视角相机
 *
 * 视觉层次（由远到近）：
 *   1. 真实 360° 背景球（universe.jpg）
 *   2. 远景星空壳
 *   3. 螺旋星系（主视觉，远景背景，可飞行穿越倾斜）
 *   4. Planet 导航球（waypoint，近景）
 *   5. CameraRig 第一视角控制器（自主漂移 + 鼠标转头 + 飞行俯冲）
 *
 * 后处理：UnrealBloom 辉光（真实感的关键）
 */
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GalaxyScene from './GalaxyScene';
import CameraRig from './CameraRig';
import { useStore } from '@/state/useStore';
import { PLANETS } from '@/config/site';
import { detectMobile, detectPortrait } from '@/utils/device';
import { CAMERA_HOME_POS, CAMERA_HOME_POS_PORTRAIT, CAMERA_FOV, CAMERA_FOV_PORTRAIT } from '@/config/site';

/** 精确前缀判定：/projects 与 /projects/p1 同属一个星球，/projectsXYZ 不算。 */
function isUnderRoute(pathname: string, route: string): boolean {
  if (route === '/') return pathname === '/';
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * 飞行路由同步器（必须在 Canvas 之外，才能拿到 react-router 的 navigate 上下文）。
 * 行星点击只触发 NAVIGATE 飞行；落地 ARRIVE→VIEWING 后，这里才把 URL 切到
 * 对应详情路由，实现「先穿越到星球，再展示详情」。
 */
function FlightRouterSync() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const flight = useStore((s) => s.flight);
  const activePlanet = useStore((s) => s.activePlanet);

  useEffect(() => {
    // 非母星的所有落地路由（含详情子路径）
    const landingRoutes = PLANETS.filter((p) => p.route !== '/').map((p) => p.route);
    const onLandingRoute = landingRoutes.some((r) => isUnderRoute(pathname, r));

    if (flight === 'VIEWING' && activePlanet) {
      // 落地后：URL 切到对应详情路由。V3/4A：详情子路径（/projects/:id、
      // /blog/:slug）属于同一星球，用前缀判定，避免把详情页弹回列表。
      const route = PLANETS.find((p) => p.id === activePlanet)?.route ?? '/';
      if (!isUnderRoute(pathname, route)) navigate(route);
    } else if (flight === 'FLYING_OUT') {
      // 返航：URL 回首页（FLYING_OUT 是 RETURN 的直接结果，必须保留）
      if (pathname !== '/') navigate('/');
    } else if (flight === 'IDLE') {
      // 直接访问 / 刷新内容页时，页面 effect 会立即把 flight 设为 VIEWING；
      // 初始 IDLE 抢先 navigate('/') 会把详情 URL 弹回首页，故豁免落地路由。
      if (onLandingRoute) return;
      if (pathname !== '/') navigate('/');
    }
  }, [flight, activePlanet, pathname, navigate]);

  return null;
}

export default function GalaxyRoute() {
  const quality = useStore((s) => s.prefs.quality);
  const heavy3DDemoActive = useStore((s) => s.heavy3DDemoActive);
  const isMobile = detectMobile();
  const portrait = detectPortrait();

  return (
    <>
      <Canvas
        /* 重量级 3D demo（工厂流水线）激活时暂停背景星系渲染，避免双 WebGL context 并行 */
        frameloop={heavy3DDemoActive ? 'never' : 'always'}
        camera={{
          position: portrait ? CAMERA_HOME_POS_PORTRAIT : CAMERA_HOME_POS,
          fov: portrait ? CAMERA_FOV_PORTRAIT : CAMERA_FOV,
          near: 0.1,
          far: 3000,
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: !isMobile,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#030308');
        }}
      >
      {/* ── 程序化反射环境（行星金属/玻璃高光）── */}
      <Environment resolution={isMobile ? 128 : 256} frames={1}>
        <color attach="background" args={['#000000']} />
        <Lightformer intensity={2.5} color="#e0c0ff" position={[0, 10, -12]} scale={[16, 12, 1]} />
        <Lightformer intensity={1.8} color="#60a5fa" position={[-14, -4, -8]} scale={[12, 10, 1]} />
        <Lightformer intensity={1.4} color="#ffffff" position={[10, 8, 6]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.9} color="#f472b6" position={[0, -8, 6]} scale={[14, 7, 1]} />
      </Environment>

      {/* ── 光照 ── */}
      <ambientLight intensity={0.25} color="#9abcff" />
      <directionalLight position={[18, 20, 12]} intensity={1.4} color="#fff8ee" />
      <pointLight position={[0, -1, -6]} intensity={2.5} color="#d4a0ff" distance={40} decay={2} />
      <pointLight position={[-15, -6, -10]} intensity={0.8} color="#60a5fa" distance={40} decay={2} />

      {/* ══════════════════════════════════
          真实感螺旋星系场景（含嵌入其中的导航行星）
         ══════════════════════════════════ */}
      <GalaxyScene quality={quality} />

      {/* ══════════════════════════════════
          第一视角相机控制器
         ══════════════════════════════════ */}
      <CameraRig />

      {/* ══════════════════════════════════
          辉光后处理（真实感关键）
         ══════════════════════════════════ */}
      {/* 移动端关闭全屏后处理（一次 pass 就能省下大量 GPU 时间）；桌面保留辉光 */}
      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={0.82}
            luminanceThreshold={0.32}
            luminanceSmoothing={0.7}
            radius={0.7}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>

      {/* 飞行路由同步：落地后再切详情路由 */}
      <FlightRouterSync />
    </>
  );
}
