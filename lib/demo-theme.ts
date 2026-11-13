"use client";

/**
 * Concrete demo colors for canvas / ECharts / Three.js.
 *
 * CSS can read the `[data-demo-theme]` bridge with var() + color-mix(), but
 * 2D canvases, ECharts options and R3F materials need resolved color strings.
 * This module reads the *base* html tokens (which every style defines in its
 * uno.ts) and derives the same semantic palette as demo-tokens.css, so both
 * halves stay in sync across all five styles and light/dark modes.
 */
import { useSyncExternalStore } from "react";

type RGB = [number, number, number];

const ACCENT_FALLBACK: RGB = [34, 211, 238];
const INK_FALLBACK: RGB = [240, 248, 255];

export interface DemoPalette {
  accent: string;
  accentLight: string;
  violet: string;
  danger: string;
  warning: string;
  success: string;
  ink: string;
  text: string;
  muted: string;
  faint: string;
  page: string;
  surface: string;
  surfaceDeep: string;
  border: string;
  accentA: (alpha: number) => string;
  inkA: (alpha: number) => string;
  pageA: (alpha: number) => string;
  mutedA: (alpha: number) => string;
  dangerA: (alpha: number) => string;
  warningA: (alpha: number) => string;
}

interface RawTokens {
  accent: string;
  accentLight: string;
  ink: string;
  text: string;
  muted: string;
  faint: string;
  page: string;
  border: string;
}

const FALLBACK: RawTokens = {
  accent: "#22d3ee",
  accentLight: "#67e8f9",
  ink: "#f0f4f8",
  text: "#d8dee8",
  muted: "#94a3b8",
  faint: "#64748b",
  page: "#0b1018",
  border: "rgba(127, 145, 170, 0.28)",
};

function parseColor(input: string, fallback: RGB): RGB {
  const value = input.trim();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  const match = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return fallback;
}

function toRgb(c: RGB): string {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function toRgba(c: RGB, alpha: number): string {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
}

/** Mirrors `color-mix(in srgb, A p%, B)` in CSS. */
function mix(a: RGB, b: RGB, weightA: number): RGB {
  const w = weightA;
  return [
    Math.round(a[0] * w + b[0] * (1 - w)),
    Math.round(a[1] * w + b[1] * (1 - w)),
    Math.round(a[2] * w + b[2] * (1 - w)),
  ];
}

function snapshotTokens(): RawTokens {
  if (typeof document === "undefined") return FALLBACK;
  const style = getComputedStyle(document.documentElement);
  const get = (key: string, fallback: string) =>
    style.getPropertyValue(key).trim() || fallback;
  return {
    accent: get("--theme-accent", FALLBACK.accent),
    accentLight: get("--theme-accent-light", FALLBACK.accentLight),
    ink: get("--text-heading", FALLBACK.ink),
    text: get("--text-body", FALLBACK.text),
    muted: get("--text-muted", FALLBACK.muted),
    faint: get("--text-faint", FALLBACK.faint),
    page: get("--color-background", FALLBACK.page),
    border: get("--glass-border", FALLBACK.border),
  };
}

function build(raw: RawTokens): DemoPalette {
  const ink = parseColor(raw.ink, INK_FALLBACK);
  const text = parseColor(raw.text, [216, 222, 232]);
  // 与 demo-tokens.css 同权重：强调色 / 次级文字向 ink 压一档，小字达 AA。
  const accent = mix(parseColor(raw.accent, ACCENT_FALLBACK), ink, 0.78);
  const accentLight = mix(parseColor(raw.accentLight, [103, 232, 249]), ink, 0.7);
  const muted = mix(parseColor(raw.muted, [148, 163, 184]), ink, 0.7);
  const faint = parseColor(raw.faint, [100, 116, 139]);
  const page = parseColor(raw.page, [11, 16, 24]);
  const border = parseColor(raw.border, [127, 145, 170]);

  // Same weights as demo-tokens.css --demo-danger / --demo-warning / ...
  const danger = mix([248, 113, 113], ink, 0.45);
  const warning = mix([245, 158, 11], ink, 0.45);
  const success = mix([52, 211, 153], ink, 0.45);
  const violet = mix([168, 85, 247], ink, 0.52);

  return {
    accent: toRgb(accent),
    accentLight: toRgb(accentLight),
    violet: toRgb(violet),
    danger: toRgb(danger),
    warning: toRgb(warning),
    success: toRgb(success),
    ink: toRgb(ink),
    text: toRgb(text),
    muted: toRgb(muted),
    faint: toRgb(faint),
    page: toRgb(page),
    // 与 demo-tokens.css 的 --demo-surface-solid / --demo-surface-deep 同权重
    surface: toRgb(mix(ink, page, 0.06)),
    surfaceDeep: toRgb(mix(ink, page, 0.12)),
    border: toRgb(border),
    accentA: (alpha) => toRgba(accent, alpha),
    inkA: (alpha) => toRgba(ink, alpha),
    pageA: (alpha) => toRgba(page, alpha),
    mutedA: (alpha) => toRgba(muted, alpha),
    dangerA: (alpha) => toRgba(danger, alpha),
    warningA: (alpha) => toRgba(warning, alpha),
  };
}

let cache: { key: string; value: DemoPalette } | null = null;

/** Read the current theme palette once (imperative canvas/ECharts use). */
export function readDemoPalette(): DemoPalette {
  const raw = snapshotTokens();
  const key = Object.values(raw).join("|");
  if (cache?.key === key) return cache.value;
  const value = build(raw);
  cache = { key, value };
  return value;
}

function subscribe(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-theme-mode", "data-style", "class"],
  });
  return () => observer.disconnect();
}

/** React version — re-renders when the theme/style attributes change. */
export function useDemoPalette(): DemoPalette {
  return useSyncExternalStore(subscribe, readDemoPalette, readDemoPalette);
}
