import { afterEach, describe, expect, it } from "vitest";
import { readDemoPalette } from "./demo-theme";

const TOKENS = [
  "--theme-accent",
  "--theme-accent-light",
  "--text-heading",
  "--text-body",
  "--text-muted",
  "--text-faint",
  "--color-background",
  "--glass-border",
];

function set(key: string, value: string) {
  document.documentElement.style.setProperty(key, value);
}

afterEach(() => {
  for (const key of TOKENS) document.documentElement.style.removeProperty(key);
});

function luminance(color: string): number {
  const [r, g, b] = color.match(/\d+/g)!.map(Number);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe("readDemoPalette", () => {
  it("resolves hex / rgb theme tokens into concrete canvas colors", () => {
    set("--theme-accent", "#0f766e");
    set("--theme-accent-light", "#5eead4");
    set("--text-heading", "#0f172a");
    set("--text-body", "#1e293b");
    set("--text-muted", "#475569");
    set("--text-faint", "#64748b");
    set("--color-background", "#d8e2ec");
    set("--glass-border", "rgba(15, 23, 42, 0.1)");

    const p = readDemoPalette();
    expect(p.accent).toBe("rgb(15, 97, 95)");
    expect(p.ink).toBe("rgb(15, 23, 42)");
    expect(p.page).toBe("rgb(216, 226, 236)");
    // rgba tokens drop alpha — canvas materials need an opaque color.
    expect(p.border).toBe("rgb(15, 23, 42)");
  });

  it("derives alpha variants from the active theme accent", () => {
    set("--theme-accent", "#2f6f7e");
    const p = readDemoPalette();
    expect(p.accentA(0.12)).toBe("rgba(89, 140, 153, 0.12)");
    expect(p.pageA(0.92)).toMatch(/^rgba\(11, 16, 24, 0\.92\)$/);
    expect(p.inkA(0.85)).toMatch(/^rgba\(240, 244, 248, 0\.85\)$/);
  });

  it("mixes status colors toward ink so light and dark themes both stay readable", () => {
    set("--text-heading", "#14151a"); // 浅色主题：深色标题
    const light = readDemoPalette();
    set("--text-heading", "#edeeef"); // 深色主题：浅色标题
    const dark = readDemoPalette();

    expect(luminance(light.danger)).toBeLessThan(128);
    expect(luminance(dark.danger)).toBeGreaterThan(128);
    expect(luminance(light.warning)).toBeLessThan(128);
    expect(luminance(dark.warning)).toBeGreaterThan(128);
  });

  it("keeps surfaces on the same side of the page color as the theme", () => {
    set("--text-heading", "#14151a");
    set("--color-background", "#eef1f5");
    const light = readDemoPalette();
    expect(luminance(light.surface)).toBeLessThan(luminance(light.page));

    set("--text-heading", "#edeeef");
    set("--color-background", "#0e0f12");
    const dark = readDemoPalette();
    expect(luminance(dark.surface)).toBeGreaterThan(luminance(dark.page));
  });
});
