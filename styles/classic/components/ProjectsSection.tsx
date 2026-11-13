"use client";

import ContentCard from "@/styles/classic/components/ContentCard";
import SectionHeader from "@/styles/classic/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { projectModalCopy, type ProjectId } from "@/data/project-details";
import type { Project } from "@/data/projects";
import { openProject } from "@/lib/project-modal";
import type { ProjectText } from "@/lib/i18n/types";

interface ProjectsSectionProps<Id extends string> {
  id: string;
  /** 合并前的旧锚点，渲染成不可见别名节点，保证旧链接不失效。 */
  aliasIds?: string[];
  sectionIndex: string;
  title: string;
  subtitle: string;
  /** 作品结构数据（data/projects.ts） */
  projects: readonly Project<Id>[];
  /** 按作品 id 索引的中英文文案（i18n locales） */
  texts: Record<Id, ProjectText>;
  /** 实体段：更深毛玻璃底板 */
  frosted?: boolean;
}

/**
 * 单一「作品」区块（Phase 7）：企业项目与开源项目已合并，
 * 所有卡片统一在当前页打开共享详情弹框，仓库外链只在弹框里给出。
 */
export default function ProjectsSection<Id extends string>({
  id,
  aliasIds = [],
  sectionIndex,
  title,
  subtitle,
  projects,
  texts,
  frosted = false,
}: ProjectsSectionProps<Id>) {
  const { t, locale } = useI18n();
  const copy = projectModalCopy[locale];

  return (
    <section
      id={id}
      className={frosted ? "classic-section-shell-frost" : "classic-section-shell"}
    >
      {aliasIds.map((alias) => (
        <span key={alias} id={alias} aria-hidden="true" />
      ))}
      <div className="classic-section-inner">
        <SectionHeader index={sectionIndex} title={title} subtitle={subtitle} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const { name, description } = texts[project.id];
            return (
              <ContentCard
                key={project.id}
                testId="project-card"
                title={name}
                description={description}
                onClick={() => openProject(project.id as ProjectId)}
                badge={project.highlight ? t.common.featured : undefined}
                highlight={project.highlight}
                linkLabel={`${copy.viewDetails} →`}
                footer={
                  <div className="flex flex-wrap gap-2">
                    {project.tech.slice(0, 5).map((tech) => (
                      <span key={tech} className="classic-tech-tag" translate="no">
                        {tech}
                      </span>
                    ))}
                    {project.tech.length > 5 && (
                      <span className="classic-tech-tag text-faint">
                        +{project.tech.length - 5}
                      </span>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
