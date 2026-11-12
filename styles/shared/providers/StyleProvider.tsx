"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyStyle, openStyleWindow, type StyleMode } from "@/lib/style";
import { getStyleDefinition, STYLE_IDS } from "@/styles/registry";
import type { ChromeVariant, StyleDefinition } from "@/styles/types";

interface StyleContextValue {
  style: StyleMode;
  definition: StyleDefinition;
  chrome: ChromeVariant;
  setStyle: (mode: StyleMode) => void;
  toggleStyle: () => void;
  ready: boolean;
}

const StyleContext = createContext<StyleContextValue | null>(null);

interface StyleProviderProps {
  style: StyleMode;
  children: ReactNode;
}

export function StyleProvider({ style: routeStyle, children }: StyleProviderProps) {
  const [ready, setReady] = useState(false);
  const definition = getStyleDefinition(routeStyle);

  useLayoutEffect(() => {
    applyStyle(routeStyle);
    setReady(true);
  }, [routeStyle]);

  const setStyle = useCallback(
    (next: StyleMode) => {
      if (next === routeStyle) return;
      openStyleWindow(next);
    },
    [routeStyle]
  );

  const toggleStyle = useCallback(() => {
    const idx = STYLE_IDS.indexOf(routeStyle);
    const next = STYLE_IDS[(idx + 1) % STYLE_IDS.length] ?? routeStyle;
    if (next !== routeStyle) openStyleWindow(next);
  }, [routeStyle]);

  const value = useMemo(
    () => ({
      style: routeStyle,
      definition,
      chrome: definition.chrome,
      setStyle,
      toggleStyle,
      ready,
    }),
    [routeStyle, definition, setStyle, toggleStyle, ready]
  );

  return <StyleContext.Provider value={value}>{children}</StyleContext.Provider>;
}

export function useStyle(): StyleContextValue {
  const ctx = useContext(StyleContext);
  if (!ctx) {
    throw new Error("useStyle must be used within StyleProvider");
  }
  return ctx;
}
