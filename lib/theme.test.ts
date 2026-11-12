import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredThemeMode,
  resolveTheme,
} from "./theme";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("resolveTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns light/dark modes as-is", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("resolves auto from prefers-color-scheme", () => {
    mockMatchMedia(true);
    expect(resolveTheme("auto")).toBe("dark");

    mockMatchMedia(false);
    expect(resolveTheme("auto")).toBe("light");
  });
});

describe("getStoredThemeMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to auto when unset or invalid", () => {
    expect(getStoredThemeMode()).toBe("auto");
    localStorage.setItem(THEME_STORAGE_KEY, "neon");
    expect(getStoredThemeMode()).toBe("auto");
  });

  it("reads a valid stored mode", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(getStoredThemeMode()).toBe("dark");
  });
});

describe("applyTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-mode");
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes dataset and localStorage", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themeMode).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("resolves auto before writing theme", () => {
    mockMatchMedia(true);
    applyTheme("auto");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themeMode).toBe("auto");
  });
});
