import { describe, it, expect } from 'vitest';
import { PLANETS } from './site';

describe('PLANETS invariants', () => {
  it('ids are unique', () => {
    const ids = PLANETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('routes are unique', () => {
    const routes = PLANETS.map((p) => p.route);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('every planet has a non-empty color and a boolean unlocked flag', () => {
    for (const p of PLANETS) {
      expect(typeof p.color).toBe('string');
      expect(p.color.length).toBeGreaterThan(0);
      expect(typeof p.unlocked).toBe('boolean');
    }
  });

  it('home planet is present and anchorable', () => {
    const home = PLANETS.find((p) => p.id === 'home');
    expect(home).toBeDefined();
    expect(home?.route).toBe('/');
  });
});
