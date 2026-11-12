"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import ViewportSync from "@/components/ViewportSync";
import { useViewport } from "@/lib/hooks/useViewport";
import SettledHome from "@/styles/blueprint/components/SettledHome";

const BuildPhase = dynamic(() => import("@/styles/blueprint/components/BuildPhase"), {
  ssr: false,
});

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function BlueprintHome() {
  const { viewport } = useViewport();
  const canDraw = viewport !== "mobile";
  const [phase, setPhase] = useState<"pending" | "build" | "settled">("pending");
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    // Phones and reduced motion use the static page. Tablet widths still draw.
    if (prefersReducedMotion() || !canDraw) {
      setPhase("settled");
      return;
    }
    setPhase("build");
  }, [canDraw]);

  const replay = useCallback(() => {
    if (prefersReducedMotion() || !canDraw) return;
    setReplayKey((key) => key + 1);
    setPhase("build");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [canDraw]);

  return (
    <>
      <ViewportSync />
      {phase === "build" ? <BuildPhase replayKey={replayKey} /> : null}
      {phase === "settled" ? <SettledHome onReplay={replay} /> : null}
      {phase === "pending" ? (
        <div className="blueprint-shell flex min-h-[100dvh] items-center justify-center text-sm text-muted">
          …
        </div>
      ) : null}
    </>
  );
}
