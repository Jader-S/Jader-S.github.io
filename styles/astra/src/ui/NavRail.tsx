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
import GlitchLabel from "./GlitchLabel";

export default function NavRail() {
  const t = useT();
  const lang = useStore((s) => s.prefs.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const activeId = useStore((s) => s.activePlanet);

  // 桌面星系全景（activePlanet === null）隐藏导航栏——星球上直接有 chip 可点；
  // 移动端任何视图都保留为底部 tab；桌面详情视图（已飞向某星球）保留以便切换/返回。
  const isGalaxy = useStore((s) => s.activePlanet === null);
  if (isGalaxy && !detectMobile()) return null;

  const planets = PLANETS.filter((p) => p.id !== "home");

  const handlePlanetClick = (planetId: PlanetId) => {
    // blog 迁出 ASTRA：点击离开太空主题，跳到默认主题页（日志在对应主题内本地展示）
    if (planetId === "blog") {
      window.location.href = "/blueprint";
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
            <span className="nav-rail__label">{p.label[lang as "zh" | "en"]}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="nav-rail__lang"
        onClick={() => setLanguage(lang === "zh" ? "en" : "zh")}
        aria-label={t.nav.language}
      >
        {lang === "zh" ? "EN" : "ZH"}
      </button>
    </nav>
  );
}
