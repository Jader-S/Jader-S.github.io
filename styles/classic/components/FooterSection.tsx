"use client";

import { useI18n } from "@/components/I18nProvider";
import { csdnProfile } from "@/data/blogs";
import { profile } from "@/data/profile";

export default function FooterSection() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-divider px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-lg font-semibold theme-text">{t.profile.name}</p>
          <p className="mt-1 text-sm text-faint">
            {t.profile.title} · {profile.yearsOfExperience} {t.common.yearsExpShort}
          </p>
        </div>

        <nav
          aria-label={t.navAria.footer}
          className="flex flex-wrap items-center justify-center gap-5"
        >
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring text-sm text-muted transition-colors hover:text-theme-light"
          >
            {t.hero.github}
          </a>
          <a
            href="#about"
            className="focus-ring text-sm text-muted transition-colors hover:text-theme-light"
          >
            {t.footer.about}
          </a>
          <a
            href="#blog"
            className="focus-ring text-sm text-muted transition-colors hover:text-theme-light"
          >
            {t.footer.blog}
          </a>
          <a
            href={csdnProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring text-sm text-muted transition-colors hover:text-theme-light"
          >
            {t.footer.csdn}
          </a>
        </nav>

        <p className="text-sm text-faint" translate="no">
          © {year} {t.profile.name}. {t.common.footerTech}
        </p>
      </div>
    </footer>
  );
}
