import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * i18n Quality Gate Tests (#153)
 *
 * Prevents shipping incomplete, placeholder, or structurally broken translations.
 * Covers both frontend (apps/web) and backend (apps/backend) locale files.
 */

const WEB_I18N_DIR = resolve(import.meta.dirname, "../i18n");
const BACKEND_I18N_DIR = resolve(import.meta.dirname, "../../../../apps/backend/src/i18n");

const LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"];

/** Flatten a nested object into dot-notation keys with their values. */
function flattenEntries(
  obj: Record<string, unknown>,
  prefix = "",
): Array<{ key: string; value: unknown }> {
  const entries: Array<{ key: string; value: unknown }> = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      entries.push(
        ...flattenEntries(v as Record<string, unknown>, fullKey),
      );
    } else {
      entries.push({ key: fullKey, value: v });
    }
  }
  return entries;
}

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return flattenEntries(obj, prefix).map((e) => e.key);
}

function loadLocaleJson(dir: string, locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(dir, `${locale}.json`), "utf-8")) as Record<string, unknown>;
}

/**
 * Check for duplicate keys in raw JSON text.
 * JSON.parse silently takes the last value for duplicate keys,
 * so we parse manually to detect them.
 */
function findDuplicateKeys(jsonText: string): string[] {
  const duplicates: string[] = [];
  const path: string[] = [];
  const seenAtLevel: Map<string, Set<string>>[] = [];

  // Track object nesting via a simple state machine over the raw text
  let inString = false;
  let escaped = false;
  let currentKey = "";
  let capturingKey = false;
  let depth = 0;

  for (let i = 0; i < jsonText.length; i++) {
    const ch = jsonText[i]!;

    if (escaped) {
      if (capturingKey) currentKey += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      if (capturingKey) currentKey += ch;
      continue;
    }

    if (ch === '"') {
      if (!inString) {
        inString = true;
        // Determine if this is a key (follows { or , at current depth)
        const before = jsonText.slice(0, i).trimEnd();
        const lastChar = before[before.length - 1];
        if (lastChar === "{" || lastChar === ",") {
          capturingKey = true;
          currentKey = "";
        }
      } else {
        if (capturingKey) {
          // End of key
          capturingKey = false;
          const levelKey = [...path, currentKey].join(".");
          const levelMap = seenAtLevel[depth];
          if (levelMap) {
            const depthPath = path.join(".");
            let keySet = levelMap.get(depthPath);
            if (!keySet) {
              keySet = new Set();
              levelMap.set(depthPath, keySet);
            }
            if (keySet.has(currentKey)) {
              duplicates.push(levelKey);
            } else {
              keySet.add(currentKey);
            }
          }
        }
        inString = false;
      }
      continue;
    }

    if (inString) {
      if (capturingKey) currentKey += ch;
      continue;
    }

    if (ch === "{") {
      // If we just captured a key, push it as the current path
      if (currentKey) {
        path.push(currentKey);
        currentKey = "";
      }
      depth++;
      while (seenAtLevel.length <= depth) {
        seenAtLevel.push(new Map());
      }
    } else if (ch === "}") {
      // Clear seen keys at this depth for this path
      const levelMap = seenAtLevel[depth];
      if (levelMap) {
        levelMap.delete(path.join("."));
      }
      depth--;
      path.pop();
    }
  }

  return duplicates;
}

// ============================================================================
// 1. Full cross-locale parity (frontend)
// ============================================================================
describe("i18n cross-locale parity (frontend)", () => {
  const enKeys = flattenKeys(loadLocaleJson(WEB_I18N_DIR, "en")).sort();

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    it(`${locale}.json has all keys from en.json`, () => {
      const localeKeys = new Set(flattenKeys(loadLocaleJson(WEB_I18N_DIR, locale)));
      const missing = enKeys.filter((k) => !localeKeys.has(k));
      expect(missing, `${locale} is missing ${missing.length} keys`).toEqual([]);
    });

    it(`${locale}.json has no extra keys not in en.json`, () => {
      const enKeySet = new Set(enKeys);
      const localeKeys = flattenKeys(loadLocaleJson(WEB_I18N_DIR, locale));
      const extra = localeKeys.filter((k) => !enKeySet.has(k));
      expect(extra, `${locale} has ${extra.length} extra keys`).toEqual([]);
    });
  }
});

