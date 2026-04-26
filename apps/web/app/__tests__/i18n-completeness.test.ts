// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * i18n completeness gate tests.
 *
 * Validates cross-locale key parity, placeholder detection,
 * non-empty values, and JSON structure integrity for both
 * frontend and backend locale files.
 */

const WEB_I18N_DIR = resolve(import.meta.dirname, "../i18n");
const BACKEND_I18N_DIR = resolve(
  import.meta.dirname,
  "../../../../apps/backend/src/i18n",
);
const LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"];
const BANNED_PATTERNS =
  /\b(TODO|FIXME|Lorem|ipsum|placeholder|TRANSLATE|TBD)\b/i;

/** Flatten a nested object into dot-notation keys with their values. */
function flattenEntries(
  obj: Record<string, unknown>,
  prefix = "",
): Array<[string, unknown]> {
  const entries: Array<[string, unknown]> = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      entries.push(
        ...flattenEntries(value as Record<string, unknown>, fullKey),
      );
    } else {
      entries.push([fullKey, value]);
    }
  }
  return entries;
}

/** Load and parse a locale JSON file. */
function loadLocale(dir: string, locale: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(resolve(dir, `${locale}.json`), "utf-8"),
  ) as Record<string, unknown>;
}

/**
 * Check for duplicate keys by scanning raw JSON text.
 * JSON.parse silently collapses duplicates, so we use a regex to
 * extract all key strings and count occurrences per nesting depth.
 */
function findDuplicateKeys(filePath: string): string[] {
  const raw = readFileSync(filePath, "utf-8");
  const duplicates: string[] = [];
  // Track keys at each nesting depth
  const keysByDepth = new Map<number, Map<string, number>>();
  let depth = 0;

  // Walk character by character to track depth and extract keys
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "{") {
      depth++;
      if (!keysByDepth.has(depth)) keysByDepth.set(depth, new Map());
    } else if (ch === "}") {
      // Check for duplicates at this depth before leaving
      const keysAtDepth = keysByDepth.get(depth);
      if (keysAtDepth) {
        for (const [key, count] of keysAtDepth) {
          if (count > 1) duplicates.push(key);
        }
        keysAtDepth.clear();
      }
      depth--;
    } else if (ch === '"') {
      // Extract string
      const start = i + 1;
      i++;
      while (i < raw.length && raw[i] !== '"') {
        if (raw[i] === "\\") i++; // skip escaped char
        i++;
      }
      const str = raw.slice(start, i);
      // Check if this string is a key (followed by colon)
      let j = i + 1;
      while (j < raw.length && /\s/.test(raw[j]!)) j++;
      if (raw[j] === ":") {
        const keysAtDepth = keysByDepth.get(depth) ?? new Map<string, number>();
        keysByDepth.set(depth, keysAtDepth);
        keysAtDepth.set(str, (keysAtDepth.get(str) ?? 0) + 1);
      }
    }
    i++;
  }

  return duplicates;
}

function runI18nSuite(label: string, i18nDir: string) {
  describe(`${label} i18n completeness`, () => {
    const enData = loadLocale(i18nDir, "en");
    const enEntries = flattenEntries(enData);
    const enKeys = enEntries.map(([k]) => k);

    describe("cross-locale key parity", () => {
      for (const locale of LOCALES.filter((l) => l !== "en")) {
        it(`${locale} has all keys from English`, () => {
          const localeData = loadLocale(i18nDir, locale);
          const localeKeys = new Set(
            flattenEntries(localeData).map(([k]) => k),
          );
          const missing = enKeys.filter((k) => !localeKeys.has(k));
          expect(missing, `${locale} missing keys`).toEqual([]);
        });

        it(`${locale} has no extra keys not in English`, () => {
          const localeData = loadLocale(i18nDir, locale);
          const localeKeys = flattenEntries(localeData).map(([k]) => k);
          const enKeySet = new Set(enKeys);
          const extra = localeKeys.filter((k) => !enKeySet.has(k));
          expect(extra, `${locale} has extra keys`).toEqual([]);
        });
      }
    });

    describe("placeholder detection", () => {
      for (const locale of LOCALES) {
        it(`${locale} has no TODO/FIXME/Lorem/placeholder/TRANSLATE/TBD values`, () => {
          const data = loadLocale(i18nDir, locale);
          const entries = flattenEntries(data);
          const violations: string[] = [];

          for (const [key, value] of entries) {
            if (typeof value === "string" && BANNED_PATTERNS.test(value)) {
              violations.push(`${key}: "${value}"`);
            }
          }

          expect(violations, `${locale} contains placeholder text`).toEqual(
            [],
          );
        });
      }
    });

    describe("non-empty values", () => {
      for (const locale of LOCALES) {
        it(`${locale} has no empty string values`, () => {
          const data = loadLocale(i18nDir, locale);
          const entries = flattenEntries(data);
          const empty: string[] = [];

          for (const [key, value] of entries) {
            if (typeof value === "string" && value.trim() === "") {
              empty.push(key);
            }
          }

          expect(empty, `${locale} has empty values`).toEqual([]);
        });
      }
    });

    describe("no duplicate keys", () => {
      for (const locale of LOCALES) {
        it(`${locale}.json has no duplicate keys`, () => {
          const filePath = resolve(i18nDir, `${locale}.json`);
          const duplicates = findDuplicateKeys(filePath);
          expect(duplicates, `${locale} has duplicate keys`).toEqual([]);
        });
      }
    });
  });
}

runI18nSuite("Frontend (web)", WEB_I18N_DIR);
runI18nSuite("Backend", BACKEND_I18N_DIR);
