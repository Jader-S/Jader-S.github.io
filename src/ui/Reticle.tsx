/**
 * Center reticle — the single most readable "first-person HUD" signal.
 * A rotating tick ring + center dot + SCAN/LOCK readout. Brightens to LOCK
 * when a planet is selected or the camera is flying, so the viewport feels alive.
 */
import { useStore } from '@/state/useStore';
import './reticle.css';

export default function Reticle() {
  const activeId = useStore((s) => s.activePlanet);
  const flight = useStore((s) => s.flight);
  const locked = !!activeId || (flight !== 'IDLE');

  return (
    <div className={`reticle${locked ? ' reticle--lock' : ''}`} aria-hidden="true">
      <span className="reticle__ring" />
      <span className="reticle__ring reticle__ring--spin" />
      <span className="reticle__tick reticle__tick--t" />
      <span className="reticle__tick reticle__tick--b" />
      <span className="reticle__tick reticle__tick--l" />
      <span className="reticle__tick reticle__tick--r" />
      <span className="reticle__cross reticle__cross--h" />
      <span className="reticle__cross reticle__cross--v" />
      <span className="reticle__dot" />
      <span className="reticle__label">{locked ? 'LOCK' : 'SCAN'}</span>
    </div>
  );
}
