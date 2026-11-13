"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/I18nProvider";
import { useViewport } from "@/lib/hooks/useViewport";
import { getStyleHref } from "@/lib/style";
import { STYLE_IDS, STYLE_REGISTRY, type StyleMode } from "@/styles/registry";
import { useStyle } from "@/styles/shared/providers/StyleProvider";
import styles from "@/styles/shared/style-rail.module.css";

function StyleIcon() {
  return (
    <svg
      className={styles.handleIcon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="13"
        y="3"
        width="8"
        height="8"
        rx="1.5"
        fill="currentColor"
        opacity="0.85"
      />
      <rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="1.5"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="13"
        y="13"
        width="8"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

/**
 * Style switcher.
 *
 * - ≥768px: the original left floating vertical rail, unchanged.
 * - <768px: a 30px edge handle; tapping it opens a portaled left drawer with
 *   all five styles. Overlay / Esc / close button dismiss it.
 *
 * Visibility is CSS-driven (see style-rail.module.css) rather than a JS
 * viewport branch: the component is server-rendered inside AppProviders, so a
 * width-based first render would cause a hydration mismatch and a flash of the
 * desktop rail on phones. The drawer is portaled to <body> because particle
 * uses a snap-scroll container and several styles create transform/overflow
 * stacking contexts that would otherwise clip a fixed overlay.
 */
export default function StyleRail() {
  const { style, chrome } = useStyle();
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const isClassicChrome = chrome === "classic";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const handleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const drawerId = useId();

  useEffect(() => setMounted(true), []);

  // CSS also hides the drawer at >=768px; sync the state so coming back to a
  // phone does not reveal a stale open drawer.
  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handle = handleRef.current;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      handle?.focus();
    };
  }, [open]);

  const labelFor = (mode: StyleMode) => {
    const key = STYLE_REGISTRY[mode].labelKey;
    return t.style[key];
  };

  const onSelect = (event: MouseEvent<HTMLAnchorElement>, active: boolean) => {
    // Same-tab full navigation via the native href; only the active style is
    // prevented so the page does not reload on itself.
    if (active) event.preventDefault();
    setOpen(false);
  };

  const onOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setOpen(false);
  };

  return (
    <>
      <nav
        className={
          isClassicChrome
            ? "pointer-events-auto fixed left-3 top-1/2 z-[60] hidden -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150 sm:left-4 md:flex"
            : "pointer-events-auto fixed left-3 top-1/2 z-[60] hidden -translate-y-1/2 flex-col overflow-hidden border border-divider bg-[var(--nav-bg)] p-0.5 shadow-lg backdrop-blur-md sm:left-4 md:flex"
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
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={
                isClassicChrome
                  ? `focus-ring flex min-h-[3.25rem] w-9 items-center justify-center rounded-xl text-[11px] font-medium tracking-wide transition-colors sm:min-h-[3.5rem] sm:w-10 sm:text-xs ${
                      active
                        ? "bg-active text-theme-light"
                        : "text-muted hover:text-body"
                    }`
                  : `focus-ring flex min-h-[3.25rem] w-9 items-center justify-center text-[11px] tracking-wide transition-colors duration-250 sm:min-h-[3.5rem] sm:w-10 sm:text-xs ${
                      active ? "bg-active text-theme" : "text-muted hover:text-heading"
                    }`
              }
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              onClick={(event) => {
                // Same-tab full navigation via the native href; only the active
                // style is prevented so the page does not reload on itself.
                if (active) event.preventDefault();
              }}
            >
              {label}
            </a>
          );
        })}
      </nav>

      <button
        ref={handleRef}
        type="button"
        className={styles.handle}
        aria-label={open ? t.style.closeMenu : t.style.openMenu}
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((value) => !value)}
      >
        <StyleIcon />
        <span className={styles.handleLabel}>{t.style.railLabel}</span>
      </button>

      {mounted && open
        ? createPortal(
            <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
              <div
                ref={panelRef}
                id={drawerId}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={styles.panel}
              >
                <div className={styles.bar}>
                  <h2 className={styles.title} id={titleId}>
                    {t.style.drawerTitle}
                  </h2>
                  <button
                    type="button"
                    className={styles.close}
                    onClick={() => setOpen(false)}
                    aria-label={t.style.closeMenu}
                  >
                    ✕
                  </button>
                </div>
                <ul className={styles.list}>
                  {STYLE_IDS.map((item, index) => {
                    const active = style === item;
                    return (
                      <li key={item}>
                        <a
                          href={getStyleHref(item)}
                          aria-current={active ? "page" : undefined}
                          className={styles.item}
                          onClick={(event) => onSelect(event, active)}
                        >
                          <span className={styles.itemIndex} aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className={styles.itemName}>{labelFor(item)}</span>
                          {active ? (
                            <span className={styles.itemCurrent}>
                              {t.style.current}
                            </span>
                          ) : null}
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <p className={styles.footer}>JADERAI · STYLES</p>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
