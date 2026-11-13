"use client";

import dynamic from "next/dynamic";
import AppProviders from "@/styles/shared/providers/AppProviders";
import StyleRail from "@/styles/shared/chrome/StyleRail";

/**
 * Fifth style: ASTRA space station, rendered natively (no iframe).
 *
 * R3F v9 + React 19 run client-only; the scene is mounted via dynamic import
 * with `ssr: false` so WebGL never touches the server. Phase 1.4 swaps the
 * placeholder scene in `@/styles/astra` for the ported galaxy/planet/demo core.
 */
const AstraApp = dynamic(() => import("@/styles/astra/src/AstraApp"), {
  ssr: false,
});

export default function AstraPage() {
  return (
    <AppProviders style="astra" hideChrome>
      <AstraApp />
      {/* Keep the global style rail so switching back to the four template styles works. */}
      <StyleRail />
    </AppProviders>
  );
}
