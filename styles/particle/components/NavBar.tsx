"use client";

import { useI18n } from "@/components/I18nProvider";
import { navLabel } from "@/lib/i18n";
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
        </div>
      </nav>
    </header>
  );
}
