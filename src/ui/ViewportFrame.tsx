/**
 * Viewport frame — the "porthole" border with L-shaped corner brackets.
 * Drawn as fixed CSS overlay so it works over both Canvas and content pages.
 */
import './hud.css';

export default function ViewportFrame() {
  return (
    <div className="viewport-frame" aria-hidden="true">
      <span className="viewport-frame__corner viewport-frame__corner--tl" />
      <span className="viewport-frame__corner viewport-frame__corner--tr" />
      <span className="viewport-frame__corner viewport-frame__corner--bl" />
      <span className="viewport-frame__corner viewport-frame__corner--br" />
    </div>
  );
}