import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STYLE, STYLE_PATHS } from "@/styles/registry";
import {
  STYLE_STORAGE_KEY,
  applyStyle,
  getStoredStyle,
  getStyleHref,
  goToStyle,
  styleFromPathname,
} from "./style";

describe("getStyleHref", () => {
  it("joins basePath with style path", () => {
    expect(getStyleHref("atelier")).toBe(STYLE_PATHS.atelier);
    expect(getStyleHref("classic")).toBe(STYLE_PATHS.classic);
    expect(getStyleHref("particle")).toBe(STYLE_PATHS.particle);
    expect(getStyleHref("blueprint")).toBe(STYLE_PATHS.blueprint);
  });
});

describe("styleFromPathname", () => {
  it("maps known style routes", () => {
    expect(styleFromPathname("/atelier")).toBe("atelier");
    expect(styleFromPathname("/classic")).toBe("classic");
    expect(styleFromPathname("/particle")).toBe("particle");
    expect(styleFromPathname("/blueprint")).toBe("blueprint");
  });

  it("strips a trailing slash on style routes", () => {
    expect(styleFromPathname("/atelier/")).toBe("atelier");
    expect(styleFromPathname("/classic/")).toBe("classic");
  });

  it("returns null for non-style paths", () => {
    expect(styleFromPathname("/")).toBeNull();
    expect(styleFromPathname("/about")).toBeNull();
    expect(styleFromPathname("/atelier/extra")).toBeNull();
  });
});

describe("getStoredStyle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults when unset or invalid", () => {
    expect(getStoredStyle()).toBe(DEFAULT_STYLE);
    localStorage.setItem(STYLE_STORAGE_KEY, "neon");
    expect(getStoredStyle()).toBe(DEFAULT_STYLE);
  });

  it("reads a valid stored style", () => {
    localStorage.setItem(STYLE_STORAGE_KEY, "particle");
    expect(getStoredStyle()).toBe("particle");
  });
});

describe("applyStyle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-style");
  });

  it("writes dataset and localStorage", () => {
    applyStyle("classic");
    expect(document.documentElement.dataset.style).toBe("classic");
    expect(localStorage.getItem(STYLE_STORAGE_KEY)).toBe("classic");
  });
});

describe("goToStyle", () => {
  it("navigates to the style href in the current tab", () => {
    const navigate = vi.fn();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    goToStyle("atelier", navigate);
    expect(navigate).toHaveBeenCalledWith(STYLE_PATHS.atelier);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });
});
