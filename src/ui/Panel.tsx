/**
 * Glass content panel — used by content pages as the surface that flies in.
 *
 * V2：加宽到 min(1240px, 92vw)、顶部霓虹滚动进度条、
 * HOP（星球间直跳）期间离场淡出，避免内容从 A 硬切成 B。
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import './panel.css';
import GlitchLabel from './GlitchLabel';
import { useStore } from '@/state/useStore';

interface Props {
  children: ReactNode;
  title?: string;
  sub?: string;
  onReturn?: () => void;
  returnLabel?: string;
}

export default function Panel({ children, title, sub, onReturn, returnLabel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  // 星球间直跳途中，旧页面先淡出；落地后新页面走 panelFadeIn
  const hopping = useStore((s) => s.hoppingFrom !== null);
  const flight = useStore((s) => s.flight);
  const leaving = hopping || flight === 'FLYING_OUT';

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 4 ? Math.min(1, el.scrollTop / max) : 0);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [children]);

  return (
    <div className={`panel-shell${leaving ? ' panel-shell--leaving' : ''}`}>
      <div className="panel">
        <div className="panel__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="panel__scroll" ref={scrollRef}>
          <header className="panel__header">
            <div className="panel__titles">
              {title && (
                <h1 className="panel__title">
                  <GlitchLabel text={title}>{title}</GlitchLabel>
                </h1>
              )}
              {sub && <p className="panel__sub">{sub}</p>}
            </div>
            {onReturn && (
              <button type="button" className="panel__return" onClick={onReturn}>
                ← {returnLabel ?? 'Back'}
              </button>
            )}
          </header>
          <div className="panel__body">{children}</div>
        </div>
      </div>
    </div>
  );
}
