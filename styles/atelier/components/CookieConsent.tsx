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
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-divider bg-[var(--nav-bg-solid)] p-4 sm:p-5"
    >
      <div className="mx-auto flex max-w-[1080px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="focus-ring border border-divider px-5 py-2.5 text-sm text-body transition-colors hover:text-theme"
          >
            {t.cookie.reject}
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="focus-ring bg-[var(--text-heading)] px-5 py-2.5 text-sm text-[var(--color-background)] transition-opacity hover:opacity-90"
          >
            {t.cookie.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
