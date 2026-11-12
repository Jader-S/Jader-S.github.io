/**
 * Zustand store. Holds UI / flight state + persisted prefs.
 * See ADR-2 / ADR-4.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { transition, type FlightEvent } from './flightMachine';
import { detectMobile } from '@/utils/device';

/**
 * 行星实时世界坐标缓存（非响应式，避免每帧写 store 触发 re-render）。
 * 由 Planet 的 useFrame 每帧写入；requestFlyTo 读取以设置相机俯冲目标坐标。
 */
export const planetWorldPos: Partial<Record<PlanetId, [number, number, number]>> = {};

export type PlanetId = 'about' | 'projects' | 'demos' | 'blog' | 'contact' | 'home';

export type FlightState =
  | 'IDLE'
  | 'FLYING_IN'
  | 'VIEWING'
  | 'FLYING_OUT';

export type Language = 'zh' | 'en';
export type QualityTier = 'ultra' | 'high' | 'med' | 'low';

interface PersistedPrefs {
  language: Language;
  quality: QualityTier;
  introSeen: boolean;
  lastPlanet: PlanetId;
  visited: PlanetId[];
  /** 一次性导航引导（NavHint）是否已消费。可选 → 兼容旧持久化数据与测试字面量 */
  navHintSeen?: boolean;
}

interface StoreState {
  // runtime (not persisted)
  flight: FlightState;
  hoveredPlanet: PlanetId | null;
  activePlanet: PlanetId | null;
  /** optional WebGL fallback flag — flipped by adapter on WebGL fail */
  webglBroken: boolean;
  /** 重量级 3D demo 激活：暂停背景星系 Canvas，避免双 WebGL context 并行 */
  heavy3DDemoActive: boolean;
  /** 螺旋星系视角插值：0=正面(faceOn) / 1=侧视(edgeOn)，用于飞行穿越 */
  galaxyViewMode: number;
  /** 被点击行星的实时世界坐标（嵌入星系后位置随公转变化，相机以此俯冲） */
  focusTarget: [number, number, number] | null;
  /** 飞行回退后待接力飞向的目标（保留给飞行中改主意）；焦点坐标在接力时实时读取 */
  pendingNav: { target: PlanetId } | null;
  /**
   * 星球间直跳的出发星球。非 null 表示当前 FLYING_IN 是一次 HOP（A→B）：
   * CameraRig 据此走抬升弧线，Planet 据此保持其余行星渐隐、避免群体闪现。
   * 落地 ARRIVE 后清空。
   */
  hoppingFrom: PlanetId | null;

  // persisted
  prefs: PersistedPrefs;

  // actions
  setHover: (id: PlanetId | null) => void;
  setFlight: (s: FlightState) => void;
  /** Single entry point for flight transitions (ADR-2). */
  dispatch: (event: FlightEvent) => void;
  setActivePlanet: (id: PlanetId | null) => void;
  setLanguage: (l: Language) => void;
  setQuality: (q: QualityTier) => void;
  markVisited: (id: PlanetId) => void;
  markIntroSeen: () => void;
  resetIntro: () => void;
  setWebglBroken: (b: boolean) => void;
  setHeavy3DDemoActive: (b: boolean) => void;
  setGalaxyViewMode: (t: number) => void;
  setFocusTarget: (p: [number, number, number] | null) => void;
  setPendingNav: (p: { target: PlanetId } | null) => void;
  setHoppingFrom: (id: PlanetId | null) => void;
  markNavHintSeen: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      flight: 'IDLE',
      hoveredPlanet: null,
      activePlanet: null,
      webglBroken: false,
      heavy3DDemoActive: false,
      galaxyViewMode: 0,
      focusTarget: null,
      pendingNav: null,
      hoppingFrom: null,

      prefs: {
        language: 'zh',
        // 移动端首帧就走低画质，避免 9 万粒子 + Bloom 拖垮首屏
        quality: detectMobile() ? 'low' : 'high',
        introSeen: false,
        lastPlanet: 'home',
        visited: [],
      },

