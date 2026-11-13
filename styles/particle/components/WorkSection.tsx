"use client";

import { useI18n } from "@/components/I18nProvider";
import { projectModalCopy } from "@/data/project-details";
import { projects } from "@/data/projects";
import { openProject } from "@/lib/project-modal";

export default function WorkSection() {
  const { t, locale } = useI18n();
  const copy = projectModalCopy[locale];

  return (
    <section id="work" className="particle-section">
      <p className="particle-eyebrow">{t.work.index}</p>
      <h2 className="particle-title">{t.work.title}</h2>
      <p className="particle-body">{t.work.subtitle}</p>
      <ul className="mt-8 space-y-0 border-t border-divider">
        {projects.map((project) => {
          const text = t.work.projects[project.id];
          return (
            <li key={project.id} className="border-b border-divider">
              <button
                type="button"
                data-testid="project-card"
                onClick={() => openProject(project.id)}
                aria-label={`${text.name} · ${copy.viewDetails}`}
                className="focus-ring flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:bg-[var(--nav-hover)]"
              >
                <div className="min-w-0">
                  <p className="text-[15px] text-heading">{text.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {text.description}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-faint" translate="no">
                    {project.tech.slice(0, 4).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-faint">
                  {copy.viewDetails} →
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
