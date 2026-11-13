"use client";

import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { projectModalCopy, type Locale } from "@/data/project-details";
import { getDemo } from "@/styles/shared/demos/registry";
import styles from "@/styles/shared/demo-preview.module.css";
import "@/styles/shared/demos/demo-tokens.css";

/** A demo must never take down the whole modal (or the page behind it). */
class DemoErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[DemoPreview]", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Inline demo preview shared by all five styles.
 * Demos are lazy React components from styles/shared/demos/registry.ts — no
 * iframe, no route change, no new tab. The 3D ones mount their own R3F Canvas
 * inside this host, which is fine outside ASTRA (the astra-only store flag
 * `heavy3DDemoActive` has no consumers there).
 */
export default function DemoPreview({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const copy = projectModalCopy[locale];
  const entry = getDemo(slug);
  const fallback = (
    <p className={styles.error} role="alert">
      {copy.error}
    </p>
  );

  if (!entry) return fallback;
  const Demo = entry.Component;

  return (
    <div className={styles.wrap} data-testid="demo-preview">
      {entry.wide ? <p className={styles.hint}>{copy.wideHint}</p> : null}
      <div
        className={`${styles.host} ${entry.wide ? styles.hostWide : ""}`}
        data-demo-theme
      >
        <DemoErrorBoundary key={slug} fallback={fallback}>
          <Suspense
            fallback={
              <p className={styles.loading} role="status">
                {copy.loading}
              </p>
            }
          >
            <Demo />
          </Suspense>
        </DemoErrorBoundary>
      </div>
    </div>
  );
}
