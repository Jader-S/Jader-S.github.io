/**
 * First-person camera rig. The visitor IS the astronaut.
 *
 *  - IDLE: 时间驱动的慢速漂移 + 稳定注视（V3/1A：pointer 不再进入相机链路）。
 *    漂移相位在「进入 IDLE」时归零，保证 COMPLETE_OUT 那一帧精确落在 homePos。
 *  - FLYING_IN: 两种形态
 *      · 首次俯冲（IDLE→星球）：直线 dolly in。
 *      · 星球间 HOP（VIEWING A→B）：抬升弧线贝塞尔，绕开星系核心，
 *        不回退全景、URL 只切一次。由 store.hoppingFrom 标记。
 *  - VIEWING: 相机跟随目标行星（含公转）并保持注视。
 *  - FLYING_OUT: 单段 tween 直接回到 homePos（V3/3A）。位置与注视点由同一个
 *    progress 一起插值；终点 = IDLE 起点，删除一切硬复位 → 状态连续。
 *
 * Position is owned by gsap during flight and by useFrame otherwise,
 * so they never fight over the same frame.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore, planetWorldPos } from '@/state/useStore';
import { detectReducedMotion } from '@/utils/device';
import {
  CAMERA_HOME_POS,
  CAMERA_HOME_POS_PORTRAIT,
  CAMERA_FOV,
  CAMERA_FOV_PORTRAIT,
  FLIGHT_DURATION_MS,
  FLIGHT_RETURN_MS,
  FLIGHT_HOP_MS,
  VIEW_OFFSET,
  HOP_ARC_LIFT,
  HOP_ARC_SWAY,
} from '@/config/site';

const tmpLook = new THREE.Vector3();
const tmpDir = new THREE.Vector3();
const tmpSide = new THREE.Vector3();
const ORIGIN = new THREE.Vector3(0, 0, 0);

function viewPosition(target: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(
    target[0] + VIEW_OFFSET[0],
    target[1] + VIEW_OFFSET[1],
    target[2] + VIEW_OFFSET[2],
  );
}

export default function CameraRig() {
  const { camera, size } = useThree();
  const tweenRef = useRef<gsap.core.Timeline | null>(null);
  // 竖屏用更远、更宽的视口，保证 5 颗行星都落在窄屏内
  const isPortrait = size.height > size.width;
  const homePos = isPortrait ? CAMERA_HOME_POS_PORTRAIT : CAMERA_HOME_POS;
  const basePos = useRef(new THREE.Vector3(...CAMERA_HOME_POS));
  // 平滑注视点：每帧朝目标注视点 lerp，避免焦点在切换时瞬切
  const lookAtCurrent = useRef(new THREE.Vector3(0, 0, 0));
  /** IDLE 漂移相位起点。null = 下一帧重新起相（从 homePos 连续长出漂移）。 */
  const idlePhase = useRef<number | null>(null);
  /** 返航期间 GSAP 单段 tween 全权接管位置 + 朝向，useFrame 让路，避免两套逻辑打架。 */
  const returnActive = useRef(false);
  /** reduced-motion 缓存一次（每帧调 matchMedia 太浪费）。 */
  const reducedRef = useRef(detectReducedMotion());

  const flight = useStore((s) => s.flight);
  const activeId = useStore((s) => s.activePlanet);
  const focusTarget = useStore((s) => s.focusTarget);

  // 竖屏 / 横屏切换时同步 fov 与 home 基准
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (typeof cam.fov === 'number') {
      cam.fov = isPortrait ? CAMERA_FOV_PORTRAIT : CAMERA_FOV;
      cam.updateProjectionMatrix();
    }
  }, [camera, isPortrait]);

  // V3/3A：进入 IDLE 只同步「漂移基准」并重置相位，不再 copy 位置 / lookAt /
  // 清空 lookAtCurrent。返航 tween 终点已是 homePos、注视点已收敛到原点，
  // IDLE 首帧漂移为 0 → 前后一帧位移为 0，彻底消除「拉远 → 直接跳」。
  useEffect(() => {
    if (flight === 'IDLE' && !activeId) {
      basePos.current.set(...homePos);
      idlePhase.current = null;
    }
  }, [flight, activeId, camera, isPortrait, homePos]);

  useEffect(() => {
    if (!activeId) return;
    tweenRef.current?.kill();

    if (flight === 'FLYING_IN') {
      if (!focusTarget) return;
      const end = viewPosition(focusTarget);
      const start = camera.position.clone();
      // VIEWING→VIEWING 的直跳：走抬升弧线，避免直线穿过星系核心
      const hopping = useStore.getState().hoppingFrom !== null;
      const reduced = reducedRef.current;
      const duration = (hopping ? FLIGHT_HOP_MS : FLIGHT_DURATION_MS) / 1000;

      const arrive = () => {
        basePos.current.copy(camera.position); // lock VIEWING base
        useStore.getState().dispatch({ type: 'ARRIVE' });
      };

      if (reduced) {
        // 无障碍：不做飞行，直接定位到观察位
        camera.position.copy(end);
        lookAtCurrent.current.set(focusTarget[0], focusTarget[1], focusTarget[2]);
        camera.lookAt(lookAtCurrent.current);
        arrive();
        return;
      }

      const tl = gsap.timeline({ onComplete: arrive });

      if (hopping) {
        // 二次贝塞尔控制点：中点抬高 + 沿垂直于 A→B 的水平方向侧偏
        tmpDir.subVectors(end, start);
        tmpSide.set(-tmpDir.z, 0, tmpDir.x);
        if (tmpSide.lengthSq() > 1e-6) tmpSide.normalize().multiplyScalar(HOP_ARC_SWAY);
        const ctrl = start.clone().add(end).multiplyScalar(0.5);
        ctrl.y += HOP_ARC_LIFT;
        ctrl.add(tmpSide);

        const progress = { t: 0 };
        tl.to(progress, {
          t: 1,
          duration,
          ease: 'expo.inOut',
          onUpdate: () => {
            const t = progress.t;
            const u = 1 - t;
            camera.position.set(
              u * u * start.x + 2 * u * t * ctrl.x + t * t * end.x,
              u * u * start.y + 2 * u * t * ctrl.y + t * t * end.y,
              u * u * start.z + 2 * u * t * ctrl.z + t * t * end.z,
            );
          },
        });
      } else {
        tl.to(camera.position, {
          x: end.x,
          y: end.y,
          z: end.z,
          duration,
          ease: 'expo.inOut',
        });
      }
      tweenRef.current = tl;
    } else if (flight === 'FLYING_OUT') {
      // ── V3/3A 返航：单段连续 ──────────────────────────────────────
      // 旧实现终点是「沿观察方向倒退 30 单位」，COMPLETE_OUT 后又被硬复位到
      // homePos，两段独立动作被硬拼 → 用户看到「先拉远，再直接跳」。
      // 现在 dest 直接 = IDLE 起点，位置与注视点由同一 progress 一起插值。
      useStore.getState().setGalaxyViewMode(0);
      returnActive.current = true;

      const start = camera.position.clone();
      const startLook = lookAtCurrent.current.clone();
      const end = new THREE.Vector3(...homePos);

      const complete = () => {
        returnActive.current = false;
        const st = useStore.getState();
        st.dispatch({ type: 'COMPLETE_OUT' }); // → IDLE，activePlanet 清空
        if (!st.pendingNav) st.setFocusTarget(null);
        if (st.pendingNav) {
          const { target } = st.pendingNav;
          st.setPendingNav(null);
          st.setFocusTarget(planetWorldPos[target] ?? null);
          st.dispatch({ type: 'NAVIGATE', target });
        }
      };

      if (reducedRef.current) {
        // 无障碍：不做返航动画，直接落到 homePos + 原点注视，无跳变
        camera.position.copy(end);
        lookAtCurrent.current.copy(ORIGIN);
        camera.lookAt(ORIGIN);
        complete();
        return;
      }

      const progress = { p: 0 };
      const tl = gsap.timeline({ onComplete: complete });
      tl.to(progress, {
        p: 1,
        duration: FLIGHT_RETURN_MS / 1000,
        ease: 'expo.inOut',
        onUpdate: () => {
          const p = progress.p;
          camera.position.lerpVectors(start, end, p);
          // 注视点从当前星球平滑回到全景原点，与位置同段缓动
          lookAtCurrent.current.lerpVectors(startLook, ORIGIN, p);
          camera.lookAt(lookAtCurrent.current);
        },
      });
      tweenRef.current = tl;
    }
  }, [activeId, flight, focusTarget, camera, isPortrait, homePos]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 返航期间 GSAP 全权接管位置 + 朝向，useFrame 让路
    if (returnActive.current) return;

    const flying = flight === 'FLYING_IN';
    const leaving = flight === 'FLYING_OUT';
    const hopping = useStore.getState().hoppingFrom !== null;
    const reduced = reducedRef.current;

    // IDLE 相位：进入 IDLE 时由 effect 置 null，这里重新起相
    if (idlePhase.current === null) idlePhase.current = t;
    const idleT = t - idlePhase.current;

    let targetLook: THREE.Vector3 | null = null;
    let lerpF = 0.12;

    if (flying && focusTarget) {
      tmpLook.set(focusTarget[0], focusTarget[1], focusTarget[2]);
      targetLook = tmpLook;
      // HOP 时转头稍快，跟上更短的弧线时长
      lerpF = hopping ? 0.14 : 0.09;
    } else if (leaving) {
      // 正常路径不会走到这里（returnActive 已让路）；保留兜底避免极端时序闪烁
      tmpLook.copy(ORIGIN);
      targetLook = tmpLook;
      lerpF = 0.08;
    } else if (activeId && flight === 'VIEWING') {
      const wp = planetWorldPos[activeId] ?? focusTarget;
      if (wp) {
        tmpLook.set(wp[0], wp[1], wp[2]);
        targetLook = tmpLook;
        lerpF = 0.18;
      }
    } else {
      // ── V3/1A：hover / pointer 完全不进相机链路 ──────────────────
      // 注视点由确定性的时间函数做极缓慢呼吸（幅度仅 ±0.45/±0.3 世界单位），
      // 鼠标进入场景不再让注视点从原点突变 → 星空不再集体平移。
      if (reduced) tmpLook.set(0, 0, 0);
      else tmpLook.set(Math.sin(idleT * 0.08) * 0.45, Math.sin(idleT * 0.06) * 0.3, 0);
      targetLook = tmpLook;
      lerpF = 0.1;
    }

    // 位置控制（与朝向解耦）
    if (flying || leaving) {
      // 位置由 gsap 持有，这里只管朝向
    } else if (activeId && flight === 'VIEWING') {
      const wp = planetWorldPos[activeId] ?? focusTarget;
      if (wp) {
        const p = viewPosition(wp);
        camera.position.set(p.x, p.y, p.z);
      }
    } else {
      // ── V3/2A：恢复可感知视差（±1.4 / ±0.8 / ±0.7）──────────────
      // 全部用 sin(idleT ...) 且 idleT 在 IDLE 起点为 0 → 首帧漂移恒为 0，
      // 与返航 tween 终点 homePos 严格连续；之后平滑长出，无跳变。
      const d = reduced ? 0 : 1;
      camera.position.set(
        basePos.current.x + (Math.sin(idleT * 0.13) * 1.4 + Math.sin(idleT * 0.07) * 0.35) * d,
        basePos.current.y + Math.sin(idleT * 0.11) * 0.8 * d,
        basePos.current.z + Math.sin(idleT * 0.09) * 0.7 * d,
      );
    }

    if (targetLook) {
      lookAtCurrent.current.lerp(targetLook, lerpF);
      camera.lookAt(lookAtCurrent.current);
    }
    // V3/1A：移除 camera.rotation.z 覆写。在 lookAt() 之后写 Euler.z 会与
    // 注视姿态叠加并放大「晃」的观感；朝向统一由 lookAtCurrent 决定。
  });

  return null;
}
