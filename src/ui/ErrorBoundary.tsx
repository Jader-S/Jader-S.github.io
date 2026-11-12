/**
 * Three-scope ErrorBoundary (ADR-3):
 *  - scope="canvas"  : outermost, falls back to 2D viewport.
 *  - scope="demo"    : per lazy demo, shows fallback card.
 *  - scope="sandpack": code sandbox only.
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useStore } from '@/state/useStore';
import { useT } from '@/i18n';

interface Props {
  scope: 'canvas' | 'demo' | 'sandpack';
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // surface to console in dev; log to store later via service.
    // eslint-disable-next-line no-console
    console.error(`[ErrorBoundary:${this.props.scope}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.scope === 'canvas') {
        // mark webgl broken globally
        useStore.getState().setWebglBroken(true);
        return null;
      }
      if (this.props.scope === 'demo') {
        return <DemoError />;
      }
      if (this.props.scope === 'sandpack') {
        return <SandboxError />;
      }
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

function DemoError() {
  const t = useT();
  return (
    <div className="error-notice" role="alert">
      {t.errors.demo}
    </div>
  );
}

function SandboxError() {
  const t = useT();
  return (
    <div className="error-notice" role="alert">
      {t.errors.sandpack}
    </div>
  );
}