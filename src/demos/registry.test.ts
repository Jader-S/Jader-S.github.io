import { describe, it, expect } from 'vitest';
import { demoRegistry, getDemo } from './registry';

describe('demoRegistry', () => {
  it('has at least one demo entry', () => {
    expect(demoRegistry.length).toBeGreaterThan(0);
  });

  it('getDemo hits a known slug', () => {
    const d = getDemo('schneider-poi-perf');
    expect(d).toBeDefined();
    expect(d?.slug).toBe('schneider-poi-perf');
    expect(d?.category).toBe('perf');
  });

  it('getDemo returns undefined for unknown slug', () => {
    expect(getDemo('does-not-exist')).toBeUndefined();
  });

  it('slugs are unique', () => {
    const slugs = demoRegistry.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
