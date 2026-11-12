"use client";

import AppProviders from "@/styles/shared/providers/AppProviders";
import StyleRail from "@/styles/shared/chrome/StyleRail";
import { basePath } from "@/lib/site";

/**
 * Fifth style: the original ASTRA space station.
 *
 * ASTRA is a Vite + React 18 + R3F SPA. Merging its source into this Next 15 /
 * React 19 tree would conflict on renderer, router and WebGL context, so it is
 * embedded as an isolated static sub-app behind an iframe.
 * `public/embed/astra/` is produced by `node scripts/sync-astra.mjs`.
 */
export default function AstraPage() {
  const src = `${basePath}/embed/astra/index.html`;

  return (
    <AppProviders style="astra" hideChrome>
      <main
        style={{
          position: "fixed",
          inset: 0,
          background: "#05060a",
          overflow: "hidden",
        }}
      >
        <iframe
          src={src}
          title="ASTRA · 太空站"
          style={{ display: "block", width: "100%", height: "100%", border: 0 }}
          allow="fullscreen; autoplay; xr-spatial-tracking"
        />
      </main>
      {/* Keep the global style rail so switching back to the four template styles works. */}
      <StyleRail />
    </AppProviders>
  );
}
