"use client";

import { useEffect, useState } from "react";
import { getViewportSize, MEDIA_QUERIES, type ViewportSize } from "@/lib/breakpoints";

export interface ViewportState {
  viewport: ViewportSize;
  isMobile: boolean;
}

const DEFAULT_STATE: ViewportState = {
  viewport: "mobile",
  isMobile: true,
};

function readViewport(): ViewportState {
  const viewport = getViewportSize(window.innerWidth);
  return {
    viewport,
    isMobile: viewport === "mobile",
  };
}

function getInitialState(): ViewportState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  return readViewport();
}

/** 读取当前视口档位，resize / matchMedia 变化时自动更新 */
export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(getInitialState);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setState(readViewport()));
    };

    const queries = [
      MEDIA_QUERIES.mobile,
      MEDIA_QUERIES.tablet,
      MEDIA_QUERIES.desktop,
    ].map((query) => window.matchMedia(query));

    queries.forEach((mql) => mql.addEventListener("change", update));
    window.addEventListener("resize", update, { passive: true });
    // 同步一次，避免与其他来源的 viewport 状态漂移
    setState(readViewport());

    return () => {
      cancelAnimationFrame(raf);
      queries.forEach((mql) => mql.removeEventListener("change", update));
      window.removeEventListener("resize", update);
    };
  }, []);

  return state;
}
