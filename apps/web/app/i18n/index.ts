/**
 * Type-safe i18n accessor for frontend UI strings.
 * Initial implementation: English only; structure supports multiple locales.
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

const translations: Record<string, TranslationTree> = {
  en,
};

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
