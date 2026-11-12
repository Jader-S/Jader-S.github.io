import { useEffect, useRef, useState } from "react";
import { SwarmEngine } from "../animation/SwarmEngine.js";
import { PAGE_WIDTH } from "../scene/theme.js";
import { createScene } from "../scene/create-scene.js";

const FONT_REQUESTS = [
  '400 16px "Space Grotesk"',
  '500 16px "Space Grotesk"',
  '600 16px "Space Grotesk"',
  '400 16px "Source Sans 3"',
  '400 16px "IBM Plex Mono"',
  '500 16px "IBM Plex Mono"',
];

/**
 * 将浏览器实际尺寸映射到1280像素设计坐标，保持原站的整体缩放方式。
 * @param {SwarmEngine} engine 当前场景引擎。
 * @returns {void}
 */
function updateViewport(engine) {
  // 水平居中只存在于宽屏；窄屏按设计宽度整体等比缩放。
  const width = document.documentElement.clientWidth;
  const scale = Math.min(1, width / PAGE_WIDTH);
  Object.assign(engine.vp, {
    vw: width,
    vh: window.innerHeight,
    s: scale,
    left: (width - PAGE_WIDTH * scale) / 2,
  });
}

/**
 * 管理场景生命周期、字体准备、滚动监听与唯一动画循环。
 * @param {{sceneFactory?:Function,autoStart?:boolean,onEngine?:Function}} options 首次挂载时读取的场景与启动配置。
 * @returns {SwarmEngine|null} 字体准备完成后的可渲染场景；初始化时为null。
 */
export function useSwarm({
  sceneFactory = createScene,
  autoStart = false,
  onEngine,
} = {}) {
  const [engine, setEngine] = useState(null);
  const [, renderFrame] = useState(0);
  const initialOptions = useRef({ sceneFactory, autoStart });
  const onEngineRef = useRef(onEngine);
  onEngineRef.current = onEngine;

  useEffect(() => {
    // 首屏保持原站的空白画布与中心标志，滚动之后才启动施工任务。
    let cancelled = false;
    let timeout;
    const previousRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const fonts = document.fonts
      ? Promise.all(FONT_REQUESTS.map((font) => document.fonts.load(font))).catch(
          () => undefined
        )
      : Promise.resolve();
    const deadline = new Promise((resolve) => {
      timeout = setTimeout(resolve, 2500);
    });
    Promise.race([fonts, deadline]).then(() => {
      if (cancelled) return;
      clearTimeout(timeout);
      // 初始选项固定在当前挂载周期，父组件每帧更新不会重复创建施工场景。
      const scene = new SwarmEngine({
        sceneFactory: initialOptions.current.sceneFactory,
      });
      updateViewport(scene);
      if (initialOptions.current.autoStart) scene.start();
      setEngine(scene);
      onEngineRef.current?.(scene);
    });
    return () => {
      // StrictMode重新挂载和热更新时撤销旧初始化，避免同时创建两组工人。
      cancelled = true;
      clearTimeout(timeout);
      onEngineRef.current?.(null);
      if ("scrollRestoration" in history)
        history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (!engine) return undefined;
    /** 更新视口而不改写设计坐标中的实体位置。 */
    function onResize() {
      // 缩放规则与初次创建保持一致。
      updateViewport(engine);
    }
    /** 将滚动位置交给任务调度器，逐步开放当前视口内的施工任务。 */
    function onScroll() {
      // 引擎依据最大已浏览位置更新施工范围。
      engine.setScroll(window.scrollY);
    }
    /** 用户已向下滚动时允许滚轮继续触发施工。 */
    function onWheel() {
      // 页面顶部的单纯悬停仍保持原站入场光标状态。
      if (window.scrollY > 0) engine.start();
    }
    /**
     * 记录用户指针，供空闲工人的群集飞行计算使用。
     * @param {PointerEvent} event 当前指针事件。
     */
    function onPointerMove(event) {
      // 指针保持视口坐标，引擎负责换算为设计坐标。
      engine.mouse = { x: event.clientX, y: event.clientY };
    }
    /** 用户指针离开页面时撤销跟随目标。 */
    function onPointerLeave() {
      // 不重置工人位置，由引擎继续计算空闲轨迹。
      engine.mouse = null;
    }
    onResize();
    onScroll();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    let frameId;
    let lastTime = performance.now();
    /**
     * 推进引擎并请求React刷新，帧时长由引擎统一限制。
     * @param {number} now 浏览器提供的当前帧时间，单位毫秒。
     */
    function tick(now) {
      // 引擎使用秒作为动画时间单位，版本号确保只重绘变化的场景实体。
      engine.step((now - lastTime) / 1000);
      lastTime = now;
      renderFrame((frame) => frame + 1);
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => {
      // 卸载时清理全部监听与动画帧，避免热更新后出现重复调度。
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [engine]);
  return engine;
}
