import type { StyleDefinition } from "@/styles/types";

export const classicStyle = {
  id: "classic",
  path: "/classic",
  favicon: "/favicon-classic.svg",
  title: "Jader | 经典",
  labelKey: "classic",
  chrome: "classic",
} as const satisfies StyleDefinition;
