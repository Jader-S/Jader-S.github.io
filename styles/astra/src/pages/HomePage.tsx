/**
 * Home (母星) page. Sits underneath the 3D scene; doesn't render a panel —
 * the scene IS the home page. We draw a low-third hero (brand wordmark +
 * tagline + status) that makes the first impression, and keep it
 * pointer-events:none so planet clicks pass through to the canvas.
 */
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";
import GlitchLabel from "@astra/ui/GlitchLabel";
// 之前遗漏：未导入导致 .home-hero 无样式、low-third 主标题掉到视口外
import "./home.css";

export default function HomePage() {
  const t = useT();
  const visited = useStore((s) => s.prefs.visited);
  const flight = useStore((s) => s.flight);

  return (
    <div
      className={`home-hero${flight === "IDLE" ? "" : " home-hero--flying"}`}
      aria-hidden="true"
    >
      <div className="home-hero__inner">
        <span className="home-hero__kicker">{t.home.kicker}</span>
        <GlitchLabel as="h1" className="home-hero__brand" text={t.brand} always>
          {t.brand}
        </GlitchLabel>
        <span className="home-hero__tag">{t.intro.subtitle}</span>
        <span className="home-hero__rule" />
        <div className="home-hero__status">
          <span className="home-hero__status-dot" />
          {t.home.visitCount(visited.length)}
        </div>
        <span className="home-hero__hint">{t.home.hint}</span>
      </div>
    </div>
  );
}
