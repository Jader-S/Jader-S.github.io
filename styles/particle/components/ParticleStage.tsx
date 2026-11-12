"use client";

import { useEffect, useRef, useState } from "react";

import { MEDIA_QUERIES } from "@/lib/breakpoints";
import {
  ParticleEngine,
  pickParticleCount,
  type ParticlePhase,
} from "@/styles/particle/engine/ParticleEngine";

interface ParticleStageProps {
  assetUrl: string;
  enabled: boolean;
  reducedMotion: boolean;
  lockScroll: boolean;
  onBusyChange?: (busy: boolean) => void;
  onPhaseChange?: (phase: ParticlePhase) => void;
}

export default function ParticleStage({
  assetUrl,
  enabled,
  reducedMotion,
  lockScroll,
  onBusyChange,
  onPhaseChange,
}: ParticleStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState(assetUrl);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    setFallbackUrl(assetUrl);
  }, [assetUrl]);

  useEffect(() => {
    if (!enabled || reducedMotion || webglFailed) {
      engineRef.current?.destroy();
      engineRef.current = null;
      onBusyChange?.(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let engine: ParticleEngine | null = null;

    try {
      engine = new ParticleEngine(canvas, {
        particleCount: pickParticleCount(window.innerWidth),
        reducedMotion,
        onPhaseChange,
        onIdle: () => onBusyChange?.(false),
      });
      engineRef.current = engine;
      onBusyChange?.(true);
      void engine.loadInitial(assetUrl).then(() => {
        if (!cancelled) onBusyChange?.(false);
      });
    } catch {
      setWebglFailed(true);
      onBusyChange?.(false);
      return;
    }

    const onResize = () => engine?.resize();
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      engine?.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
    // Mount once for WebGL lifecycle; asset changes go through goTo below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reducedMotion, webglFailed]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !enabled || reducedMotion || webglFailed) return;
    if (assetUrl === engine.currentAssetUrl) return;
    onBusyChange?.(true);
    void engine.goTo(assetUrl);
  }, [assetUrl, enabled, reducedMotion, webglFailed, onBusyChange]);

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  const showFallback = !enabled || reducedMotion || webglFailed;

  return (
    <div
      className="particle-stage bg-background"
      data-lock={lockScroll ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="particle-stage-glow pointer-events-none absolute inset-0" />
      {showFallback ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackUrl}
          alt=""
          className="absolute inset-0 m-auto max-h-[55%] max-w-[55%] object-contain opacity-55"
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MEDIA_QUERIES.reducedMotion);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
