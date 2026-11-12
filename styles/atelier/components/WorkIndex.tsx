"use client";

import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { enterpriseProjects, githubProjects } from "@/data/projects";

function IndexRow({
  name,
  tech,
  href,
  linkLabel,
}: {
  name: string;
  tech: string[];
  href?: string;
  linkLabel?: string;
}) {
  const techSummary = tech.slice(0, 4).join(" · ");

  const inner = (
    <>
      <span className="text-[15px] text-heading transition-colors duration-300 group-hover:text-theme sm:text-base">
        {name}
      </span>
      <span className="tech-tag truncate" translate="no">
        {techSummary}
      </span>
      {href ? (
        <span className="text-sm text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-theme">
          {linkLabel ?? "→"}
        </span>
      ) : (
        <span className="hidden sm:block" />
      )}
    </>
  );

  return (
    <li className="border-t border-divider">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="index-row group"
        >
          {inner}
        </a>
      ) : (
        <div className="index-row group cursor-default">{inner}</div>
      )}
    </li>
  );
}

export default function WorkIndex() {
  const { t } = useI18n();
  const enterpriseRest = enterpriseProjects.filter(
    (p) => !("highlight" in p && p.highlight)
  );

  return (
    <section id="work" className="section-shell">
      <div className="section-inner">
        <SectionHeader
          eyebrow="Index"
          title={t.nav.find((item) => item.href === "#work")?.label ?? "Work"}
          subtitle={t.github.subtitle}
        />

        {enterpriseRest.length > 0 ? (
          <div className="mb-16 sm:mb-20">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
              {t.enterprise.title}
            </p>
            <ul>
              {enterpriseRest.map((project) => {
                const text = t.enterprise.projects[project.id];
                return (
                  <IndexRow key={project.id} name={text.name} tech={project.tech} />
                );
              })}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            {t.github.title}
          </p>
          <ul>
            {githubProjects.map((project) => {
              const text = t.github.projects[project.id];
              return (
                <IndexRow
                  key={project.id}
                  name={text.name}
                  tech={project.tech}
                  href={project.link}
                  linkLabel={`${t.common.viewRepo} →`}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
