/**
 * Shared i18n locale constants — single source of truth.
 *
 * Importable by Worker, app, and UI components.
 * Previously duplicated between apps/web/app/i18n/index.ts and apps/backend/src/i18n/index.ts.
 *
 * @module i18n-constants
 */

/** All supported locale codes. */
export const SUPPORTED_LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Locale metadata for language switcher and SEO. */
export interface LocaleMeta {
  readonly code: SupportedLocale;
  readonly name: string;
  readonly nativeName: string;
  readonly direction: "ltr" | "rtl";
  /** BCP 47 with region for og:locale (e.g. "en_US", "zh_CN"). */
  readonly ogLocale: string;
}

export const LOCALE_META: readonly LocaleMeta[] = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr", ogLocale: "en_US" },
  { code: "zh", name: "Chinese", nativeName: "中文", direction: "ltr", ogLocale: "zh_CN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", direction: "ltr", ogLocale: "hi_IN" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr", ogLocale: "es_419" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl", ogLocale: "ar_SA" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr", ogLocale: "fr_FR" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", direction: "ltr", ogLocale: "bn_BD" },
  { code: "pt", name: "Portuguese", nativeName: "Português", direction: "ltr", ogLocale: "pt_BR" },
  { code: "ru", name: "Russian", nativeName: "Русский", direction: "ltr", ogLocale: "ru_RU" },
  { code: "ja", name: "Japanese", nativeName: "日本語", direction: "ltr", ogLocale: "ja_JP" },
] as const;

/**
 * Check if a string is a supported locale code.
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Get text direction for a locale.
 */
export function getDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Get og:locale value for a supported locale.
 */
export function getOgLocale(locale: SupportedLocale): string {
  const meta = LOCALE_META.find((m) => m.code === locale);
  return meta?.ogLocale ?? "en_US";
}
