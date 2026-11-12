"use client";

import { useSyncExternalStore } from "react";
import GlyphRain from "@/styles/atelier/components/canvasui/GlyphRain";
import { useTheme } from "@/components/ThemeProvider";
import { useViewport } from "@/lib/hooks/useViewport";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true
  );
}

/** Full-viewport Glyph Rain (Canvas UI). */
export default function PageDroplets() {
  const { isMobile } = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const { resolved } = useTheme();
  const dark = resolved === "dark";

  if (isMobile || reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[25]" aria-hidden>
      <GlyphRain
        className="h-full w-full"
        charset="ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01<>*:·."
        cell={14}
        color={dark ? [0.62, 0.5, 0.36] : [0.45, 0.36, 0.26]}
        headColor={dark ? [0.86, 0.74, 0.54] : [0.56, 0.45, 0.33]}
        speed={0.22}
        speedVariance={0.55}
        density={0.16}
        trail={0.7}
        glow={1.15}
        mutate={0.35}
        flicker={0.15}
        layers={2}
        dim={0}
        light={0}
        stir={0.7}
        stirRadius={240}
        settle={0.85}
      >
        <div className="h-full min-h-[100dvh] w-full" />
      </GlyphRain>
    </div>
  );
}