      setHover: (id) => set({ hoveredPlanet: id }),
      setFlight: (s) => set({ flight: s }),
      dispatch: (event) =>
        set((st) => {
          const result = transition(st.flight, event);
          // no-op transitions (e.g. ARRIVE while IDLE) must not trigger a re-render
          if (result.next === st.flight && event.type !== 'NAVIGATE') return st;
          const patch: Partial<StoreState> = { flight: result.next };
          if (event.type === 'NAVIGATE') {
            patch.activePlanet = event.target;
            patch.prefs = { ...st.prefs, lastPlanet: event.target };
          }
          // mark visited when we land (arrival into VIEWING)
          if (result.next === 'VIEWING') {
            patch.hoppingFrom = null; // HOP 落地，弧线标记清零
            if (st.activePlanet) {
              const base = patch.prefs ?? st.prefs;
              if (!base.visited.includes(st.activePlanet)) {
                patch.prefs = { ...base, visited: [...base.visited, st.activePlanet] };
              }
            }
          }
          if (result.next === 'IDLE') {
            patch.activePlanet = null;
            patch.hoppingFrom = null;
          }
          return patch;
        }),
      setActivePlanet: (id) => set({ activePlanet: id }),
      setLanguage: (l) =>
        set((st) => ({ prefs: { ...st.prefs, language: l } })),
      setQuality: (q) =>
        set((st) => ({ prefs: { ...st.prefs, quality: q } })),
      markVisited: (id) =>
        set((st) => {
          if (st.prefs.visited.includes(id)) return st;
          return { prefs: { ...st.prefs, visited: [...st.prefs.visited, id] } };
        }),
      markIntroSeen: () =>
        set((st) => ({ prefs: { ...st.prefs, introSeen: true } })),
      resetIntro: () =>
        set((st) => ({ prefs: { ...st.prefs, introSeen: false } })),
      markNavHintSeen: () =>
        set((st) => ({ prefs: { ...st.prefs, navHintSeen: true } })),
      setWebglBroken: (b) => set({ webglBroken: b }),
      setHeavy3DDemoActive: (b) => set({ heavy3DDemoActive: b }),
      setGalaxyViewMode: (t) => set({ galaxyViewMode: t }),
      setFocusTarget: (p) => set({ focusTarget: p }),
      setPendingNav: (p) => set({ pendingNav: p }),
      setHoppingFrom: (id) => set({ hoppingFrom: id }),
    }),
    {
      name: 'astra:prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ prefs: state.prefs }),
      version: 1,
    },
  ),
);

/**
 * 统一的飞行入口：所有「想去某星球」的操作（点击行星 / NavRail）都走这里。
 *
 * 行为（V2：星球间单段直跳，不再回退全景）：
 *  - IDLE：setFocusTarget + NAVIGATE，从星系原位俯冲过去。
 *  - VIEWING → 另一星球：记 hoppingFrom=当前星球，setFocusTarget(B) + NAVIGATE，
 *    由 flightMachine 现有的 VIEWING+NAVIGATE→FLYING_IN 通路直接飞，
 *    CameraRig 据 hoppingFrom 走抬升弧线（1.3s），不经过 IDLE、URL 只切一次。
 *  - VIEWING → home：RETURN 回全景（母星是「退出」语义，不做 HOP）。
 *  - 飞行中：直接 retarget 到新目标。
 *  - 已在目标星球：无操作。
 */
export function requestFlyTo(target: PlanetId) {
  const st = useStore.getState();
  const wp = planetWorldPos[target] ?? null;

  if (st.flight === 'FLYING_IN' || st.flight === 'FLYING_OUT') {
    if (wp) st.setFocusTarget(wp);
    st.setPendingNav(null);
    st.dispatch({ type: 'NAVIGATE', target });
    return;
  }
  if (st.flight === 'VIEWING' && st.activePlanet === target) return;
  // IDLE 下已在全景，点母星是 no-op（避免一次无意义的俯冲 + URL 抖动）
  if (st.flight === 'IDLE' && target === 'home') return;

  // 母星 = 返回全景，走 RETURN（FLYING_OUT 倒退），避免 HOP 落地后 HomePage 又把状态拉回 FLYING_OUT
  if (st.flight === 'VIEWING' && target === 'home') {
    st.setPendingNav(null);
    st.setHoppingFrom(null);
    st.dispatch({ type: 'RETURN' });
    return;
  }

  if (st.flight === 'VIEWING') {
    // 单段 HOP：A → B。焦点取 B 的实时坐标（B 在 FLYING_IN 期间暂停公转，坐标不会漂移）
    st.setHoppingFrom(st.activePlanet);
    if (wp) st.setFocusTarget(wp);
    st.setPendingNav(null);
    st.dispatch({ type: 'NAVIGATE', target });
    return;
  }

  // IDLE：首次俯冲，无 HOP 标记
  st.setHoppingFrom(null);
  if (wp) st.setFocusTarget(wp);
  st.dispatch({ type: 'NAVIGATE', target });
}