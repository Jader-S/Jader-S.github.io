/**
 * Planet nav rail — list of planet chips with active/visited state.
 * Desktop: hidden on home (chips are right on the planets).
 * Mobile: always visible as a bottom tab bar — an equivalent entry point
 * when 3D planets are hard to tap on a narrow screen.
 */
import { Link, useLocation } from 'react-router-dom';
import { useStore, requestFlyTo, type PlanetId } from '@/state/useStore';
import { PLANETS } from '@/config/site';
import { useT } from '@/i18n';
import { detectMobile } from '@/utils/device';
import GlitchLabel from './GlitchLabel';

export default function NavRail() {
  const t = useT();
  const lang = useStore((s) => s.prefs.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const activeId = useStore((s) => s.activePlanet);
  const location = useLocation();

  // 桌面首页隐藏（星球上直接有 chip）；移动端保留为底部 tab
  const isHome = location.pathname === '/';
  if (isHome && !detectMobile()) return null;

  const planets = PLANETS.filter((p) => p.id !== 'home');

  const handlePlanetClick = (planetId: PlanetId) => {
    // 统一走 requestFlyTo：IDLE 直接俯冲；VIEWING（已在某星球）先回退全景再飞向目标
    requestFlyTo(planetId);
  };

  return (
    <nav className="nav-rail" aria-label="Planets">
      <Link to="/" className="nav-rail__brand" aria-label={t.brand}>
        <GlitchLabel text={t.brand}>{t.brand}</GlitchLabel>
      </Link>
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
            <span className="nav-rail__label">{p.label[lang as 'zh' | 'en']}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="nav-rail__lang"
        onClick={() => setLanguage(lang === 'zh' ? 'en' : 'zh')}
        aria-label={t.nav.language}
      >
        {lang === 'zh' ? 'EN' : 'ZH'}
      </button>
    </nav>
  );
}