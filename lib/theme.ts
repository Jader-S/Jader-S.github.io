export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "portfolio-theme";

export const THEME_MODES: ThemeMode[] = ["light", "dark", "auto"];

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_MODES.includes(stored as ThemeMode) ? (stored as ThemeMode) : "auto";
}

export function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

/** 供 layout 内联脚本使用，避免主题闪烁；静奢方案默认偏浅色画廊 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var m=localStorage.getItem(k);var mode=m==="light"||m==="dark"||m==="auto"?m:"auto";var r=mode==="auto"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):mode;document.documentElement.dataset.theme=r;document.documentElement.dataset.themeMode=mode}catch(e){document.documentElement.dataset.theme="light";document.documentElement.dataset.themeMode="auto"}})();`;
