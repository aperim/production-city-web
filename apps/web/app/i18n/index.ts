/**
 * Type-safe i18n system for the frontend.
 * Supports 10 locales with lazy loading and RTL detection.
 */

import en from "./en.json";
import { resolvePlural } from "./pluralization.js";

type TranslationTree = typeof en;

/**
 * Recursively generates dot-notation key paths from the translation tree.
 */
type FlattenKeys<T, Prefix extends string = ""> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? FlattenKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
        : Prefix extends ""
          ? K
          : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = FlattenKeys<TranslationTree>;

// Import from shared package for local use (direct path to avoid Vite alias interception)
import {
  SUPPORTED_LOCALES as _SUPPORTED_LOCALES,
  LOCALE_META as _LOCALE_META,
  isSupportedLocale as _isSupportedLocale,
  getDirection as _getDirection,
  getOgLocale as _getOgLocale,
  type SupportedLocale as _SupportedLocale,
  type LocaleMeta as _LocaleMeta,
} from "../../../../packages/ui/src/lib/i18n-constants.js";

// Re-export locale constants from shared package (single source of truth)
export const SUPPORTED_LOCALES = _SUPPORTED_LOCALES;
export const LOCALE_META = _LOCALE_META;
export type SupportedLocale = _SupportedLocale;
export type LocaleMeta = _LocaleMeta;
export const isSupportedLocale = _isSupportedLocale;
export const getDirection = _getDirection;
export const getOgLocale = _getOgLocale;

/** Translation bundles cache. English is always loaded synchronously. */
const translations: Record<string, TranslationTree> = {
  en,
};

/**
 * Lazy-loads a translation bundle for the given locale.
 * Returns immediately if already loaded.
 */
export async function loadLocale(locale: SupportedLocale): Promise<void> {
  if (translations[locale]) return;

  const loaders: Record<string, () => Promise<{ default: TranslationTree }>> = {
    zh: () => import("./zh.json"),
    hi: () => import("./hi.json"),
    es: () => import("./es.json"),
    ar: () => import("./ar.json"),
    fr: () => import("./fr.json"),
    bn: () => import("./bn.json"),
    pt: () => import("./pt.json"),
    ru: () => import("./ru.json"),
    ja: () => import("./ja.json"),
  };

  const loader = loaders[locale];
  if (loader) {
    const mod = await loader();
    translations[locale] = mod.default;
  }
}

/**
 * Detect locale from browser preferences.
 */
export function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return "en";

  for (const lang of navigator.languages ?? [navigator.language]) {
    const code = lang.toLowerCase();
    if (isSupportedLocale(code)) return code;
    const prefix = code.split("-")[0]!;
    if (isSupportedLocale(prefix)) return prefix;
  }

  return "en";
}

/** LocalStorage key for persisted locale preference. */
const LOCALE_STORAGE_KEY = "pc-locale";

/**
 * Get persisted locale preference from localStorage.
 */
export function getStoredLocale(): SupportedLocale | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isSupportedLocale(stored)) return stored;
  return null;
}

/**
 * Persist locale preference to localStorage.
 */
export function setStoredLocale(locale: SupportedLocale): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

/**
 * Resolve locale using priority chain:
 * URL prefix > stored preference > browser detection > "en"
 */
export function resolveLocale(urlLocale?: string): SupportedLocale {
  if (urlLocale && isSupportedLocale(urlLocale)) return urlLocale;
  const stored = getStoredLocale();
  if (stored) return stored;
  return detectBrowserLocale();
}

/**
 * Get a translated string by dot-notation key.
 * Supports interpolation: `{variableName}` in the string will be replaced.
 */
export function t(
  key: TranslationKey,
  params?: Record<string, string | number>,
  locale = "en",
): string {
  const tree = translations[locale] ?? translations.en!;
  const parts = key.split(".");
  let current: unknown = tree;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      // Missing key: return English fallback, log warning
      if (locale !== "en") return t(key, params, "en");
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== "string") {
    if (locale !== "en") return t(key, params, "en");
    return key;
  }

  if (!params) return current;

  // Check for ICU plural syntax and resolve if present
  if (current.includes(", plural,")) {
    return resolvePlural(current, params, locale);
  }

  return current.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}

/**
 * Get a translated string array by dot-notation key.
 * Returns [] if the key does not resolve to an array.
 */
export function tArray(key: TranslationKey, locale = "en"): string[] {
  const tree = translations[locale] ?? translations.en!;
  const parts = key.split(".");
  let current: unknown = tree;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return [];
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (Array.isArray(current)) return current as string[];
  if (locale !== "en") return tArray(key, "en");
  return [];
}
