"use client";

import SectionHeader from "@/styles/classic/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { skillCategories } from "@/data/skills";

export default function SkillsSection() {
  const { t } = useI18n();
  const [featured, ...rest] = skillCategories;

  return (
    <section id="skills" className="classic-section-shell">
      <div className="classic-section-inner">
        <SectionHeader
          index={t.skills.index}
          title={t.skills.title}
          subtitle={t.skills.subtitle}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <article className="glass-card-interactive lg:col-span-2 lg:row-span-2 p-6 md:p-8">
            <h3 className="mb-2 text-xl font-semibold text-heading">
              {t.skills.categories[featured.id].name}
            </h3>
            <p className="mb-6 text-sm text-muted">{t.skills.featuredDesc}</p>
            <div className="flex flex-wrap gap-2">
              {featured.skillIds.map((skillId) => (
                <span key={skillId} className="classic-tech-tag text-sm">
                  {t.skills.categories[featured.id].skills[skillId]}
                </span>
              ))}
            </div>
          </article>

          {rest.map((category) => {
            const text = t.skills.categories[category.id];
            // category 是联合类型，TS 无法在联合上保持 id 与 skillIds 的关联；
            // 每个分类的技能 key 集已由 SkillCategoriesText 映射类型保证完整，
            // 这里断言为宽松索引即可安全取值。
            const skills = text.skills as Record<string, string>;
            return (
              <article key={category.id} className="glass-card-interactive p-5 md:p-6">
                <h3 className="mb-4 text-base font-semibold text-body">{text.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.skillIds.map((skillId) => (
                    <span key={skillId} className="classic-tech-tag">
                      {skills[skillId]}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
