import { describe, expect, it } from "vitest";
import { BREAKPOINTS, MEDIA_QUERIES, getViewportSize } from "./breakpoints";

describe("getViewportSize", () => {
  it("classifies mobile below md", () => {
    expect(getViewportSize(0)).toBe("mobile");
    expect(getViewportSize(BREAKPOINTS.md - 1)).toBe("mobile");
  });

  it("classifies tablet from md to below lg", () => {
    expect(getViewportSize(BREAKPOINTS.md)).toBe("tablet");
    expect(getViewportSize(BREAKPOINTS.lg - 1)).toBe("tablet");
  });

  it("classifies desktop from lg upward", () => {
    expect(getViewportSize(BREAKPOINTS.lg)).toBe("desktop");
    expect(getViewportSize(1920)).toBe("desktop");
  });
});

describe("MEDIA_QUERIES", () => {
  it("matches UnoCSS breakpoint boundaries", () => {
    expect(MEDIA_QUERIES.mobile).toBe(`(max-width: ${BREAKPOINTS.md - 1}px)`);
    expect(MEDIA_QUERIES.tablet).toBe(
      `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
    );
    expect(MEDIA_QUERIES.desktop).toBe(`(min-width: ${BREAKPOINTS.lg}px)`);
    expect(MEDIA_QUERIES.reducedMotion).toBe("(prefers-reduced-motion: reduce)");
  });
});
