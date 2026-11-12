import { describe, expect, it } from "vitest";
import { defaultLocale, getHtmlLang, isLocale, locales } from "./index";

describe("isLocale", () => {
  it("accepts zh and en", () => {
    expect(isLocale("zh")).toBe(true);
    expect(isLocale("en")).toBe(true);
  });

  it("rejects null and unknown values", () => {
    expect(isLocale(null)).toBe(false);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});

describe("getHtmlLang", () => {
  it("maps locales to html lang values", () => {
    expect(getHtmlLang("en")).toBe("en");
    expect(getHtmlLang("zh")).toBe("zh-CN");
  });
});

describe("locales catalog", () => {
  it("exposes zh/en messages and defaults to zh", () => {
    expect(defaultLocale).toBe("zh");
    expect(locales.zh.common.skipLink).toBeTruthy();
    expect(locales.en.common.skipLink).toBeTruthy();
  });
});
