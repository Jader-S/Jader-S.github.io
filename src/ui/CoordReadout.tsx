/**
 * Coordinates readout — pseudo-random star-chart style numbers that update
 * slightly with camera state. Pure decoration; nothing functional depends on them.
 */
import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { useStore } from '@/state/useStore';

function jitter(seed: number, n: number) {
  return ((Math.sin(seed) * 10000 + n) % 1 + 1) % 1;
}

export default function CoordReadout() {
  const t = useT();
  const [tick, setTick] = useState(0);
  const flight = useStore((s) => s.flight);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 600);
    return () => clearInterval(id);
  }, []);

  const seed = tick + (flight === 'FLYING_IN' ? 17 : 0);
  const x = (jitter(seed * 1.3, 0.314) * 9999).toFixed(2).padStart(7, '0');
  const y = (jitter(seed * 2.7, 0.916) * 9999).toFixed(2).padStart(7, '0');
  const z = (jitter(seed * 3.1, 0.481) * 9999).toFixed(2).padStart(7, '0');

  return (
    <div className="coord-readout" aria-hidden="true">
      <span className="coord-readout__label">{t.hud.coords}</span>
      <span className="coord-readout__axis">
        <span className="coord-readout__axis-name">X</span>
        <span>{x}</span>
      </span>
      <span className="coord-readout__axis">
        <span className="coord-readout__axis-name">Y</span>
        <span>{y}</span>
      </span>
      <span className="coord-readout__axis">
        <span className="coord-readout__axis-name">Z</span>
        <span>{z}</span>
      </span>
    </div>
  );
}