"use client";

import { Suspense, useEffect } from "react";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import { detectWebGL2 } from "@astra/utils/device";
import GalaxyRoute from "@astra/three/GalaxyRoute";
import HUDLayer from "@astra/ui/HUDLayer";
import LoadingHUD from "@astra/ui/LoadingHUD";
import ErrorBoundary from "@astra/ui/ErrorBoundary";
import FallbackRoute from "@astra/ui/FallbackRoute";
import AstraContentPanel from "@astra/pages/AstraContentPanel";

// 全局主题（原 blog 的 tokens.css / atmosphere.css）——作用域隔离在 .astra-root 下，
// 不污染另外四套模板主题。漏掉这层正是此前"黑字 + 无星云雾感"的根因。
import "./styles/astra-tokens.css";
import "./styles/astra-atmosphere.css";

/**
 * ASTRA app root (native mount, no iframe). Replaces the old react-router
 * `App.tsx`: 3D scene + 2D HUD overlay, navigation via flightMachine store.
 * Mounted client-only from `app/astra/page.tsx` via dynamic import (ssr:false).
 */
export default function AstraApp() {
  const t = useT();
  const webglBroken = useStore((s) => s.webglBroken);
  const setWebglBroken = useStore((s) => s.setWebglBroken);

  // Probe WebGL2 once at boot.
  useEffect(() => {
    if (!detectWebGL2()) setWebglBroken(true);
  }, [setWebglBroken]);

  return (
    <div
      className="astra-root"
      style={{
        position: "fixed",
        inset: 0,
        background: "#05060a",
        overflow: "hidden",
      }}
    >
      {/* 深空氛围层：z:0，位于 3D canvas 之下，内容面板半透时透出 */}
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere__nebula" />
        <div className="atmosphere__horizon" />
        <div className="atmosphere__grain" />
        <div className="atmosphere__vignette" />
      </div>
      <ErrorBoundary scope="canvas">
        {webglBroken ? (
          <FallbackRoute />
        ) : (
          <Suspense fallback={<LoadingHUD label={t.loading} />}>
            <GalaxyRoute />
          </Suspense>
        )}
        <HUDLayer />
        {/* 2D 详情层：根据 activePlanet 渲染对应面板，叠在 3D Canvas 之上 */}
        <AstraContentPanel />
      </ErrorBoundary>
    </div>
  );
}
