import { useEffect, type CSSProperties } from "react";
import Panel from "@astra/ui/Panel";
import Reveal from "@astra/ui/Reveal";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import "./content.css";

const ACCENTS = ["#22d3ee", "#a855f7", "#f59e0b"];

/**
 * 单一「作品」列表（Phase 7）：去掉原先的「公司项目 / 个人项目」分组筛选，
 * 与其它 4 个主题一致，所有作品平铺展示，点卡片进入详情。
 */
export default function ProjectsPage({
  onOpenProject,
}: {
  onOpenProject?: (id: string) => void;
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

  // V3/3A：URL 统一交给 FlightRouterSync，页面不再双写导航。
  const onReturn = () => {
    useStore.getState().dispatch({ type: "RETURN" });
  };

  return (
    <Panel
      title={t.projects.heading}
      sub={t.projects.sub}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      <div className="project-list">
        {t.projects.list.map((p, i) => (
          <Reveal key={p.id} delay={i * 100}>
            {/* 卡片可点进详情：无 react-router，改用 onOpenProject 局部状态 */}
            <a
              className="project-card"
              href={`#${p.id}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenProject?.(p.id);
              }}
              style={{ "--accent": ACCENTS[i % ACCENTS.length] } as CSSProperties}
              aria-label={`${p.title} — ${t.projects.viewDetail}`}
            >
              <span className="project-card__index">
                PROJECT / {String(i + 1).padStart(2, "0")}
              </span>
              <div className="project-card__main">
                <h3>{p.title}</h3>
                <p className="project-card__role">{p.role}</p>
              </div>
              <span className="project-card__tag">{p.tag}</span>
              <p className="project-card__metric">{p.metric}</p>
              <span className="project-card__more" aria-hidden="true">
                {t.projects.viewDetail} →
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}
