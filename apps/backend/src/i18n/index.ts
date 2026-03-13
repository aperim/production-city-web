/**
 * Type-safe i18n accessor for backend API messages.
 * Supports 10 locales with RTL detection.
 */

import en from "./en.json";
import zh from "./zh.json";
import hi from "./hi.json";
import es from "./es.json";
import ar from "./ar.json";
import fr from "./fr.json";
import bn from "./bn.json";
import pt from "./pt.json";
import ru from "./ru.json";
import ja from "./ja.json";

type TranslationTree = typeof en;

/**
 * Recursively generates dot-notation key paths from the translation tree.
 * e.g., "auth.login.rateLimited" | "admin.users.notFound" | ...
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

const translations: Record<string, TranslationTree> = {
  en,
  zh,
  hi,
  es,
  ar,
  fr,
  bn,
  pt,
  ru,
  ja,
};

/** All supported locale codes. */
export const SUPPORTED_LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Locale metadata for the /v1/locales endpoint and language switcher. */
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

/**
 * Checks if a locale code is supported.
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Parse Accept-Language header and return the best matching supported locale.
 * Falls back to "en" if no match.
 */
export function parseAcceptLanguage(header: string | null | undefined): SupportedLocale {
  if (!header) return "en";

  const entries = header
    .split(",")
    .map((part) => {
      const [lang, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1.0;
      return { lang: lang!.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of entries) {
    // Exact match (e.g., "en", "zh")
    if (isSupportedLocale(lang)) return lang;
    // Prefix match (e.g., "en-US" → "en", "zh-CN" → "zh")
    const prefix = lang.split("-")[0]!;
    if (isSupportedLocale(prefix)) return prefix;
  }

  return "en";
}

/**
 * Get the text direction for a locale.
 */
export function getDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Get a translated string by dot-notation key.
 * Supports interpolation: `{variableName}` in the string will be replaced.
 *
 * @param key - Dot-notation key, e.g., "auth.login.rateLimited"
 * @param params - Optional interpolation params, e.g., { allowed: "asc, desc" }
 * @param locale - Locale code, defaults to "en"
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
      return key;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current !== "string") {
    return key;
  }

  if (!params) return current;

  return current.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}
