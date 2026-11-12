"use client";

import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { profile } from "@/data/profile";

export default function AboutSection() {
  const { t } = useI18n();

  return (
    <section id="about" className="section-shell">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Profile"
          title={t.about.title}
          subtitle={t.about.subtitle}
        />

        <p className="mb-12 max-w-2xl font-serif text-[clamp(1.35rem,3vw,1.85rem)] font-medium leading-snug tracking-tight text-heading text-balance sm:mb-16">
          {t.about.headline}
          <span className="text-theme">{t.about.headlineHighlight}</span>
          {t.about.headlineEnd}
        </p>

        <dl className="mb-14 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-divider py-10 sm:mb-16 sm:grid-cols-4 sm:gap-8 sm:py-12">
          {t.profile.highlights.map((item) => (
            <div key={item.label}>
              <dt className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                {item.label}
              </dt>
              <dd
                className="font-serif text-2xl font-medium tracking-tight text-heading sm:text-3xl"
                translate="no"
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <aside className="space-y-4 text-sm text-muted">
            <p>{t.about.location}</p>
            <p>
              {profile.yearsOfExperience} {t.common.yearsExp}
            </p>
            <p translate="no">Jader Sun</p>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link mt-4"
            >
              {t.common.visitGithub}
              <span aria-hidden="true">→</span>
            </a>
          </aside>

          <div className="space-y-6">
            {t.about.summary.map((paragraph, index) => (
              <p
                key={index}
                className="text-[15px] leading-[1.75] text-body sm:text-base text-pretty"
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
