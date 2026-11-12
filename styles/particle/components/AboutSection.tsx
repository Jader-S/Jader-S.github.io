"use client";

import { useI18n } from "@/components/I18nProvider";
import { profile } from "@/data/profile";

export default function AboutSection() {
  const { t } = useI18n();

  return (
    <section id="about" className="particle-section">
      <p className="particle-eyebrow">{t.about.index}</p>
      <h2 className="particle-title">{t.about.title}</h2>
      <p className="particle-body">{t.about.subtitle}</p>
      <p className="mt-6 max-w-xl font-serif text-lg leading-snug text-heading sm:text-xl">
        {t.about.headline}
        <span className="text-theme"> {t.about.headlineHighlight} </span>
        {t.about.headlineEnd}
      </p>
      <div className="particle-body space-y-3">
        {t.about.summary.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      <p className="mt-6 text-sm text-faint">
        {t.about.location} · {profile.yearsOfExperience}
        {t.common.yearsExp}
      </p>
    </section>
  );
}
