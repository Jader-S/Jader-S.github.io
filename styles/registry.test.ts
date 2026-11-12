import { describe, expect, it } from "vitest";
import {
  DEFAULT_STYLE,
  STYLE_IDS,
  STYLE_PATHS,
  STYLE_REGISTRY,
  getStyleDefinition,
  isStyleMode,
} from "./registry";

describe("style registry", () => {
  it("lists all registered styles", () => {
    expect(STYLE_IDS).toEqual(["blueprint", "atelier", "classic", "particle", "astra"]);
    expect(DEFAULT_STYLE).toBe("blueprint");
  });

  it("keeps paths aligned with definitions", () => {
    for (const id of STYLE_IDS) {
      expect(STYLE_PATHS[id]).toBe(STYLE_REGISTRY[id].path);
      expect(getStyleDefinition(id)).toBe(STYLE_REGISTRY[id]);
    }
  });
});

describe("isStyleMode", () => {
  it("accepts known style ids", () => {
    expect(isStyleMode("atelier")).toBe(true);
    expect(isStyleMode("classic")).toBe(true);
    expect(isStyleMode("particle")).toBe(true);
    expect(isStyleMode("blueprint")).toBe(true);
    expect(isStyleMode("astra")).toBe(true);
  });

  it("rejects non-string and unknown values", () => {
    expect(isStyleMode(null)).toBe(false);
    expect(isStyleMode(undefined)).toBe(false);
    expect(isStyleMode(1)).toBe(false);
    expect(isStyleMode("neon")).toBe(false);
  });
});
