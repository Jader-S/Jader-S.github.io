"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

const STORAGE_KEY = "portfolio-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

export default function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setVisible(stored !== "accepted" && stored !== "rejected");
  }, []);

  const saveChoice = (choice: ConsentChoice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--glass-border)] bg-[var(--nav-bg)] p-4 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl backdrop-saturate-150 sm:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <p id="cookie-consent-title" className="text-sm font-medium text-heading">
            {t.cookie.title}
          </p>
          <p id="cookie-consent-desc" className="text-sm leading-relaxed text-muted">
            {t.cookie.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => saveChoice("rejected")}
            className="focus-ring rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 text-sm font-semibold text-body backdrop-blur-md transition-colors hover:border-theme/40 hover:bg-[var(--glass-bg-hover)] hover:text-theme-light"
          >
            {t.cookie.reject}
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="focus-ring rounded-full bg-theme px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t.cookie.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
