import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

function reset() {
  useStore.setState({
    flight: 'IDLE',
    hoveredPlanet: null,
    activePlanet: null,
    webglBroken: false,
    prefs: {
      language: 'zh',
      quality: 'high',
      introSeen: false,
      lastPlanet: 'home',
      visited: [],
    },
  });
}

describe('useStore.dispatch', () => {
  beforeEach(() => {
    localStorage.clear();
    reset();
  });

  it('NAVIGATE from IDLE -> FLYING_IN and sets active/last planet', () => {
    useStore.getState().dispatch({ type: 'NAVIGATE', target: 'about' });
    const s = useStore.getState();
    expect(s.flight).toBe('FLYING_IN');
    expect(s.activePlanet).toBe('about');
    expect(s.prefs.lastPlanet).toBe('about');
  });

  it('ARRIVE from FLYING_IN -> VIEWING and marks planet visited', () => {
    useStore.getState().dispatch({ type: 'NAVIGATE', target: 'about' });
    useStore.getState().dispatch({ type: 'ARRIVE' });
    const s = useStore.getState();
    expect(s.flight).toBe('VIEWING');
    expect(s.prefs.visited).toContain('about');
  });

  it('visited dedupes across repeat arrivals', () => {
    useStore.getState().dispatch({ type: 'NAVIGATE', target: 'about' });
    useStore.getState().dispatch({ type: 'ARRIVE' });
    useStore.getState().dispatch({ type: 'NAVIGATE', target: 'about' });
    useStore.getState().dispatch({ type: 'ARRIVE' });
    const visitedAbout = useStore.getState().prefs.visited.filter((v) => v === 'about');
    expect(visitedAbout).toHaveLength(1);
  });

  it('RETURN from VIEWING -> FLYING_OUT', () => {
    useStore.getState().dispatch({ type: 'NAVIGATE', target: 'about' });
    useStore.getState().dispatch({ type: 'ARRIVE' });
    useStore.getState().dispatch({ type: 'RETURN' });
    expect(useStore.getState().flight).toBe('FLYING_OUT');
  });

  it('COMPLETE_OUT from FLYING_OUT -> IDLE and clears active planet', () => {
    useStore.getState().dispatch({ type: 'NAVIGATE', target: 'about' });
    useStore.getState().dispatch({ type: 'ARRIVE' });
    useStore.getState().dispatch({ type: 'RETURN' });
    useStore.getState().dispatch({ type: 'COMPLETE_OUT' });
    const s = useStore.getState();
    expect(s.flight).toBe('IDLE');
    expect(s.activePlanet).toBeNull();
  });

  it('illegal ARRIVE from IDLE is a no-op (no re-render)', () => {
    const before = useStore.getState();
    useStore.getState().dispatch({ type: 'ARRIVE' });
    expect(useStore.getState().flight).toBe('IDLE');
    expect(useStore.getState()).toBe(before);
  });
});
