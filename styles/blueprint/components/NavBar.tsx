"use client";

import { useI18n } from "@/components/I18nProvider";
import LocaleToggle from "@/styles/shared/chrome/LocaleToggle";
import ThemeToggle from "@/styles/shared/chrome/ThemeToggle";

const SECTION_IDS = ["top", "about", "work", "skills", "blog", "experience"] as const;

type SectionId = (typeof SECTION_IDS)[number];

const LABELS: Record<SectionId, (t: ReturnType<typeof useI18n>["t"]) => string> = {
  top: (t) => t.profile.name,
  about: (t) => t.about.title,
  work: (t) => t.enterprise.title,
  skills: (t) => t.skills.title,
  blog: (t) => t.blog.title,
  experience: (t) => t.experience.title,
};

export default function NavBar() {
  const { t } = useI18n();

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
              {LABELS[id](t)}
            </a>
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
