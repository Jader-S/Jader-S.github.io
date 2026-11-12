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

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t.common.backToTop}
      className="focus-ring fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-divider bg-[var(--nav-bg-solid)] text-heading shadow-md backdrop-blur-md sm:bottom-8 sm:right-8"
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
