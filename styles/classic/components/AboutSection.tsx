"use client";

import SectionHeader from "@/styles/classic/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { profile } from "@/data/profile";

export default function AboutSection() {
  const { t } = useI18n();

  return (
    <section id="about" className="classic-section-shell-frost">
      <div className="classic-section-inner">
        <SectionHeader
          index={t.about.index}
          title={t.about.title}
          subtitle={t.about.subtitle}
        />

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1.2fr]">
          <aside className="glass-card p-5 sm:p-8 md:p-10">
            <p className="mb-5 text-xl font-semibold leading-snug text-heading text-balance sm:mb-6 sm:text-2xl">
              {t.about.headline}
              <span className="theme-text">{t.about.headlineHighlight}</span>
              {t.about.headlineEnd}
            </p>
            <ul className="space-y-4 text-sm text-muted">
              <li className="flex items-center gap-3">
                <span className="text-theme" aria-hidden="true">
                  ◎
                </span>
                {t.about.location}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-theme" aria-hidden="true">
                  ◎
                </span>
                {profile.yearsOfExperience} {t.common.yearsExp}
              </li>
              <li className="flex items-center gap-3">
                <span className="text-theme" aria-hidden="true">
                  ◎
                </span>
                <span translate="no">Jader Sun</span>
              </li>
            </ul>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-8 w-full sm:w-auto"
            >
              {t.common.visitGithub}
            </a>
          </aside>

          <div className="glass-card space-y-5 p-5 sm:space-y-6 sm:p-8 md:p-10">
            {t.about.summary.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-body md:text-lg text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
