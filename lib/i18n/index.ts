import { en } from "./locales/en";
import { zh } from "./locales/zh";
import type { Locale, LocaleMessages } from "./types";

export const LOCALE_STORAGE_KEY = "portfolio-locale";

export const locales: Record<Locale, LocaleMessages> = { zh, en };

export const defaultLocale: Locale = "zh";

export function getHtmlLang(locale: Locale): string {
  return locale === "en" ? "en" : "zh-CN";
}

export function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

/** Inline script to set html lang before React hydrates (avoids flash). */
export const localeInitScript = `(function(){try{var k="${LOCALE_STORAGE_KEY}";var l=localStorage.getItem(k);var v=l==="en"?"en":"zh";document.documentElement.lang=v==="en"?"en":"zh-CN";document.documentElement.dataset.locale=v}catch(e){}})();`;

export type { Locale, LocaleMessages };
