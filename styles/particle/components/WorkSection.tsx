"use client";

import { useI18n } from "@/components/I18nProvider";
import {
  enterpriseProjects,
  githubProjects,
  type EnterpriseProjectId,
  type GithubProjectId,
} from "@/data/projects";

export default function WorkSection() {
  const { t } = useI18n();
  const featured = [
    ...enterpriseProjects.slice(0, 4).map((project) => {
      const id = project.id as EnterpriseProjectId;
      return {
        id,
        name: t.enterprise.projects[id].name,
        description: t.enterprise.projects[id].description,
        tech: [...project.tech],
        link: undefined as string | undefined,
      };
    }),
    ...githubProjects.slice(0, 3).map((project) => {
      const id = project.id as GithubProjectId;
      const link =
        "link" in project && typeof project.link === "string"
          ? project.link
          : undefined;
      return {
        id,
        name: t.github.projects[id].name,
        description: t.github.projects[id].description,
        tech: [...project.tech],
        link,
      };
    }),
  ];

  return (
    <section id="work" className="particle-section">
      <p className="particle-eyebrow">{t.enterprise.index}</p>
      <h2 className="particle-title">{t.enterprise.title}</h2>
      <p className="particle-body">{t.enterprise.subtitle}</p>
      <ul className="mt-8 space-y-0 border-t border-divider">
        {featured.map((project) => {
          const row = (
            <>
              <div className="min-w-0">
                <p className="text-[15px] text-heading">{project.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {project.description}
                </p>
                <p className="mt-2 font-mono text-[11px] text-faint" translate="no">
                  {project.tech.slice(0, 4).join(" · ")}
                </p>
              </div>
              {project.link ? (
                <span className="shrink-0 text-sm text-faint">→</span>
              ) : null}
            </>
          );

          return (
            <li key={project.id} className="border-b border-divider">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring flex items-start justify-between gap-4 py-4 transition-colors hover:bg-[var(--nav-hover)]"
                >
                  {row}
                </a>
              ) : (
                <div className="flex items-start justify-between gap-4 py-4">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
