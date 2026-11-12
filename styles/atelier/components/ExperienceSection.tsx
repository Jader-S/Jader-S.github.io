"use client";

import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { experienceDomains } from "@/data/experience";

export default function ExperienceSection() {
  const { t } = useI18n();

  return (
    <section id="experience" className="section-shell-mute">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Fields"
          title={t.experience.title}
          subtitle={t.experience.subtitle}
        />

        <dl className="flex flex-col">
          {experienceDomains.map((domain) => {
            const text = t.experience.domains[domain.id];
            return (
              <div
                key={domain.id}
                className="grid gap-3 border-t border-divider py-8 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] sm:gap-10 sm:py-10"
              >
                <dt className="font-serif text-lg font-medium tracking-tight text-heading sm:text-xl">
                  {text.title}
                </dt>
                <dd className="text-[15px] leading-relaxed text-muted sm:text-base text-pretty">
                  {text.description}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
