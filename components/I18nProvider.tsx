"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultLocale,
  getHtmlLang,
  isLocale,
  locales,
  LOCALE_STORAGE_KEY,
  type Locale,
  type LocaleMessages,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: LocaleMessages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : defaultLocale;
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = getHtmlLang(locale);
  document.documentElement.dataset.locale = locale;
  document.title = locales[locale].meta.title;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with defaultLocale so SSR HTML matches the first client render.
  // Sync from localStorage after mount to avoid React hydration mismatch (#418).
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = readStoredLocale();
    setLocaleState(stored);
    applyLocale(stored);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    applyLocale(next);
  }, []);

  const t = useMemo(() => locales[locale], [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
