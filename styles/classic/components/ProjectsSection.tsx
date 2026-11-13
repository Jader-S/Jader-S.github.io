"use client";

import ContentCard from "@/styles/classic/components/ContentCard";
import SectionHeader from "@/styles/classic/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { projectModalCopy, type ProjectId } from "@/data/project-details";
import type { Project } from "@/data/projects";
import { openProject } from "@/lib/project-modal";
import type { ProjectText } from "@/lib/i18n/types";
import LabButton from "@/styles/shared/chrome/LabButton";

interface ProjectsSectionProps<Id extends string> {
  id: string;
  sectionIndex: string;
  title: string;
  subtitle: string;
  /** 项目结构数据（data/projects.ts） */
  projects: readonly Project<Id>[];
  /** 按项目 id 索引的中英文文案（i18n locales） */
  texts: Record<Id, ProjectText>;
  showLinks?: boolean;
  /** 实体段：更深毛玻璃底板 */
  frosted?: boolean;
}

export default function ProjectsSection<Id extends string>({
  id,
  sectionIndex,
  title,
  subtitle,
  projects,
  texts,
  showLinks = false,
  frosted = false,
}: ProjectsSectionProps<Id>) {
  const { t, locale } = useI18n();
  const copy = projectModalCopy[locale];
  // Enterprise cards (no repo link) open the shared detail modal instead.
  const hasDetails = !showLinks;

  return (
    <section
      id={id}
      className={frosted ? "classic-section-shell-frost" : "classic-section-shell"}
    >
      <div className="classic-section-inner">
        <SectionHeader index={sectionIndex} title={title} subtitle={subtitle} />

        {hasDetails ? (
          <div className="mb-6">
            <LabButton />
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const { name, description } = texts[project.id];
            return (
              <ContentCard
                key={project.id}
                title={name}
                description={description}
                href={showLinks ? project.link : undefined}
                onClick={
                  hasDetails ? () => openProject(project.id as ProjectId) : undefined
                }
                badge={project.highlight ? t.common.featured : undefined}
                highlight={project.highlight}
                linkLabel={
                  hasDetails
                    ? `${copy.viewDetails} →`
                    : showLinks && project.link
                      ? `${t.common.viewRepo} →`
                      : undefined
                }
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