// ============================================================================
// 2. Full cross-locale parity (backend)
// ============================================================================
describe("i18n cross-locale parity (backend)", () => {
  const backendLocaleFiles = readdirSync(BACKEND_I18N_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));

  it("backend has en.json", () => {
    expect(backendLocaleFiles).toContain("en");
  });

  const enKeys = flattenKeys(loadLocaleJson(BACKEND_I18N_DIR, "en")).sort();

  for (const locale of backendLocaleFiles.filter((l) => l !== "en")) {
    it(`backend ${locale}.json has all keys from en.json`, () => {
      const localeKeys = new Set(flattenKeys(loadLocaleJson(BACKEND_I18N_DIR, locale)));
      const missing = enKeys.filter((k) => !localeKeys.has(k));
      expect(missing, `backend ${locale} is missing ${missing.length} keys`).toEqual([]);
    });

    it(`backend ${locale}.json has no extra keys not in en.json`, () => {
      const enKeySet = new Set(enKeys);
      const localeKeys = flattenKeys(loadLocaleJson(BACKEND_I18N_DIR, locale));
      const extra = localeKeys.filter((k) => !enKeySet.has(k));
      expect(extra, `backend ${locale} has ${extra.length} extra keys`).toEqual([]);
    });
  }
});

// ============================================================================
// 3. Placeholder/lorem detection
// ============================================================================
describe("i18n placeholder detection", () => {
  const FORBIDDEN_PATTERNS = [
    /\bTODO\b/i,
    /\bFIXME\b/i,
    /\bLorem\b/i,
    /\bipsum\b/i,
    /\bplaceholder\b/i,
    /\bTRANSLATE\b/i,
    /\bTBD\b/i,
  ];

  function checkForPlaceholders(dir: string, label: string) {
    const localeFiles = readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const file of localeFiles) {
      const locale = file.replace(".json", "");
      it(`${label} ${locale}.json has no placeholder text`, () => {
        const data = loadLocaleJson(dir, locale);
        const entries = flattenEntries(data);
        const violations: string[] = [];

        for (const { key, value } of entries) {
          if (typeof value !== "string") continue;
          for (const pattern of FORBIDDEN_PATTERNS) {
            if (pattern.test(value)) {
              violations.push(`${key}: "${value}" matches ${pattern}`);
            }
          }
        }

        expect(violations, `${label} ${locale} contains placeholder text`).toEqual([]);
      });
    }
  }

  checkForPlaceholders(WEB_I18N_DIR, "frontend");
  checkForPlaceholders(BACKEND_I18N_DIR, "backend");
});

// ============================================================================
// 4. No duplicate keys
// ============================================================================
describe("i18n no duplicate keys", () => {
  function checkNoDuplicates(dir: string, label: string) {
    const localeFiles = readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const file of localeFiles) {
      it(`${label} ${file} has no duplicate keys`, () => {
        const jsonText = readFileSync(resolve(dir, file), "utf-8");
        const duplicates = findDuplicateKeys(jsonText);
        expect(duplicates, `${label} ${file} has duplicate keys`).toEqual([]);
      });
    }
  }

  checkNoDuplicates(WEB_I18N_DIR, "frontend");
  checkNoDuplicates(BACKEND_I18N_DIR, "backend");
});

// ============================================================================
// 5. Non-empty values in all locales
// ============================================================================
describe("i18n non-empty values", () => {
  function checkNonEmpty(dir: string, label: string) {
    const localeFiles = readdirSync(dir).filter((f) => f.endsWith(".json"));

    for (const file of localeFiles) {
      const locale = file.replace(".json", "");
      it(`${label} ${locale}.json has no empty string values`, () => {
        const data = loadLocaleJson(dir, locale);
        const entries = flattenEntries(data);
        const empties: string[] = [];

        for (const { key, value } of entries) {
          if (typeof value === "string" && value.trim() === "") {
            empties.push(key);
          }
        }

        expect(empties, `${label} ${locale} has empty values`).toEqual([]);
      });
    }
  }

  checkNonEmpty(WEB_I18N_DIR, "frontend");
  checkNonEmpty(BACKEND_I18N_DIR, "backend");
});
