"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

const SHOW_AFTER = 400;

export default function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      aria-label={t.common.backToTop}
      onClick={scrollToTop}
      className={`focus-ring fixed bottom-6 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-body shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform,visibility] duration-300 hover:border-theme/40 hover:bg-[var(--glass-bg-hover)] hover:text-theme-light sm:bottom-8 sm:right-6 ${
        visible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-2 opacity-0 pointer-events-none"
      }`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
