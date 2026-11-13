/**
 * Global HUD overlay — drawn above Canvas + content pages.
 * Holds: Viewport frame, coord readout, scan line, corner gauge,
 * language / quality toggles, planet nav rail, intro controller.
 */
import { useState } from "react";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import { detectMobile } from "@astra/utils/device";
import ViewportFrame from "./ViewportFrame";
import CoordReadout from "./CoordReadout";
import ScanLine from "./ScanLine";
import CornerGauge from "./CornerGauge";
import NavRail from "./NavRail";
import Reticle from "./Reticle";
import IntroOverlay from "@astra/intro/IntroOverlay";
import NavHint from "./NavHint";
import "./hud.css";
import "./helmet.css";

export default function HUDLayer() {
  const t = useT();
  const introSeen = useStore((s) => s.prefs.introSeen);
  const resetIntro = useStore((s) => s.resetIntro);
  const webglBroken = useStore((s) => s.webglBroken);
  const [showIntro, setShowIntro] = useState(false);

  // 全景（母星）即 home，状态机用 activePlanet === null 表示（'home' 是 PLANETS 里
  // 一颗真实星球 ASTRA PRIME，不要混用）。注意与 NavRail 的 isGalaxy 判定保持一致。
  const isHome = useStore((s) => s.activePlanet === null);
  const showIntroGate = !introSeen && isHome && !webglBroken;
  // 移动端不渲染次要仪表：省掉 rAF / 定时器开销，也不占窄屏空间
  const isMobile = detectMobile();

  return (
    <>
      {showIntroGate && <IntroOverlay onDone={() => setShowIntro(false)} />}
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}

      {isHome && !webglBroken && !isMobile && (
        <>
          <div className="helmet" aria-hidden="true">
            <div className="helmet__visor" />
            <div className="helmet__rim" />
          </div>
          <Reticle />
        </>
      )}
      <ViewportFrame />
      {!isMobile && <ScanLine />}
      {!isMobile && <CoordReadout />}
      {!isMobile && <CornerGauge />}
      <NavRail />
      <NavHint />

      {isHome && !webglBroken && (
        <button
          type="button"
          className="hud-replay"
          onClick={() => {
            resetIntro();
            setShowIntro(true);
          }}
        >
          {t.intro.replay}
        </button>
      )}
    </>
  );
}
