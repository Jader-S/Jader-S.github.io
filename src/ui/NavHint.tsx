/**
 * NavHint — 一次性导航引导。
 * 仅首页 + IDLE + 未看过时显示；任意一次飞行开始即写入 prefs.navHintSeen，
 * 之后永久不再出现（与 introSeen 同一套持久化机制）。
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';

export default function NavHint() {
  const t = useT();
  const { pathname } = useLocation();
  const flight = useStore((s) => s.flight);
  const navHintSeen = useStore((s) => s.prefs.navHintSeen);
  const introSeen = useStore((s) => s.prefs.introSeen);
  const visited = useStore((s) => s.prefs.visited);
  const markNavHintSeen = useStore((s) => s.markNavHintSeen);
  const webglBroken = useStore((s) => s.webglBroken);

  // 只要开始飞行或已有访问记录，就认为引导已传达
  useEffect(() => {
    if (flight !== 'IDLE' || visited.length > 0) markNavHintSeen();
  }, [flight, visited.length, markNavHintSeen]);

  const visible =
    pathname === '/' &&
    flight === 'IDLE' &&
    !navHintSeen &&
    introSeen &&
    !webglBroken &&
    visited.length === 0;

  if (!visible) return null;

  return (
    <div className="nav-hint" role="status">
      <span className="nav-hint__dot" aria-hidden="true" />
      <span>{t.home.navHint}</span>
      <span className="nav-hint__en">TAP A PLANET TO EXPLORE</span>
    </div>
  );
}
