import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Panel from "@astra/ui/Panel";
import Reveal from "@astra/ui/Reveal";
import CategoryFilter, { type CatNode } from "@astra/ui/CategoryFilter";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import "./content.css";

const ACCENTS = ["#22d3ee", "#a855f7", "#f59e0b"];

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

  // 分类树：全部 / 公司项目 / 个人项目（桌面 chips + 手机多级下钻共用）
  const [filter, setFilter] = useState<string>("all");
  const tree = useMemo<CatNode[]>(() => {
    const g = t.projects.groups;
    const leaf = (groupId: string): CatNode[] =>
      t.projects.list
        .filter((p) => p.group === groupId)
        .map((p) => ({ key: p.id, label: p.title }));
    return [
      { key: "all", label: g.all },
      { key: "company", label: g.company, children: leaf("company") },
      { key: "personal", label: g.personal, children: leaf("personal") },
    ];
  }, [t.projects]);

  const list = useMemo(
    () =>
      filter === "all"
        ? t.projects.list
        : t.projects.list.filter((p) => p.group === filter),
    [filter, t.projects.list]
  );

  const onPick = (node: CatNode) => {
    if (node.key === "all") {
      setFilter("all");
    } else if (node.children && node.children.length > 0) {
      // 桌面点击「公司/个人」分支 → 筛选
      setFilter(node.key);
    } else {
      // 移动端点击具体项目 → 进入详情
      onOpenProject?.(node.key);
    }
  };

  return (
    <Panel
      title={t.projects.heading}
      sub={t.projects.sub}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      <CategoryFilter
        tree={tree}
        activeKey={filter}
        onPick={onPick}
        triggerLabel={t.projects.groups.all}
      />

      {list.length === 0 ? (
        <p className="project-list__empty">{t.projects.groupEmpty}</p>
      ) : (
        <div className="project-list">
          {list.map((p, i) => (
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
      )}
    </Panel>
  );
}
