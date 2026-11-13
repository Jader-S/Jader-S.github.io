"use client";

import { useI18n } from "@/components/I18nProvider";
import { profile } from "@/data/profile";

export default function FooterSection() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-divider px-5 py-12 sm:px-8 lg:px-12">
      <p
        className="select-none font-serif text-[clamp(2.5rem,10vw,5rem)] font-medium leading-none tracking-tight text-heading opacity-[0.07]"
        translate="no"
        aria-hidden="true"
      >
        {t.profile.name}
      </p>

      <div className="mt-8 flex flex-col gap-8 border-t border-divider pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="font-serif text-lg font-medium tracking-tight text-heading"
            translate="no"
          >
            {t.profile.name}
          </p>
          <p className="mt-2 text-sm text-faint">
            {t.profile.title} · {profile.yearsOfExperience} {t.common.yearsExpShort}
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
          aria-label={t.navAria.footer}
        >
          <a
            className="particle-link text-sm"
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.hero.github}
          </a>
          <a className="particle-link text-sm" href="#about">
            {t.footer.about}
          </a>
          <a className="particle-link text-sm" href="#blog">
            {t.footer.blog}
          </a>
        </nav>

        <p className="text-sm text-faint" translate="no">
          © {year} {t.profile.name}. {t.common.footerTech}
        </p>
      </div>
    </footer>
  );
}
