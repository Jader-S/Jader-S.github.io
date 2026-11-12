/**
 * DemoStage — 共享的「大空间 demo」容器。
 *
 * 问题背景：全站 body{touch-action:none; overflow:hidden} 禁掉了浏览器原生
 * 横移与双指缩放，因此任何「需要大画布」的 demo（电流 SVG、未来 3D 工厂、
 * GitHub iframe）都无法靠浏览器手势缩放/平移，必须自带实现。
 *
 * 职责：
 *  - Pointer Events 单指拖动平移、双指 pinch 缩放（绕中点）
 *  - 鼠标滚轮缩放（绕光标）
 *  - 顶部/角落工具条：放大 / 缩小 / 适配窗口 / 重置
 *  - transform: translate() scale() 包裹 children
 *
 * 使用：把需要平移缩放的内容（如整段 SVG 画布）包进 <DemoStage> 即可，
 * 不再各自造手势轮子。
 */
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
} from 'react';
import './DemoStage.css';

interface Transform {
  scale: number;
  tx: number;
  ty: number;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface Gesture {
  mode: 'pan' | 'pinch';
  startScale: number;
  startDist: number;
  startMidX: number;
  startMidY: number;
  startTx: number;
  startTy: number;
  startX: number;
  startY: number;
}

export default function DemoStage({ children, className }: { children: ReactNode; className?: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Transform>({ scale: 1, tx: 0, ty: 0 });

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gesture = useRef<Gesture | null>(null);
  // 用 ref 镜像 t，避免 pointer handler 闭包拿到旧值
  const tRef = useRef(t);
  tRef.current = t;

  function fit() {
    const vp = viewportRef.current;
    const ct = contentRef.current;
    if (!vp || !ct) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const cw = ct.offsetWidth;
    const ch = ct.offsetHeight;
    if (!cw || !ch) return;
    const scale = clamp(Math.min(vw / cw, vh / ch) * 0.96, MIN_SCALE, MAX_SCALE);
    setT({ scale, tx: (vw - cw * scale) / 2, ty: (vh - ch * scale) / 2 });
  }

  // 挂载后自适应一次（窄屏自动缩到全部可见）
  useEffect(() => {
    fit();
    const vp = viewportRef.current;
    if (!vp || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(vp);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function zoomAt(cx: number, cy: number, factor: number) {
    const cur = tRef.current;
    const newScale = clamp(cur.scale * factor, MIN_SCALE, MAX_SCALE);
    const ratio = newScale / cur.scale;
    setT({
      scale: newScale,
      tx: cx - ratio * (cx - cur.tx),
      ty: cy - ratio * (cy - cur.ty),
    });
  }

  function onPointerDown(e: ReactPointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const cur = tRef.current;
    if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = {
        mode: 'pinch',
        startScale: cur.scale,
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
        startMidX: (a.x + b.x) / 2,
        startMidY: (a.y + b.y) / 2,
        startTx: cur.tx,
        startTy: cur.ty,
        startX: 0,
        startY: 0,
      };
    } else {
      gesture.current = {
        mode: 'pan',
        startScale: cur.scale,
        startDist: 0,
        startMidX: 0,
        startMidY: 0,
        startTx: cur.tx,
        startTy: cur.ty,
        startX: e.clientX,
        startY: e.clientY,
      };
    }
  }

  function onPointerMove(e: ReactPointerEvent) {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const cur = tRef.current;
    if (g.mode === 'pan') {
      setT({
        scale: cur.scale,
        tx: g.startTx + (e.clientX - g.startX),
        ty: g.startTy + (e.clientY - g.startY),
      });
    } else if (g.mode === 'pinch') {
      const pts = [...pointers.current.values()];
      if (pts.length < 2) return;
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const ratio = clamp((g.startScale * dist) / g.startDist, MIN_SCALE, MAX_SCALE) / g.startScale;
      setT({
        scale: clamp(g.startScale * dist / g.startDist, MIN_SCALE, MAX_SCALE),
        tx: midX - ratio * (g.startMidX - g.startTx),
        ty: midY - ratio * (g.startMidY - g.startTy),
      });
    }
  }

  function onPointerUp(e: ReactPointerEvent) {
    pointers.current.delete(e.pointerId);
    const pts = [...pointers.current.values()];
    const cur = tRef.current;
    if (pts.length === 1) {
      // 剩一个指针：切回 pan，以当前指针为锚点
      gesture.current = {
        mode: 'pan',
        startScale: cur.scale,
        startDist: 0,
        startMidX: 0,
        startMidY: 0,
        startTx: cur.tx,
        startTy: cur.ty,
        startX: pts[0].x,
        startY: pts[0].y,
      };
    } else if (pts.length === 0) {
      gesture.current = null;
    }
  }

  function onWheel(e: WheelEvent) {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    zoomAt(cx, cy, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }

  return (
    <div
      className={`demo-stage ${className ?? ''}`}
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <div className="demo-stage__content" ref={contentRef} style={{ transform: `translate(${t.tx}px, ${t.ty}px) scale(${t.scale})` }}>
        {children}
      </div>

      <div className="demo-stage__toolbar" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" className="demo-stage__btn" aria-label="放大" onClick={() => zoomAtCenter(1.2)}>
          ＋
        </button>
        <button type="button" className="demo-stage__btn" aria-label="缩小" onClick={() => zoomAtCenter(1 / 1.2)}>
          －
        </button>
        <button type="button" className="demo-stage__btn" aria-label="适配窗口" onClick={fit}>
          ⤢
        </button>
        <button type="button" className="demo-stage__btn" aria-label="重置" onClick={() => setT({ scale: 1, tx: 0, ty: 0 })}>
          ⟲
        </button>
      </div>

      <span className="demo-stage__hint">拖拽平移 · 双指/滚轮缩放</span>
    </div>
  );

  function zoomAtCenter(factor: number) {
    const vp = viewportRef.current;
    if (!vp) return;
    zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, factor);
  }
}
