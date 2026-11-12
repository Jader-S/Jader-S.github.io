/**
 * Corner gauge — top-left small instrument showing quality tier + a fake
 * FPS readout. Functional: clicking cycles quality.
 */
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import { QUALITY_TIERS } from '@/config/site';
import { useEffect, useState } from 'react';

export default function CornerGauge() {
  const t = useT();
  const quality = useStore((s) => s.prefs.quality);
  const setQuality = useStore((s) => s.setQuality);
  const lang = useStore((s) => s.prefs.language);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let last = performance.now();
    let raf = 0;
    let frames = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.min(120, frames * (1000 / (now - last))));
        last = now;
        frames = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cycle = () => {
    const idx = QUALITY_TIERS.indexOf(quality);
    const next = QUALITY_TIERS[(idx + 1) % QUALITY_TIERS.length];
    setQuality(next);
  };

  const labelKey = quality; // qualityLevels['ultra'] | 'high' | ...
  const label = t.nav.qualityLevels[labelKey as keyof typeof t.nav.qualityLevels];

  return (
    <button
      type="button"
      className="corner-gauge"
      onClick={cycle}
      aria-label={`${t.nav.quality}: ${label}`}
      title={`${t.nav.quality}: ${label}`}
    >
      <span className="corner-gauge__row">
        <span className="corner-gauge__dot" data-quality={quality} />
        <span className="corner-gauge__q-label">{label}</span>
      </span>
      <span className="corner-gauge__row corner-gauge__row--mono">
        <span>{t.hud.fps}</span>
        <span>{Math.round(fps)}</span>
      </span>
      <span className="corner-gauge__row corner-gauge__row--lang">
        {lang.toUpperCase()}
      </span>
    </button>
  );
}