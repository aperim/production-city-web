/**
 * Type-safe i18n system for the frontend.
 * Supports 10 locales with lazy loading and RTL detection.
 */

import en from "./en.json";

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

/** All supported locale codes. */
export const SUPPORTED_LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Locale metadata for language switcher. */
export const LOCALE_META: ReadonlyArray<{
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
}> = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", direction: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", direction: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr" },
];

/** Translation bundles cache. English is always loaded synchronously. */
const translations: Record<string, TranslationTree> = {
  en,
};

/**
 * Checks if a locale code is supported.
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Get the text direction for a locale.
 */
export function getDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

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

  return current.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}
