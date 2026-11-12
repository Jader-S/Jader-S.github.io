/**
 * ProjectEmbed — 在博客内嵌「外部完整项目」（同源静态产物 / 在线预览）。
 *
 * 评审结论 #2 的落地：作品页 kind='github' 的项目可在此内嵌展示。
 * - src 为相对路径时按 Vite BASE_URL 解析，站点部署到子路径也不会 404。
 * - 全屏走 Fullscreen API（DOM 不移动，iframe 不重载、IndexedDB 状态不丢）；
 *   浏览器拒绝时降级为 fixed 覆盖层。
 * - 带 loading / 超时兜底 / 失败重试 / 新窗口打开（完整本机能力）。
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import './ProjectEmbed.css';

/** 外部项目若未做响应式，窄屏下按桌面宽度渲染再等比缩放，避免左右分栏被压垮。 */
const MOBILE_BREAKPOINT = 760;
const DESKTOP_WIDTH = 1100;

export interface EmbedLabels {
  full: string;
  exitFull: string;
  newTab: string;
  loading: string;
  error: string;
  errorLink: string;
  retry: string;
}

const DEFAULT_LABELS: EmbedLabels = {
  full: '⤢ 全屏',
  exitFull: '退出全屏 (Esc)',
  newTab: '新窗口打开 ↗',
  loading: '正在加载外部项目…',
  error: '该外部项目无法在此内嵌展示。',
  errorLink: '点击在新窗口打开 ↗',
  retry: '重试',
};

/** 外站绝对地址原样返回；站内相对地址按 BASE_URL 解析成同源绝对 URL。 */
function resolveSrc(src: string): string {
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src;
  const base = new URL(import.meta.env.BASE_URL || '/', window.location.origin);
  return new URL(src.replace(/^\/+/, ''), base).href;
}

export default function ProjectEmbed({
  src,
  aspect = 16 / 10,
  labels,
  title = '外部项目预览',
}: {
  src: string;
  aspect?: number;
  labels?: Partial<EmbedLabels>;
  title?: string;
}) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [full, setFull] = useState(false);
  const [fallbackFull, setFallbackFull] = useState(false);
  const [nonce, setNonce] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState({ w: 0, h: 0 });
  const url = useMemo(() => resolveSrc(src), [src]);
  const L = { ...DEFAULT_LABELS, ...labels };
  const isFull = full || fallbackFull;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setHost({ w: r.width, h: r.height });
    });
    ro.observe(el);
    setHost({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const scale = host.w > 0 && host.w < MOBILE_BREAKPOINT ? host.w / DESKTOP_WIDTH : 1;
  const viewportStyle: CSSProperties =
    scale < 1
      ? { width: DESKTOP_WIDTH, height: host.h / scale, transform: `scale(${scale})` }
      : { width: '100%', height: '100%' };

  // 同源 404 的 iframe 仍会触发 onLoad，这里用超时 + onError 做双保险。
  useEffect(() => {
    setStatus('loading');
    const timer = window.setTimeout(
      () => setStatus((s) => (s === 'loading' ? 'error' : s)),
      15000,
    );
    return () => window.clearTimeout(timer);
  }, [url, nonce]);

  useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === rootRef.current;
      setFull(active);
      if (!active) setFallbackFull(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFull = () => {
    if (isFull) {
      if (document.fullscreenElement) void document.exitFullscreen();
      setFallbackFull(false);
      return;
    }
    const pending = rootRef.current?.requestFullscreen?.();
    if (pending && typeof pending.catch === 'function') {
      pending.catch(() => setFallbackFull(true));
    } else if (!pending) {
      setFallbackFull(true);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`proj-embed${isFull ? ' proj-embed--full' : ''}`}
      style={{ aspectRatio: String(aspect) }}
    >
      <div className="proj-embed__bar">
        {scale < 1 && <span className="proj-embed__scale-note">桌面视图 · 已缩放</span>}
        <button type="button" onClick={toggleFull}>
          {isFull ? L.exitFull : L.full}
        </button>
        <a href={url} target="_blank" rel="noreferrer">
          {L.newTab}
        </a>
      </div>

      {status !== 'error' && (
        <div className="proj-embed__viewport" style={viewportStyle}>
          <iframe
            key={nonce}
            className="proj-embed__frame"
            src={url}
            title={title}
            loading="eager"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
            allow="clipboard-read; clipboard-write; fullscreen"
            onLoad={() => setStatus('ok')}
            onError={() => setStatus('error')}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className="proj-embed__overlay">
          <span className="proj-embed__spinner" />
          {L.loading}
        </div>
      )}

      {status === 'error' && (
        <div className="proj-embed__overlay proj-embed__overlay--error">
          <p>{L.error}</p>
          <a href={url} target="_blank" rel="noreferrer">
            {L.errorLink}
          </a>
          <button type="button" onClick={() => setNonce((n) => n + 1)}>
            {L.retry}
          </button>
        </div>
      )}
    </div>
  );
}
