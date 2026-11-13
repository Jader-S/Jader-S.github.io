/**
 * 2D fallback shown when WebGL2 is unavailable or Canvas crashes.
 * UI spec §7 — same routes, just no 3D.
 */
import { requestFlyTo } from "@astra/state/useStore";
import { PLANETS } from "@astra/config/site";
import { useT } from "@astra/i18n";

export default function FallbackRoute() {
  const t = useT();
  return (
    <main className="fallback">
      <h1 className="fallback__title">{t.fallback.title}</h1>
      <p className="fallback__hint">{t.fallback.body}</p>
      <div className="fallback__list">
        {PLANETS.filter((p) => p.id !== "home").map((p) => (
          <button
            key={p.id}
            type="button"
            className="fallback__card"
            onClick={() => {
              // blog 迁出 ASTRA：点击离开太空主题，跳到默认主题页
              if (p.id === "blog") {
                window.location.href = "/blueprint";
                return;
              }
              requestFlyTo(p.id);
            }}
          >
            <span className="fallback__card-name">{p.name}</span>
            <span className="fallback__card-label">{p.label.zh}</span>
            <span className="fallback__card-desc">{p.description.zh}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
