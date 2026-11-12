/**
 * Intro sequence — sci-fi boot screen. System startup log + glitch brand +
 * scanning line + HUD corners, then a countdown into the experience.
 *
 * Lifecycle:
 *   boot -> countdown -> lift-off -> fade out -> IDLE
 *   click anywhere = skip
 *   persisted: `prefs.introSeen`
 */
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';
import './intro.css';

type Phase = 'boot' | 'countdown' | 'liftoff' | 'fade';

interface Props {
  onDone: () => void;
}

const BOOT_LOG = [
  'SYS · 导航单元 自检通过',
  'NAV · 星图坐标校准完成',
  'LIFE · 生命维持 NOMINAL',
  'VISOR · 头盔视窗在线',
  'ASTRA OS · 启动序列就绪',
];

export default function IntroOverlay({ onDone }: Props) {
  const t = useT();
  const markIntroSeen = useStore((s) => s.markIntroSeen);
  const [phase, setPhase] = useState<Phase>('boot');
  const [count, setCount] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const a = window.setTimeout(() => setPhase('countdown'), 800);
    timers.current.push(a);
    t.intro.countdown.forEach((_, i) => {
      const tt = window.setTimeout(() => {
        setCount(i + 1);
        if (i === t.intro.countdown.length - 1) {
          setPhase('liftoff');
          const flyTimer = window.setTimeout(() => {
            setPhase('fade');
            const doneTimer = window.setTimeout(() => {
              markIntroSeen();
              onDone();
            }, 900);
            timers.current.push(doneTimer);
          }, 1400);
          timers.current.push(flyTimer);
        }
      }, 800 + i * 800);
      timers.current.push(tt);
    });
    return () => {
      timers.current.forEach((id) => clearTimeout(id));
    };
  }, [markIntroSeen, onDone, t]);

  const handleSkip = () => {
    timers.current.forEach((id) => clearTimeout(id));
    markIntroSeen();
    onDone();
  };

  const isFading = phase === 'fade';

  return (
    <div className="intro" data-phase={phase} aria-hidden={isFading}>
      <div className="intro__grid" />
      <div className="intro__scan" />
      <div className="intro__noise" />

      <span className="intro__hud intro__hud--tl" />
      <span className="intro__hud intro__hud--tr" />
      <span className="intro__hud intro__hud--bl" />
      <span className="intro__hud intro__hud--br" />

      <div className="intro__center">
        <div className="intro__brand" data-text={t.intro.title}>
          {t.intro.title}
        </div>
        <div className="intro__sub">{t.intro.subtitle}</div>
        <div className="intro__career">{t.intro.careerBlurb}</div>
        <div className="intro__log">
          {BOOT_LOG.map((line, i) => (
            <div
              key={i}
              className="intro__log-line"
              style={{ animationDelay: `${0.9 + i * 0.38}s` }}
            >
              <span className="intro__log-caret">›</span> {line}
            </div>
          ))}
        </div>
      </div>

      <div className="intro__countdown">
        {phase === 'boot' && <span className="intro__boot">{t.intro.boot}</span>}
        {phase === 'countdown' && (
          <span key={count} className="intro__num">
            {t.intro.countdown[count]}
          </span>
        )}
        {phase === 'liftoff' && (
          <span className="intro__launch">{t.intro.clickToLaunch}</span>
        )}
      </div>

      <button
        type="button"
        className="intro__skip"
        onClick={handleSkip}
        aria-label={t.hud.skipIntroAria}
      >
        {t.hud.skipIntro}
      </button>
    </div>
  );
}
