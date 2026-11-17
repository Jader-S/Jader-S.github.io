"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { navLabel } from "@/lib/i18n";
import { useViewport } from "@/lib/hooks/useViewport";
import { lockBodyScroll } from "@/lib/lock-body-scroll";
import LocaleToggle from "@/styles/shared/chrome/LocaleToggle";
import ThemeToggle from "@/styles/shared/chrome/ThemeToggle";

const SECTION_IDS = [
  "top",
  "about",
  "work",
  "lab",
  "skills",
  "blog",
  "experience",
] as const;

export default function NavBar() {
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const [menuOpen, setMenuOpen] = useState(false);

  // 视口变宽时收起下拉，避免从手机切回桌面留下陈旧菜单状态。
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    return lockBodyScroll();
  }, [menuOpen, isMobile]);

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-[var(--nav-bg)] backdrop-blur-md">
      <nav
        className="flex items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12"
        aria-label={t.navAria.main}
      >
        <a
          href="#top"
          className="blueprint-display focus-ring shrink-0 text-sm font-semibold tracking-tight text-heading sm:text-base"
          translate="no"
          onClick={() => setMenuOpen(false)}
        >
          Jader
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
          {SECTION_IDS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="blueprint-nav-link whitespace-nowrap"
            >
              {navLabel(t, id)}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LocaleToggle compact />
          <ThemeToggle compact />
          <button
            type="button"
            className="focus-ring flex flex-col gap-1.5 rounded-sm p-2 text-heading md:hidden"
            aria-label={menuOpen ? t.navAria.closeMenu : t.navAria.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`block h-px w-5 bg-current transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="border-t border-divider bg-[var(--nav-bg)] backdrop-blur-md md:hidden">
          <ul className="flex max-h-[calc(100dvh-3.5rem)] flex-col overflow-y-auto px-5 py-2">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="blueprint-nav-link block py-3"
                  onClick={() => setMenuOpen(false)}
                >
                  {navLabel(t, id)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
