/**
 * Reveal — 内容块滚动渐显。
 * 基于 IntersectionObserver（root = 最近的滚动容器 .panel__scroll），
 * 无依赖、尊重 prefers-reduced-motion，支持 stagger delay。
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { detectReducedMotion } from '@/utils/device';

interface Props {
  children: ReactNode;
  /** stagger 延迟（ms） */
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (detectReducedMotion()) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    // 面板内部滚动：以 .panel__scroll 为 root，viewport 之外也能正确触发
    const root = el.closest('.panel__scroll') as HTMLElement | null;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { root, threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${shown ? ' reveal--in' : ''}${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
