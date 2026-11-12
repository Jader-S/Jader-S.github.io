/** 与 UnoCSS preset-wind3 断点保持一致 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type ViewportSize = "mobile" | "tablet" | "desktop";

export function getViewportSize(width: number): ViewportSize {
  if (width < BREAKPOINTS.md) return "mobile";
  if (width < BREAKPOINTS.lg) return "tablet";
  return "desktop";
}

/** matchMedia 查询字符串 */
export const MEDIA_QUERIES = {
  mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;
