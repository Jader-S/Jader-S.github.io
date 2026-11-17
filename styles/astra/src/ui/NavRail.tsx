/**
 * Planet nav rail — list of planet chips with active/visited state.
 * Desktop: hidden on home (chips are right on the planets).
 * Mobile: always visible as a bottom tab bar — an equivalent entry point
 * when 3D planets are hard to tap on a narrow screen.
 */
import { useStore, requestFlyTo, type PlanetId } from "@astra/state/useStore";
import { PLANETS } from "@astra/config/site";
import { useT } from "@astra/i18n";
import { detectMobile } from "@astra/utils/device";
import { useI18n } from "@/components/I18nProvider";
import { openBlogIndex } from "@/lib/blog-modal";
import GlitchLabel from "./GlitchLabel";

export default function NavRail() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  // astra:prefs 里的旧 language 字段只作镜像写入，不再参与渲染（见 astra i18n/index.ts）。
  const setLanguage = useStore((s) => s.setLanguage);
  const activeId = useStore((s) => s.activePlanet);

  // 桌面星系全景（activePlanet === null）隐藏导航栏——星球上直接有 chip 可点；
  // 移动端任何视图都保留为底部 tab；桌面详情视图（已飞向某星球）保留以便切换/返回。
  const isGalaxy = useStore((s) => s.activePlanet === null);
  if (isGalaxy && !detectMobile()) return null;

  const planets = PLANETS.filter((p) => p.id !== "home");

  const handlePlanetClick = (planetId: PlanetId) => {
    // blog 内容走全局弹框，但仍要飞到 LOGOS 星球：只开弹框不飞行会让
    // 导航看起来「点了没反应」，其他星球都有俯冲动画，交互不一致。
    if (planetId === "blog") {
      requestFlyTo("blog");
      openBlogIndex();
      return;
    }
    // 统一走 requestFlyTo：IDLE 直接俯冲；VIEWING（已在某星球）先回退全景再飞向目标
    requestFlyTo(planetId);
  };

  return (
    <nav className="nav-rail" aria-label="Planets">
      <button
        type="button"
        className="nav-rail__brand"
        aria-label={t.brand}
        onClick={() => requestFlyTo("home")}
      >
        <GlitchLabel text={t.brand}>{t.brand}</GlitchLabel>
      </button>
      <div
        className="nav-rail__list"
        style={{ gridTemplateColumns: `repeat(${planets.length}, minmax(0, 1fr))` }}
      >
        {planets.map((p) => (
          <button
            key={p.id}
            type="button"
            className="nav-rail__item"
            data-active={activeId === p.id}
            onClick={() => handlePlanetClick(p.id)}
          >
            <span className="nav-rail__dot" style={{ background: p.color }} />
            <span className="nav-rail__name">{p.name}</span>
            <span className="nav-rail__label">{p.label[locale]}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="nav-rail__lang"
        onClick={() => {
          const next = locale === "zh" ? "en" : "zh";
          setLocale(next);
          setLanguage(next);
        }}
        aria-label={t.nav.language}
      >
        {locale === "zh" ? "EN" : "ZH"}
      </button>
    </nav>
  );
}
