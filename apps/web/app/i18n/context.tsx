/**
 * React context and hook for i18n locale management.
 * Provides the current locale, direction, and translation function to the component tree.
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
}

/**
 * Provides i18n context to the component tree.
 * Handles lazy loading of translation bundles and locale persistence.
 */
export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    () => initialLocale ?? resolveLocale(),
  );
  const [ready, setReady] = useState(locale === "en");

  useEffect(() => {
    let cancelled = false;
    loadLocale(locale).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

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
