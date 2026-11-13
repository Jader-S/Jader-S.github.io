import { describe, expect, it } from "vitest";
import { defaultLocale, getHtmlLang, isLocale, locales, navLabel } from "./index";

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

describe("unified navigation", () => {
  const expectedHrefs = ["#about", "#work", "#lab", "#skills", "#blog", "#experience"];

  it("keeps one shared nav dictionary for both locales", () => {
    for (const locale of ["zh", "en"] as const) {
      expect(locales[locale].nav.map((item) => item.href)).toEqual(expectedHrefs);
    }
  });

  it("uses the agreed Chinese section names", () => {
    expect(locales.zh.nav.map((item) => item.label)).toEqual([
      "关于我",
      "作品",
      "实验室",
      "技能",
      "博客",
      "经验领域",
    ]);
  });

  it("numbers the six sections in the agreed order", () => {
    expect([
      locales.zh.about.index,
      locales.zh.work.index,
      locales.zh.lab.index,
      locales.zh.skills.index,
      locales.zh.blog.index,
      locales.zh.experience.index,
    ]).toEqual([
      "01 — ABOUT",
      "02 — WORK",
      "03 — LAB",
      "04 — SKILLS",
      "05 — BLOG",
      "06 — DOMAINS",
    ]);
  });

  it("navLabel resolves section ids consistently for all anchored styles", () => {
    expect(navLabel(locales.zh, "top")).toBe(locales.zh.profile.name);
    expect(navLabel(locales.zh, "work")).toBe("作品");
    expect(navLabel(locales.zh, "lab")).toBe("实验室");
    expect(navLabel(locales.zh, "experience")).toBe("经验领域");
    expect(navLabel(locales.en, "about")).toBe("About me");
    expect(navLabel(locales.en, "lab")).toBe("Lab");
    expect(navLabel(locales.en, "blog")).toBe("Blog");
    expect(navLabel(locales.zh, "unknown")).toBe("unknown");
  });

  it("retires the legacy per-style navClassic dictionary", () => {
    expect("navClassic" in locales.zh).toBe(false);
    expect("navClassic" in locales.en).toBe(false);
  });
});
