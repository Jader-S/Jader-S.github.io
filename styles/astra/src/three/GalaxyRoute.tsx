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
 *
 * 注：导航由 flightMachine 状态机驱动，不再依赖 URL（原 react-router 的
 * FlightRouterSync 已移除——/astra 是单路由，行星切换走 requestFlyTo）。
 */
import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useStore } from "@astra/state/useStore";
import {
  CAMERA_HOME_POS,
  CAMERA_HOME_POS_PORTRAIT,
  CAMERA_FOV,
  CAMERA_FOV_PORTRAIT,
} from "@astra/config/site";
import { detectMobile, detectPortrait } from "@astra/utils/device";
import GalaxyScene from "./GalaxyScene";
import CameraRig from "./CameraRig";

/**
 * 重 3D demo 激活时把星空降到低频渲染（约 8fps），而不是 frameloop="never"
 * 完全冻结：停渲会让相机漂移停住，恢复瞬间的跳变正是「星空闪烁/卡顿」的来源。
 * 低频下 WebGL 压力足够小，又保持连续运动。
 */
function LowPowerTicker({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => invalidate(), 120);
    return () => window.clearInterval(id);
  }, [active, invalidate]);
  return null;
}

export default function GalaxyRoute() {
  const quality = useStore((s) => s.prefs.quality);
  const heavy3DDemoActive = useStore((s) => s.heavy3DDemoActive);
  const isMobile = detectMobile();
  const portrait = detectPortrait();

  return (
    <Canvas
      /* 重量级 3D demo 激活时降频而非停渲：避免双 context 抢占，又不冻结星空 */
      frameloop={heavy3DDemoActive ? "demand" : "always"}
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
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#030308");
      }}
    >
      {/* ── 程序化反射环境（行星金属/玻璃高光）── */}
      <Environment resolution={isMobile ? 128 : 256} frames={1}>
        <color attach="background" args={["#000000"]} />
        <Lightformer
          intensity={2.5}
          color="#e0c0ff"
          position={[0, 10, -12]}
          scale={[16, 12, 1]}
        />
        <Lightformer
          intensity={1.8}
          color="#60a5fa"
          position={[-14, -4, -8]}
          scale={[12, 10, 1]}
        />
        <Lightformer
          intensity={1.4}
          color="#ffffff"
          position={[10, 8, 6]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={0.9}
          color="#f472b6"
          position={[0, -8, 6]}
          scale={[14, 7, 1]}
        />
      </Environment>

      {/* ── 光照 ── */}
      <ambientLight intensity={0.25} color="#9abcff" />
      <directionalLight position={[18, 20, 12]} intensity={1.4} color="#fff8ee" />
      <pointLight
        position={[0, -1, -6]}
        intensity={2.5}
        color="#d4a0ff"
        distance={40}
        decay={2}
      />
      <pointLight
        position={[-15, -6, -10]}
        intensity={0.8}
        color="#60a5fa"
        distance={40}
        decay={2}
      />

      <LowPowerTicker active={heavy3DDemoActive} />

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
  );
}
