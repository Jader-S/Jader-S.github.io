import { Suspense, startTransition, useEffect, useMemo, useRef, useState } from "react";
import Panel from "@astra/ui/Panel";
import Reveal from "@astra/ui/Reveal";
import CategoryFilter, { type CatNode } from "@astra/ui/CategoryFilter";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import {
  demoRegistry,
  preloadDemo,
  type DemoCategory,
} from "@/styles/shared/demos/registry";
import ErrorBoundary from "@astra/ui/ErrorBoundary";
// 共享 demo 的颜色变量桥：[data-demo-theme] 作用域。此前只有作品弹框路径
// (DemoPreview) 引入并挂载该属性，实验室路径缺失 → --demo-* 全部 undefined，
// 会议编排的已排会议背景色等直接消失。
import "@/styles/shared/demos/demo-tokens.css";
import "./content.css";

const CAT_ORDER: DemoCategory[] = [
  "perf",
  "ai",
  "shader",
  "schedule",
  "power",
  "factory",
];

/** 轻量加载占位：透出星空，不用整块黑屏当 fallback。 */
function DemoLoading({ label }: { label: string }) {
  return (
    <div className="demo-host__loading" role="status">
      <span className="demo-host__spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export default function DemosPage() {
  const t = useT();
  const setFlight = useStore((s) => s.setFlight);
  const setActive = useStore((s) => s.setActivePlanet);
  const [activeSlug, setActiveSlug] = useState<string>(demoRegistry[0]?.slug ?? "");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    setActive("demos");
    if (useStore.getState().flight !== "FLYING_IN") {
      setFlight("VIEWING");
    }
  }, [setActive, setFlight]);

  // 进入实验室就预热当前 demo 的 lazy chunk：首次预览不再等到点击才下载
  // echarts / three 这类大依赖。
  useEffect(() => {
    preloadDemo(activeSlug);
  }, [activeSlug]);

  // V3/3A：URL 统一交给 FlightRouterSync，页面不再双写导航。
  const onReturn = () => {
    useStore.getState().dispatch({ type: "RETURN" });
  };

  // 分类树：全部 / 各 category（桌面 chips 筛选 + 手机多级下钻）
  const tree = useMemo<CatNode[]>(() => {
    const cats = t.demos.cats;
    const leaf = (c: DemoCategory): CatNode[] =>
      demoRegistry
        .filter((d) => d.category === c)
        .map((d) => ({ key: d.slug, label: d.title }));
    return [
      { key: "all", label: cats.all },
      ...CAT_ORDER.filter((c) => demoRegistry.some((d) => d.category === c)).map(
        (c) => ({
          key: c,
          label: cats[c],
          children: leaf(c),
        })
      ),
    ];
  }, [t.demos.cats]);

  const visible = useMemo(
    () =>
      cat === "all" ? demoRegistry : demoRegistry.filter((d) => d.category === cat),
    [cat]
  );

  // transition 中触发 lazy suspend 时 React 保留旧 demo，而不是把容器清空
  // 露出一帧黑屏；新 chunk 就绪后才替换。
  const pickDemo = (slug: string) => {
    if (slug === activeSlug) return;
    startTransition(() => setActiveSlug(slug));
  };

  // hover 预取做防抖：鼠标快速扫过列表时不该把所有大 chunk 全拉下来。
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverPreload = (slug: string) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => preloadDemo(slug), 180);
  };
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const onPick = (node: CatNode) => {
    if (node.key === "all") {
      setCat("all");
    } else if (node.children && node.children.length > 0) {
      setCat(node.key); // 桌面点击分支 → 筛选
    } else {
      pickDemo(node.key); // 移动端点击具体 demo → 跳转
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
      <CategoryFilter
        tree={tree}
        activeKey={cat}
        onPick={onPick}
        triggerLabel={t.demos.cats.all}
      />

      <Reveal>
        <div className="demo-list">
          {visible.map((d) => (
            <button
              key={d.slug}
              type="button"
              className="demo-list__item"
              data-active={d.slug === activeSlug}
              onMouseEnter={() => hoverPreload(d.slug)}
              onClick={() => pickDemo(d.slug)}
            >
              <span className="demo-list__name">{d.title}</span>
              <span className="demo-list__tag">{d.category}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {active && (
        <Reveal delay={100}>
          {active.wide && <p className="demo-host__hint">← 左右滑动查看完整画布 →</p>}
          {/* scroll-x：宽画布 demo 在窄屏保留桌面宽度后，由这里提供可拖动的横向滚动 */}
          <div className="demo-host scroll-x" data-demo-theme>
            <ErrorBoundary scope="demo" key={activeSlug}>
              <Suspense fallback={<DemoLoading label={t.loading} />}>
                <active.Component />
              </Suspense>
            </ErrorBoundary>
          </div>
        </Reveal>
      )}
    </Panel>
  );
}
