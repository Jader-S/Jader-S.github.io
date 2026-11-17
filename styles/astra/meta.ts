import type { StyleDefinition } from "@/styles/types";

/**
 * ASTRA — the original space-station portfolio, embedded as an isolated
 * static sub-app (iframe). Kept as a first-class style in the registry so the
 * left rail, `/` redirect and localStorage preference all work unchanged.
 */
export const astraStyle = {
  id: "astra",
  path: "/astra",
  favicon: "/favicon-astra.svg",
  title: "Jader | 太空站",
  labelKey: "astra",
  chrome: "atelier",
} as const satisfies StyleDefinition;
