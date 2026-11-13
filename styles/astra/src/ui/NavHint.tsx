/**
 * NavHint — 一次性导航引导。
 * 仅首页 + IDLE + 未看过时显示；任意一次飞行开始即写入 prefs.navHintSeen，
 * 之后永久不再出现（与 introSeen 同一套持久化机制）。
 */
import { useEffect } from "react";
import { useStore } from "@astra/state/useStore";
import { useT } from "@astra/i18n";

export default function NavHint() {
  const t = useT();
  const flight = useStore((s) => s.flight);
  const activePlanet = useStore((s) => s.activePlanet);
  const navHintSeen = useStore((s) => s.prefs.navHintSeen);
  const introSeen = useStore((s) => s.prefs.introSeen);
  const visited = useStore((s) => s.prefs.visited);
  const markNavHintSeen = useStore((s) => s.markNavHintSeen);
  const webglBroken = useStore((s) => s.webglBroken);

  // 只要开始飞行或已有访问记录，就认为引导已传达
  useEffect(() => {
    if (flight !== "IDLE" || visited.length > 0) markNavHintSeen();
  }, [flight, visited.length, markNavHintSeen]);

  // 全景（母星）即 home，在状态机里用 activePlanet === null 表示（'home' 是 PLANETS 里
  // 一颗真实星球 ASTRA PRIME，不要混淆）。路由提示只在该全景态显示。
  const visible =
    activePlanet === null &&
    flight === "IDLE" &&
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
