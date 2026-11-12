"use client";

import { useI18n } from "@/components/I18nProvider";
import { useStyle } from "@/styles/shared/providers/StyleProvider";
import { getStyleHref, openStyleWindow } from "@/lib/style";
import { STYLE_IDS, STYLE_REGISTRY, type StyleMode } from "@/styles/registry";

/** Left floating vertical style tabs — opens another style via window.open. */
export default function StyleRail() {
  const { style, chrome } = useStyle();
  const { t } = useI18n();
  const isClassicChrome = chrome === "classic";

  const labelFor = (mode: StyleMode) => {
    const key = STYLE_REGISTRY[mode].labelKey;
    return t.style[key];
  };

  return (
    <nav
      className={
        isClassicChrome
          ? "pointer-events-auto fixed left-3 top-1/2 z-[60] flex -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150 sm:left-4"
          : "pointer-events-auto fixed left-3 top-1/2 z-[60] flex -translate-y-1/2 flex-col overflow-hidden border border-divider bg-[var(--nav-bg)] p-0.5 shadow-lg backdrop-blur-md sm:left-4"
      }
      aria-label={t.style.ariaLabel}
    >
      {STYLE_IDS.map((item) => {
        const active = style === item;
        const label = labelFor(item);
        return (
          <a
            key={item}
            href={getStyleHref(item)}
            target="_blank"
            rel="noopener noreferrer"
            aria-current={active ? "page" : undefined}
            aria-label={label}
            title={label}
            className={
              isClassicChrome
                ? `focus-ring flex min-h-[3.25rem] w-9 items-center justify-center rounded-xl text-[11px] font-medium tracking-wide transition-colors sm:min-h-[3.5rem] sm:w-10 sm:text-xs ${
                    active ? "bg-active text-theme-light" : "text-muted hover:text-body"
                  }`
                : `focus-ring flex min-h-[3.25rem] w-9 items-center justify-center text-[11px] tracking-wide transition-colors duration-250 sm:min-h-[3.5rem] sm:w-10 sm:text-xs ${
                    active ? "bg-active text-theme" : "text-muted hover:text-heading"
                  }`
            }
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            onClick={(event) => {
              event.preventDefault();
              if (!active) openStyleWindow(item);
            }}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
