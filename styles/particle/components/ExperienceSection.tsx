"use client";

import { useI18n } from "@/components/I18nProvider";
import { experienceDomains } from "@/data/experience";

export default function ExperienceSection() {
  const { t } = useI18n();

  return (
    <section id="experience" className="particle-section">
      <p className="particle-eyebrow">{t.experience.index}</p>
      <h2 className="particle-title">{t.experience.title}</h2>
      <p className="particle-body">{t.experience.subtitle}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {experienceDomains.map((domain) => {
          const copy = t.experience.domains[domain.id];
          return (
            <li key={domain.id} className="border border-divider p-4">
              <p className="text-sm font-medium text-heading">{copy.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {copy.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
