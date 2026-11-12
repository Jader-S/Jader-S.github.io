"use client";

import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { skillCategories } from "@/data/skills";

export default function SkillsSection() {
  const { t } = useI18n();

  return (
    <section id="skills" className="section-shell-mute">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Capability"
          title={t.skills.title}
          subtitle={t.skills.subtitle}
        />

        <div className="flex flex-col gap-12 sm:gap-14">
          {skillCategories.map((category) => {
            const text = t.skills.categories[category.id];
            const skills = text.skills as Record<string, string>;
            return (
              <div
                key={category.id}
                className="grid gap-4 border-t border-divider pt-8 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] sm:gap-10 sm:pt-10"
              >
                <h3 className="font-serif text-lg font-medium tracking-tight text-heading sm:text-xl">
                  {text.name}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {category.skillIds.map((skillId) => (
                    <span key={skillId} className="tech-tag text-[12px] sm:text-[13px]">
                      {skills[skillId]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
