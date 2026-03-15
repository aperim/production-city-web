"use client";

/**
 * React context and hook for i18n locale management.
 * Provides the current locale, direction, and translation function to the component tree.
 *
 * Updated for server-resolved locale (Issue #277 Finding #6):
 * When `serverLocale` is set, resolveLocale() is NOT called during initial render —
 * the server locale is authoritative for hydration.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  type SupportedLocale,
  type TranslationKey,
  t,
  loadLocale,
  getDirection,
  setStoredLocale,
  resolveLocale,
  isSupportedLocale,
} from "./index.js";

interface I18nContextValue {
  locale: SupportedLocale;
  direction: "ltr" | "rtl";
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  /** Initial locale from URL or server-side detection. */
  initialLocale?: SupportedLocale;
  /**
   * Server-resolved locale from Worker X-Locale header.
   * When set, resolveLocale() is NOT called during initial render (Finding #6).
   */
  serverLocale?: SupportedLocale;
}

/**
 * Provides i18n context to the component tree.
 * Handles lazy loading of translation bundles and locale persistence.
 */
export function I18nProvider({ children, initialLocale, serverLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // Server locale is authoritative — skip resolveLocale() to avoid hydration mismatch (Finding #6)
    if (serverLocale) return serverLocale;
    if (initialLocale) return initialLocale;
    // Read the server-rendered <html lang> to match root layout (fixes #318 locale drift)
    if (typeof document !== "undefined") {
      const htmlLang = document.documentElement.lang;
      if (htmlLang && isSupportedLocale(htmlLang)) return htmlLang;
    }
    return resolveLocale();
  });
  const [ready, setReady] = useState(locale === "en");

  useEffect(() => {
    let cancelled = false;
    loadLocale(locale).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, [locale]);

  // Only set document lang/dir when server locale was NOT provided
  // (server already rendered correct values via layout.tsx)
  useEffect(() => {
    if (!serverLocale) {
      document.documentElement.lang = locale;
      document.documentElement.dir = getDirection(locale);
    }
  }, [locale, serverLocale]);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setReady(newLocale === "en");
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
  }, []);

  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      t(key, params, locale),
    [locale],
  );

  const value: I18nContextValue = {
    locale,
    direction: getDirection(locale),
    setLocale,
    t: ready ? translate : (key: TranslationKey, params?: Record<string, string | number>) => t(key, params, "en"),
  };

  return <I18nContext value={value}>{children}</I18nContext>;
}

/**
 * Hook to access i18n context.
 * Returns the current locale, direction, setLocale function, and t() translator.
 */
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
