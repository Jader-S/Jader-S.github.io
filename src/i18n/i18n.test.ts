import { describe, it, expect } from 'vitest';
import { zh } from './zh';
import { en } from './en';

function keyPaths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  if (Array.isArray(obj)) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe('i18n parity', () => {
  it('en and zh share the exact same key shape', () => {
    const zhKeys = keyPaths(zh).sort();
    const enKeys = keyPaths(en).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it('leaf values are strings, arrays preserved', () => {
    expect(typeof (en as { brand: string }).brand).toBe('string');
    expect(Array.isArray((en as { intro: { countdown: unknown[] } }).intro.countdown)).toBe(true);
  });

  it('functions are mirrored (planetChipAria)', () => {
    const enFn = (en as { hud: { planetChipAria: unknown } }).hud.planetChipAria;
    const zhFn = (zh as { hud: { planetChipAria: unknown } }).hud.planetChipAria;
    expect(typeof enFn).toBe('function');
    expect(typeof zhFn).toBe('function');
  });
});
