/**
 * V3/4A 作品详情占位页。
 *
 * 设计原则 P4「可供性真实」：卡片现在真的能点进去，但内容尚未成文，
 * 因此这里明确标注「整理中」，用骨架线框占位，绝不编造假正文。
 * t.projects.list 只有 id / title / role / tag / metric，详情页据此还原
 * 已知元数据，其余留白。
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Panel from '@/ui/Panel';
import ProjectEmbed from '@/ui/ProjectEmbed';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import './content.css';

const ACCENTS = ['#22d3ee', '#a855f7', '#f59e0b'];

export default function ProjectDetailPage() {
  const t = useT();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);

  useEffect(() => {
    setActive('projects');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
  }, [setActive, setFlight]);

  const index = t.projects.list.findIndex((p) => p.id === id);
  const project = index >= 0 ? t.projects.list[index] : null;
  const accent = ACCENTS[(index >= 0 ? index : 0) % ACCENTS.length];

  const onReturn = () => navigate('/projects');
  const [showEmbed, setShowEmbed] = useState(false);
  const embedRef = useRef<HTMLElement>(null);

  // 展开预览后把视口带到 iframe，避免用户点了按钮却还在看上方的描述。
  const toggleEmbed = () => {
    const next = !showEmbed;
    setShowEmbed(next);
    if (next) {
      window.setTimeout(
        () => embedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        120,
      );
    }
  };

  return (
    <Panel
      title={project?.title ?? t.projects.heading}
      sub={project ? project.role : t.projects.sub}
      onReturn={onReturn}
      returnLabel={t.projects.backToList}
    >
      <div className="project-detail" style={{ '--accent': accent } as CSSProperties}>
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
                          onClick={() => {
                            // 先同步飞行导航状态，避免 FlightRouterSync 把 /demos 弹回当前星球
                            setActive('demos');
                            setFlight('VIEWING');
                            navigate(`/demos?demo=${d.slug}`);
                          }}
                        >
                          进入实验室查看 Demo →
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
                <h2 className="project-detail__placeholder-title">{t.projects.detailTitle}</h2>
                <p className="project-detail__placeholder-note">{t.projects.detailPlaceholder}</p>
                <div className="project-detail__skeleton" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
              </section>
            )}

            {project.embedUrl && (
              <section className="project-detail__embed" ref={embedRef}>
                <div className="project-detail__demos-title">{t.projects.embedTitle}</div>
                <p className="project-detail__demo-desc">{t.projects.embedDesc}</p>
                <div className="project-detail__embed-actions">
                  <button
                    type="button"
                    className="project-detail__demo-btn"
                    onClick={toggleEmbed}
                  >
                    {showEmbed ? t.projects.embedCollapse : t.projects.embedOpen}
                  </button>
                  {project.repoUrl && (
                    <a
                      className="project-detail__demo-btn project-detail__demo-btn--link"
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t.projects.embedGithub}
                    </a>
                  )}
                </div>
                {showEmbed && (
                  <>
                    <p className="project-detail__embed-hint">{t.projects.embedHint}</p>
                    <ProjectEmbed
                      src={project.embedUrl}
                      aspect={project.embedAspect ?? 16 / 10}
                      title={project.title}
                      labels={{
                        full: t.projects.embedFull,
                        exitFull: t.projects.embedExitFull,
                        newTab: t.projects.embedNewTab,
                        loading: t.projects.embedLoading,
                        error: t.projects.embedError,
                        errorLink: t.projects.embedErrorLink,
                        retry: t.projects.embedRetry,
                      }}
                    />
                  </>
                )}
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
