/**
 * 2D fallback shown when WebGL2 is unavailable or Canvas crashes.
 * UI spec §7 — same routes, just no 3D.
 */
import { Link } from 'react-router-dom';
import { PLANETS } from '@/config/site';
import { useT } from '@/i18n';

export default function FallbackRoute() {
  const t = useT();
  return (
    <main className="fallback">
      <h1 className="fallback__title">{t.fallback.title}</h1>
      <p className="fallback__hint">{t.fallback.body}</p>
      <div className="fallback__list">
        {PLANETS.filter((p) => p.id !== 'home').map((p) => (
          <Link key={p.id} className="fallback__card" to={p.route}>
            <span className="fallback__card-name">{p.name}</span>
            <span className="fallback__card-label">{p.label.zh}</span>
            <span className="fallback__card-desc">{p.description.zh}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}