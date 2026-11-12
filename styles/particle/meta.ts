import type { StyleDefinition } from "@/styles/types";

export const particleStyle = {
  id: "particle",
  path: "/particle",
  favicon: "/favicon-particle.svg",
  title: "Jader | 粒子",
  labelKey: "particle",
  chrome: "atelier",
} as const satisfies StyleDefinition;
