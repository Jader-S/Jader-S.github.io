import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Panel from '@/ui/Panel';
import Reveal from '@/ui/Reveal';
import CategoryFilter, { type CatNode } from '@/ui/CategoryFilter';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import './content.css';

const ACCENTS = ['#22d3ee', '#a855f7', '#f59e0b'];

export default function ProjectsPage() {
  const t = useT();
  const navigate = useNavigate();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);

  useEffect(() => {
    setActive('projects');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
  }, [setActive, setFlight]);

  // V3/3A：URL 统一交给 FlightRouterSync，页面不再双写导航。
  const onReturn = () => {
    useStore.getState().dispatch({ type: 'RETURN' });
  };

  // 分类树：全部 / 公司项目 / 个人项目（桌面 chips + 手机多级下钻共用）
  const [filter, setFilter] = useState<string>('all');
  const tree = useMemo<CatNode[]>(() => {
    const g = t.projects.groups;
    const leaf = (groupId: string): CatNode[] =>
      t.projects.list
        .filter((p) => p.group === groupId)
        .map((p) => ({ key: p.id, label: p.title }));
    return [
      { key: 'all', label: g.all },
      { key: 'company', label: g.company, children: leaf('company') },
      { key: 'personal', label: g.personal, children: leaf('personal') },
    ];
  }, [t.projects]);

  const list = useMemo(
    () => (filter === 'all' ? t.projects.list : t.projects.list.filter((p) => p.group === filter)),
    [filter, t.projects.list],
  );

  const onPick = (node: CatNode) => {
    if (node.key === 'all') {
      setFilter('all');
    } else if (node.children && node.children.length > 0) {
      // 桌面点击「公司/个人」分支 → 筛选
      setFilter(node.key);
    } else {
      // 移动端点击具体项目 → 跳转详情
      navigate(`/projects/${node.key}`);
    }
  };

  return (
    <Panel
      title={t.projects.heading}
      sub={t.projects.sub}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      <CategoryFilter tree={tree} activeKey={filter} onPick={onPick} triggerLabel={t.projects.groups.all} />

      {list.length === 0 ? (
        <p className="project-list__empty">{t.projects.groupEmpty}</p>
      ) : (
        <div className="project-list">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              {/* V3/4A：卡片 Link 化，兑现「每个都能点进去看细节」的文案与 hover 反馈 */}
              <Link
                to={`/projects/${p.id}`}
                className="project-card"
                style={{ '--accent': ACCENTS[i % ACCENTS.length] } as CSSProperties}
                aria-label={`${p.title} — ${t.projects.viewDetail}`}
              >
                <span className="project-card__index">PROJECT / {String(i + 1).padStart(2, '0')}</span>
                <div className="project-card__main">
                  <h3>{p.title}</h3>
                  <p className="project-card__role">{p.role}</p>
                </div>
                <span className="project-card__tag">{p.tag}</span>
                <p className="project-card__metric">{p.metric}</p>
                <span className="project-card__more" aria-hidden="true">
                  {t.projects.viewDetail} →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Panel>
  );
}
