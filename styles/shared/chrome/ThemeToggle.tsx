"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useI18n } from "@/components/I18nProvider";
import { useStyle } from "@/styles/shared/providers/StyleProvider";
import type { ThemeMode } from "@/lib/theme";

interface ThemeToggleProps {
  compact?: boolean;
  onSelect?: () => void;
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13.2 9.2A5.5 5.5 0 1 1 6.8 2.8 4.2 4.2 0 0 0 13.2 9.2Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 2.75v10.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 2.75a5.25 5.25 0 0 0 0 10.5V2.75Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

export default function ThemeToggle({ compact = false, onSelect }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();
  const { chrome } = useStyle();
  const { t } = useI18n();
  const isClassicChrome = chrome === "classic";

  const modeLabels: Record<ThemeMode, string> = {
    light: t.theme.light,
    dark: t.theme.dark,
    auto: t.theme.auto,
  };

  const handleSelect = (next: ThemeMode) => {
    setMode(next);
    onSelect?.();
  };

  if (compact) {
    return (
      <div
        className={
          isClassicChrome
            ? "inline-flex rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] p-0.5 backdrop-blur-xl backdrop-saturate-150"
            : "inline-flex items-center border border-divider bg-[var(--color-surface)]/40 p-0.5"
        }
        role="group"
        aria-label={t.theme.ariaLabel}
      >
        {(["light", "dark", "auto"] as ThemeMode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={
              isClassicChrome
                ? `focus-ring rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    mode === item
                      ? "bg-active text-theme-light"
                      : "text-muted hover:text-body"
                  }`
                : `focus-ring flex h-7 w-7 items-center justify-center transition-colors duration-200 ${
                    mode === item
                      ? "bg-[var(--nav-active)] text-theme"
                      : "text-faint hover:text-heading"
                  }`
            }
            aria-pressed={mode === item}
            aria-label={modeLabels[item]}
            onClick={() => handleSelect(item)}
          >
            {isClassicChrome ? (
              item === "light" ? (
                "☀"
              ) : item === "dark" ? (
                "☾"
              ) : (
                "◐"
              )
            ) : (
              <ThemeIcon mode={item} />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" role="group" aria-label={t.theme.ariaLabel}>
      {(["light", "dark", "auto"] as ThemeMode[]).map((item) => (
        <button
          key={item}
          type="button"
          className={`focus-ring flex items-center gap-2 px-3 py-2.5 text-base transition-colors ${
            isClassicChrome ? "rounded-lg" : ""
          } ${
            mode === item
              ? isClassicChrome
                ? "bg-active text-theme-light"
                : "bg-active text-theme"
              : "text-muted hover:bg-hover"
          }`}
          aria-pressed={mode === item}
          onClick={() => handleSelect(item)}
        >
          <span className="inline-flex w-4 justify-center" aria-hidden="true">
            {isClassicChrome ? (
              item === "light" ? (
                "☀"
              ) : item === "dark" ? (
                "☾"
              ) : (
                "◐"
              )
            ) : (
              <ThemeIcon mode={item} />
            )}
          </span>
          {modeLabels[item]}
        </button>
      ))}
    </div>
  );
}
