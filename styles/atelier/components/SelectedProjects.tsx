"use client";

import { useSyncExternalStore } from "react";
import FlameWrap from "@/styles/atelier/components/canvasui/FlameWrap";
import SectionHeader from "@/styles/atelier/components/SectionHeader";
import { useI18n } from "@/components/I18nProvider";
import { useViewport } from "@/lib/hooks/useViewport";
import { projectModalCopy } from "@/data/project-details";
import { projects } from "@/data/projects";
import { openProject } from "@/lib/project-modal";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true
  );
}

export default function SelectedProjects() {
  const { t, locale } = useI18n();
  const copy = projectModalCopy[locale];
  const { isMobile } = useViewport();
  const reducedMotion = usePrefersReducedMotion();
  const total = projects.length;
  const useFlame = !isMobile && !reducedMotion;

  return (
    <section id="work" className="section-shell-mute overflow-x-clip">
      {/* 旧链接的别名锚点：企业/开源合并进 #work 后仍可定位，不产生布局。 */}
      <span id="selected" aria-hidden="true" />
      <span id="work-index" aria-hidden="true" />
      <div className="section-inner">
        <SectionHeader eyebrow="Work" title={t.work.title} subtitle={t.work.subtitle} />

        <div className="flex flex-col gap-8 sm:gap-10">
          {projects.map((project, index) => {
            const text = t.work.projects[project.id];
            const card = (
              <article
                role="button"
                tabIndex={0}
                data-testid="project-card"
                aria-label={`${text.name} · ${copy.viewDetails}`}
                onClick={() => openProject(project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProject(project.id);
                  }
                }}
                className="project-band group relative cursor-pointer overflow-hidden rounded-sm border border-divider/80 bg-[var(--band-bg)] px-1 py-10 sm:px-4 sm:py-14 md:px-6"
              >
                <div className="mb-6 flex items-baseline justify-between gap-4">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-faint">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(total).padStart(2, "0")}
                  </p>
                  <span className="font-mono text-[11px] tracking-wide text-theme">
                    {t.common.featured}
                  </span>
                </div>

                <h3 className="mb-5 font-serif text-[clamp(1.75rem,4.5vw,3rem)] font-medium leading-[1.15] tracking-tight text-heading transition-colors duration-300 group-hover:text-theme text-balance">
                  {text.name}
                </h3>

                <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base text-pretty">
                  {text.description}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="tech-chip" translate="no">
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="mt-6 font-mono text-[11px] tracking-[0.18em] text-theme">
                  {copy.viewDetails} →
                </p>
              </article>
            );

            if (!useFlame) {
              return <div key={project.id}>{card}</div>;
            }

            return (
              <FlameWrap
                key={project.id}
                className="w-full"
                color={[0.62, 0.48, 0.34]}
                intensity={0.62}
                height={120}
                spread={14}
                radius={4}
                speed={0.4}
                scale={0.85}
                sparks={1}
                smoke={0.35}
                melt={3}
                distortion={5}
                rim={0.85}
                ember={0.7}
                scorch={0.4}
              >
                {card}
              </FlameWrap>
            );
          })}
        </div>
      </div>
    </section>
  );
}
