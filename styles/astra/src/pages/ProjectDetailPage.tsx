/**
 * ASTRA 作品详情 2D 面板。
 *
 * 卡片点进来仍走星图自己的飞行状态机；关联 Demo 则交给全局共享弹框
 * （lib/project-modal.ts），在当前页内联预览，与另外四套主题行为一致。
 * Phase 4 起不再内嵌外部静态产物：原来的 qa-agent/index.html 早已不存在。
 */
import { useEffect, type CSSProperties } from "react";
import Panel from "@astra/ui/Panel";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import { openDemo } from "@/lib/project-modal";
import type { DemoSlug } from "@/data/project-details";
import "./content.css";

const ACCENTS = ["#22d3ee", "#a855f7", "#f59e0b"];

export default function ProjectDetailPage({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const t = useT();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);

  useEffect(() => {
    setActive("projects");
    if (useStore.getState().flight !== "FLYING_IN") {
      setFlight("VIEWING");
    }
  }, [setActive, setFlight]);

  const index = t.projects.list.findIndex((p) => p.id === id);
  const project = index >= 0 ? t.projects.list[index] : null;
  const accent = ACCENTS[(index >= 0 ? index : 0) % ACCENTS.length];

  return (
    <Panel
      title={project?.title ?? t.projects.heading}
      sub={project ? project.role : t.projects.sub}
      onReturn={onBack}
      returnLabel={t.projects.backToList}
    >
      <div className="project-detail" style={{ "--accent": accent } as CSSProperties}>
        {project ? (
          <>
            <dl className="project-detail__meta">
              <div className="project-detail__meta-row">
                <dt>{t.projects.roleLabel}</dt>
                <dd>{project.role}</dd>
              </div>
              <div className="project-detail__meta-row">
                <dt>{t.projects.tagLabel}</dt>
                <dd>{project.tag}</dd>
              </div>
              <div className="project-detail__meta-row">
                <dt>{t.projects.metricLabel}</dt>
                <dd className="project-detail__metric">{project.metric}</dd>
              </div>
            </dl>

            {project.desc ? (
              <section className="project-detail__body">
                <p className="project-detail__desc">{project.desc}</p>
                {project.demos && project.demos.length > 0 && (
                  <div className="project-detail__demos">
                    <h3 className="project-detail__demos-title">实验室 Demo</h3>
                    {project.demos.map((d) => (
                      <div className="project-detail__demo" key={d.slug}>
                        <div className="project-detail__demo-name">{d.name}</div>
                        <p className="project-detail__demo-desc">{d.desc}</p>
                        <button
                          type="button"
                          className="project-detail__demo-btn"
                          onClick={() => openDemo(d.slug as DemoSlug)}
                        >
                          {t.projects.previewDemo}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              /* 无 desc 的项目仍显示「整理中」占位，不造假正文 */
              <section className="project-detail__placeholder" aria-busy="true">
                <span className="project-detail__badge">{t.projects.detailBadge}</span>
                <h2 className="project-detail__placeholder-title">
                  {t.projects.detailTitle}
                </h2>
                <p className="project-detail__placeholder-note">
                  {t.projects.detailPlaceholder}
                </p>
                <div className="project-detail__skeleton" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="project-detail__unknown">{t.projects.detailPlaceholder}</p>
        )}
      </div>
    </Panel>
  );
}
