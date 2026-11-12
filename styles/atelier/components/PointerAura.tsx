"use client";

import { useEffect, useSyncExternalStore } from "react";

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

function useIsCoarsePointer() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(pointer: coarse)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(pointer: coarse)").matches,
    () => true
  );
}

/** Spotlight that tracks the cursor with no lag. */
export default function PointerAura() {
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useIsCoarsePointer();

  useEffect(() => {
    if (reducedMotion || coarse) return;

    const root = document.documentElement;

    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / Math.max(window.innerWidth, 1)) * 100;
      const y = (event.clientY / Math.max(window.innerHeight, 1)) * 100;
      root.style.setProperty("--pointer-x", `${x.toFixed(2)}%`);
      root.style.setProperty("--pointer-y", `${y.toFixed(2)}%`);
      root.dataset.pointer = "active";
    };

    const onLeave = () => {
      root.dataset.pointer = "idle";
    };

    root.dataset.pointer = "idle";
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      root.style.removeProperty("--pointer-x");
      root.style.removeProperty("--pointer-y");
      delete root.dataset.pointer;
    };
  }, [reducedMotion, coarse]);

  if (reducedMotion || coarse) return null;

  return (
    <>
      <div
        className="pointer-aura pointer-aura-wide pointer-events-none fixed inset-0 z-[2]"
        aria-hidden="true"
      />
      <div
        className="pointer-aura pointer-aura-core pointer-events-none fixed inset-0 z-[2]"
        aria-hidden="true"
      />
      <div
        className="pointer-aura pointer-aura-ring pointer-events-none fixed inset-0 z-[2]"
        aria-hidden="true"
      />
    </>
  );
}
