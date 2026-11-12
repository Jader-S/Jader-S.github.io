"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

import { PARTICLE_SECTION_IDS, type ParticleSectionId } from "@/styles/particle/assets";

/** Scroll animation duration — slightly under particle morph so content leads. */
const SCROLL_MS = 880;

interface SnapScrollControllerProps {
  columnRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  locked: boolean;
  activeId: ParticleSectionId;
  onSectionChange: (id: ParticleSectionId) => void;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sectionScrollTop(root: HTMLElement, el: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  return root.scrollTop + (elRect.top - rootRect.top);
}

/** Programmatic silky scroll inside the particle content column. */
export function animateColumnScroll(
  root: HTMLElement,
  targetTop: number,
  durationMs = SCROLL_MS
): Promise<void> {
  const start = root.scrollTop;
  const delta = targetTop - start;
  if (Math.abs(delta) < 1) {
    root.scrollTop = targetTop;
    return Promise.resolve();
  }

  const t0 = performance.now();
  return new Promise((resolve) => {
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      root.scrollTop = start + delta * easeInOutCubic(t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        root.scrollTop = targetTop;
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

export function scrollColumnToSection(
  root: HTMLElement,
  sectionId: ParticleSectionId,
  durationMs = SCROLL_MS
): Promise<void> {
  const el = document.getElementById(sectionId);
  if (!el) return Promise.resolve();
  return animateColumnScroll(root, sectionScrollTop(root, el), durationMs);
}

/**
 * Desktop: wheel/keyboard snap with eased scrollTop (no CSS snap fight).
 * Mobile: no-op (native scroll + IntersectionObserver elsewhere).
 */
export function useSnapScrollController({
  columnRef,
  enabled,
  locked,
  activeId,
  onSectionChange,
}: SnapScrollControllerProps) {
  const activeRef = useRef(activeId);
  const lockedRef = useRef(locked);
  const animatingRef = useRef(false);
  activeRef.current = activeId;
  lockedRef.current = locked;

  useEffect(() => {
    const root = columnRef.current;
    if (!root || !enabled) return;

    const sections = PARTICLE_SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter(Boolean) as HTMLElement[];

    const goToIndex = async (index: number) => {
      const clamped = Math.max(0, Math.min(sections.length - 1, index));
      const el = sections[clamped];
      if (!el || animatingRef.current) return;

      const id = el.id as ParticleSectionId;
      if (id !== activeRef.current) onSectionChange(id);

      animatingRef.current = true;
      try {
        await animateColumnScroll(root, sectionScrollTop(root, el));
      } finally {
        animatingRef.current = false;
      }
    };

    const currentIndex = () =>
      Math.max(0, PARTICLE_SECTION_IDS.indexOf(activeRef.current));

    let wheelCooldownUntil = 0;
    let wheelAcc = 0;
    let wheelResetTimer = 0;

    const onWheel = (event: WheelEvent) => {
      if (lockedRef.current || animatingRef.current) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const now = performance.now();
      if (now < wheelCooldownUntil) return;

      // Accumulate trackpad deltas so tiny events don't fire false snaps.
      wheelAcc += event.deltaY;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAcc = 0;
      }, 80);

      if (Math.abs(wheelAcc) < 40) return;

      const dir = wheelAcc > 0 ? 1 : -1;
      wheelAcc = 0;
      wheelCooldownUntil = now + SCROLL_MS + 40;
      void goToIndex(currentIndex() + dir);
    };

    const onKey = (event: KeyboardEvent) => {
      if (lockedRef.current || animatingRef.current) {
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "PageDown" ||
          event.key === "PageUp" ||
          event.key === " "
        ) {
          event.preventDefault();
        }
        return;
      }
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        void goToIndex(currentIndex() + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        void goToIndex(currentIndex() - 1);
      }
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(wheelResetTimer);
    };
  }, [columnRef, enabled, onSectionChange]);
}

/** Mobile / continuous: observe which section is most visible. */
export function useSectionObserver(
  enabled: boolean,
  onSectionChange: (id: ParticleSectionId) => void
) {
  useEffect(() => {
    if (!enabled) return;

    const observers: IntersectionObserver[] = [];
    PARTICLE_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) onSectionChange(id);
        },
        { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [enabled, onSectionChange]);
}
