"use client";

import { useI18n } from "@/components/I18nProvider";
import { skillCategories, type SkillCategoryId } from "@/data/skills";

export default function SkillsSection() {
  const { t } = useI18n();

  return (
    <section id="skills" className="particle-section">
      <p className="particle-eyebrow">{t.skills.index}</p>
      <h2 className="particle-title">{t.skills.title}</h2>
      <p className="particle-body">{t.skills.subtitle}</p>
      <div className="mt-8 space-y-6">
        {skillCategories.map((category) => {
          const id = category.id as SkillCategoryId;
          const copy = t.skills.categories[id];
          return (
            <div key={category.id}>
              <h3 className="text-sm font-medium text-heading">{copy.name}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {category.skillIds.map((skillId) => (
                  <li key={skillId} className="particle-chip" translate="no">
                    {(copy.skills as Record<string, string>)[skillId]}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
