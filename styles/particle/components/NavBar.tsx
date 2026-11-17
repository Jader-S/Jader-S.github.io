"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { navLabel } from "@/lib/i18n";
import { useViewport } from "@/lib/hooks/useViewport";
import { lockBodyScroll } from "@/lib/lock-body-scroll";
import LocaleToggle from "@/styles/shared/chrome/LocaleToggle";
import ThemeToggle from "@/styles/shared/chrome/ThemeToggle";
import { PARTICLE_SECTION_IDS, type ParticleSectionId } from "@/styles/particle/assets";

interface NavBarProps {
  activeId: ParticleSectionId;
  onNavigate: (id: ParticleSectionId) => void;
  locked: boolean;
}

export default function NavBar({ activeId, onNavigate, locked }: NavBarProps) {
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

  const navigate = (id: ParticleSectionId) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-[var(--nav-bg)] backdrop-blur-md">
      <nav
        className="flex items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12"
        aria-label={t.navAria.main}
      >
        <a
          href="#top"
          className="focus-ring shrink-0 font-serif text-sm font-medium tracking-tight text-heading sm:text-base"
          translate="no"
          onClick={(event) => {
            event.preventDefault();
            if (!locked) onNavigate("top");
          }}
        >
          Jader
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
          {PARTICLE_SECTION_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="particle-nav-link whitespace-nowrap"
              data-active={activeId === id ? "true" : "false"}
              disabled={locked}
              onClick={() => onNavigate(id)}
            >
              {navLabel(t, id)}
            </button>
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
            {PARTICLE_SECTION_IDS.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="particle-nav-link block w-full py-3 text-left"
                  data-active={activeId === id ? "true" : "false"}
                  disabled={locked}
                  onClick={() => navigate(id)}
                >
                  {navLabel(t, id)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
