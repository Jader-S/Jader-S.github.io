"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  getStoredThemeMode,
  resolveTheme,
  THEME_MODES,
  type ResolvedTheme,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): { mode: ThemeMode; resolved: ResolvedTheme } {
  if (typeof document === "undefined") {
    return { mode: "auto", resolved: "dark" };
  }
  const modeAttr = document.documentElement.dataset.themeMode;
  const themeAttr = document.documentElement.dataset.theme;
  const mode = THEME_MODES.includes(modeAttr as ThemeMode)
    ? (modeAttr as ThemeMode)
    : getStoredThemeMode();
  const resolved =
    themeAttr === "light" || themeAttr === "dark" ? themeAttr : resolveTheme(mode);
  return { mode, resolved };
}

function useThemeState(): ThemeContextValue {
  const initial = readInitialTheme();
  const [mode, setModeState] = useState<ThemeMode>(initial.mode);
  const [resolved, setResolved] = useState<ResolvedTheme>(initial.resolved);

  useLayoutEffect(() => {
    const next = readInitialTheme();
    setModeState(next.mode);
    setResolved(next.resolved);
    applyTheme(next.mode);
  }, []);

  useEffect(() => {
    applyTheme(mode);
    setResolved(resolveTheme(mode));
  }, [mode]);

  useEffect(() => {
    if (mode !== "auto") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = resolveTheme("auto");
      document.documentElement.dataset.theme = next;
      setResolved(next);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const cycleMode = useCallback(() => {
    setModeState((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "auto";
      return "light";
    });
  }, []);

  return useMemo(
    () => ({ mode, resolved, setMode, cycleMode }),
    [mode, resolved, setMode, cycleMode]
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useThemeState();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
