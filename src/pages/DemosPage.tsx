import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Panel from '@/ui/Panel';
import Reveal from '@/ui/Reveal';
import CategoryFilter, { type CatNode } from '@/ui/CategoryFilter';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import { demoRegistry, type DemoCategory } from '@/demos/registry';
import ErrorBoundary from '@/ui/ErrorBoundary';
import './content.css';

const CAT_ORDER: DemoCategory[] = ['perf', 'ai', 'shader', 'schedule', 'power', 'factory'];

export default function DemosPage() {
  const t = useT();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);
  const [searchParams] = useSearchParams();
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    const q = searchParams.get('demo');
    return q && demoRegistry.some((d) => d.slug === q) ? q : demoRegistry[0]?.slug ?? '';
  });
  const [cat, setCat] = useState<string>('all');

  useEffect(() => {
    setActive('demos');
    if (useStore.getState().flight !== 'FLYING_IN') {
      setFlight('VIEWING');
    }
  }, [setActive, setFlight]);

  // V3/3A：URL 统一交给 FlightRouterSync，页面不再双写导航。
  const onReturn = () => {
    useStore.getState().dispatch({ type: 'RETURN' });
  };

  // 分类树：全部 / 各 category（桌面 chips 筛选 + 手机多级下钻）
  const tree = useMemo<CatNode[]>(() => {
    const cats = t.demos.cats;
    const leaf = (c: DemoCategory): CatNode[] =>
      demoRegistry.filter((d) => d.category === c).map((d) => ({ key: d.slug, label: d.title }));
    return [
      { key: 'all', label: cats.all },
      ...CAT_ORDER.filter((c) => demoRegistry.some((d) => d.category === c)).map((c) => ({
        key: c,
        label: cats[c],
        children: leaf(c),
      })),
    ];
  }, [t.demos.cats]);

  const visible = useMemo(
    () => (cat === 'all' ? demoRegistry : demoRegistry.filter((d) => d.category === cat)),
    [cat],
  );

  const onPick = (node: CatNode) => {
    if (node.key === 'all') {
      setCat('all');
    } else if (node.children && node.children.length > 0) {
      setCat(node.key); // 桌面点击分支 → 筛选
    } else {
      setActiveSlug(node.key); // 移动端点击具体 demo → 跳转
    }
  };

  const active = demoRegistry.find((d) => d.slug === activeSlug);

  return (
    <Panel
      title={t.demos.heading}
      sub={t.demos.sub}
      onReturn={onReturn}
      returnLabel={t.return}
    >
      <CategoryFilter tree={tree} activeKey={cat} onPick={onPick} triggerLabel={t.demos.cats.all} />

      <Reveal>
        <div className="demo-list">
          {visible.map((d) => (
            <button
              key={d.slug}
              type="button"
              className="demo-list__item"
              data-active={d.slug === activeSlug}
              onClick={() => setActiveSlug(d.slug)}
            >
              <span className="demo-list__name">{d.title}</span>
              <span className="demo-list__tag">{d.category}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {active && (
        <Reveal delay={100}>
          <div className="demo-host">
            <ErrorBoundary scope="demo">
              <active.Component />
            </ErrorBoundary>
          </div>
        </Reveal>
      )}
    </Panel>
  );
}
