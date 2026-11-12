"use client";

import { useI18n } from "@/components/I18nProvider";
import { useStyle } from "@/styles/shared/providers/StyleProvider";
import type { Locale } from "@/lib/i18n";

interface LocaleToggleProps {
  compact?: boolean;
  onSelect?: () => void;
}

export default function LocaleToggle({ compact = false, onSelect }: LocaleToggleProps) {
  const { locale, setLocale, t } = useI18n();
  const { chrome } = useStyle();
  const isClassicChrome = chrome === "classic";

  const handleSelect = (next: Locale) => {
    if (next !== locale) setLocale(next);
    onSelect?.();
  };

  const options: { value: Locale; label: string; short: string }[] = [
    { value: "zh", label: t.locale.zh, short: "中" },
    { value: "en", label: t.locale.en, short: "EN" },
  ];

  if (compact) {
    return (
      <div
        className={
          isClassicChrome
            ? "inline-flex rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] p-0.5 backdrop-blur-xl backdrop-saturate-150"
            : "inline-flex items-center border border-divider bg-[var(--color-surface)]/40 p-0.5"
        }
        role="group"
        aria-label="Language"
      >
        {options.map(({ value, label, short }) => (
          <button
            key={value}
            type="button"
            className={
              isClassicChrome
                ? `focus-ring rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    locale === value
                      ? "bg-active text-theme-light"
                      : "text-muted hover:text-body"
                  }`
                : `focus-ring min-w-[1.75rem] px-2 py-1 font-mono text-[10px] tracking-wide transition-colors duration-200 ${
                    locale === value
                      ? "bg-[var(--nav-active)] text-theme"
                      : "text-faint hover:text-heading"
                  }`
            }
            aria-pressed={locale === value}
            aria-label={label}
            onClick={() => handleSelect(value)}
          >
            {short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" role="group" aria-label="Language">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`focus-ring flex items-center gap-2 px-3 py-2.5 text-base transition-colors ${
            isClassicChrome ? "rounded-lg" : ""
          } ${
            locale === value
              ? isClassicChrome
                ? "bg-active text-theme-light"
                : "bg-active text-theme"
              : "text-muted hover:bg-hover"
          }`}
          aria-pressed={locale === value}
          onClick={() => handleSelect(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
