import { astraStyle } from "@/styles/astra/meta";
import { atelierStyle } from "@/styles/atelier/meta";
import { blueprintStyle } from "@/styles/blueprint/meta";
import { classicStyle } from "@/styles/classic/meta";
import { particleStyle } from "@/styles/particle/meta";
import type { StyleDefinition, StyleMode } from "@/styles/types";

/**
 * Style catalog — add a new entry (and `styles/<id>/`) to extend.
 * Routes, StyleRail, FOUC script, and Uno tokens all derive from this.
 */
export const STYLE_REGISTRY = {
  blueprint: blueprintStyle,
  atelier: atelierStyle,
  classic: classicStyle,
  particle: particleStyle,
  astra: astraStyle,
} as const satisfies Record<StyleMode, StyleDefinition>;

export type { StyleMode, StyleDefinition } from "@/styles/types";

export const STYLE_IDS = Object.keys(STYLE_REGISTRY) as StyleMode[];

export const DEFAULT_STYLE: StyleMode = "blueprint";

export const STYLE_PATHS: Record<StyleMode, string> = {
  atelier: atelierStyle.path,
  classic: classicStyle.path,
  particle: particleStyle.path,
  blueprint: blueprintStyle.path,
  astra: astraStyle.path,
};

export function getStyleDefinition(mode: StyleMode): StyleDefinition {
  return STYLE_REGISTRY[mode];
}

export function isStyleMode(value: unknown): value is StyleMode {
  return typeof value === "string" && value in STYLE_REGISTRY;
}
