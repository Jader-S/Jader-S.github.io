"use client";

import { useEffect, useRef } from "react";
import { MEDIA_QUERIES } from "@/lib/breakpoints";
import { useTheme } from "@/components/ThemeProvider";
import { useViewport } from "@/lib/hooks/useViewport";
import { getVantaTHREE } from "@/styles/classic/lib/vantaThree";
import type { ResolvedTheme } from "@/lib/theme";

type VantaEffect = { destroy: () => void; resize?: () => void };
type VantaFactory = (options: Record<string, unknown>) => VantaEffect;

/** dark=birds（深空）；light=waves（亮色水波），昼夜反差大 */
const THEME_COLORS = {
  dark: { bg: 0x050508, accent: 0x14b8a6, accent2: 0x5eead4 },
  light: {
    bg: 0xd8e2ec,
    color: 0x3d8f8a,
  },
} as const;

function readDomTheme(fallback: ResolvedTheme): ResolvedTheme {
  if (typeof document === "undefined") return fallback;
  const fromDom = document.documentElement.dataset.theme;
  return fromDom === "light" || fromDom === "dark" ? fromDom : fallback;
}

function resolveVantaFactory(mod: unknown, label: string): VantaFactory {
  let current: unknown = mod;
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof current === "function") return current as VantaFactory;
    if (current && typeof current === "object" && "default" in current) {
      current = (current as { default: unknown }).default;
      continue;
    }
    break;
  }
  throw new Error(`[Vanta] ${label} export is not a function`);
}

export default function VantaBackground() {
  const { resolved } = useTheme();
  const { isMobile } = useViewport();
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia(MEDIA_QUERIES.reducedMotion).matches) return;

    const theme = readDomTheme(resolved);
    const colors = THEME_COLORS[theme];
    const THREE = getVantaTHREE();
    (window as Window & { THREE?: typeof THREE }).THREE = THREE;

    let effect: VantaEffect | null = null;
    let cancelled = false;

    const sharedOptions = {
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 0.85,
      backgroundColor: colors.bg,
      forceAnimate: true,
    };

    const destroyEffect = () => {
      try {
        effect?.destroy();
      } catch {
        // ignore
      }
      effect = null;
      effectRef.current = null;
      el.querySelectorAll("canvas").forEach((node) => node.remove());
    };

    const initWaves = async () => {
      const light = THEME_COLORS.light;
      (window as Window & { THREE?: typeof THREE }).THREE = THREE;
      const mod = await import("vanta/dist/vanta.waves.min");
      if (cancelled) return;
      const WAVES = resolveVantaFactory(mod, "WAVES");
      destroyEffect();
      effect = WAVES({
        el,
        THREE,
        ...sharedOptions,
        backgroundColor: light.bg,
        color: light.color,
        shininess: 22,
        waveHeight: isMobile ? 12 : 16,
        waveSpeed: isMobile ? 0.7 : 0.85,
        zoom: isMobile ? 0.85 : 0.95,
      });
      effectRef.current = effect;
      requestAnimationFrame(() => effectRef.current?.resize?.());
      if (!el.querySelector("canvas")) {
        throw new Error("WAVES created no canvas");
      }
    };

    const initBirds = async () => {
      const dark = THEME_COLORS.dark;
      (window as Window & { THREE?: typeof THREE }).THREE = THREE;
      const mod = await import("@/styles/classic/vendor/vanta.birds.cpu.min.js");
      if (cancelled) return;
      const BIRDS = resolveVantaFactory(mod, "BIRDS");
      destroyEffect();
      effect = BIRDS({
        el,
        THREE,
        ...sharedOptions,
        backgroundColor: dark.bg,
        color1: dark.accent,
        color2: dark.accent2,
        colorMode: "lerp",
        birdSize: isMobile ? 0.7 : 0.85,
        wingSpan: isMobile ? 18 : 22,
        speedLimit: isMobile ? 4 : 5,
        separation: 18,
        alignment: 18,
        cohesion: 18,
        quantity: isMobile ? 4 : 5,
      });
      effectRef.current = effect;
      requestAnimationFrame(() => effectRef.current?.resize?.());
      if (!el.querySelector("canvas")) {
        throw new Error("BIRDS created no canvas");
      }
    };

    const init = async () => {
      try {
        if (theme === "light") {
          await initWaves();
        } else {
          await initBirds();
        }
      } catch (error) {
        console.warn("[Vanta] init failed", theme, error);
      }
    };

    void init();

    const onResize = () => effectRef.current?.resize?.();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      destroyEffect();
    };
  }, [resolved, isMobile]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 h-screen w-screen"
      style={{ backgroundColor: "var(--vanta-bg, #050508)" }}
      aria-hidden="true"
    />
  );
}
