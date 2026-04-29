// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * i18n Translation Quality Tests (#279)
 *
 * Validates translation quality: ICU syntax correctness, interpolation
 * placeholder preservation, and plural form completeness.
 */

const I18N_DIR = resolve(import.meta.dirname, "../i18n");
const LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"];

function loadLocaleJson(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(I18N_DIR, `${locale}.json`), "utf-8")) as Record<string, unknown>;
}

function flattenEntries(
  obj: Record<string, unknown>,
  prefix = "",
): Array<{ key: string; value: unknown }> {
  const entries: Array<{ key: string; value: unknown }> = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      entries.push(...flattenEntries(v as Record<string, unknown>, fullKey));
    } else {
      entries.push({ key: fullKey, value: v });
    }
  }
  return entries;
}

/** Extract {placeholder} names from a string, excluding ICU plural syntax. */
function extractPlaceholders(value: string): string[] {
  // Match {word} but not {count, plural, ...} or {# ...}
  const matches = value.match(/\{(\w+)\}/g) ?? [];
  return matches
    .map((m) => m.slice(1, -1))
    .filter((name) => name !== "#" && !["plural", "select", "selectordinal"].includes(name));
}

/** Check if a string contains ICU plural syntax. */
function isICUPlural(value: string): boolean {
  return /\{\w+,\s*plural\s*,/.test(value);
}

/** Validate ICU plural syntax is well-formed. */
function validateICUSyntax(value: string): boolean {
  if (!isICUPlural(value)) return true; // Non-plural strings are valid
  // Check basic structure: {var, plural, ...forms...}
  const match = value.match(/^\{(\w+),\s*plural\s*,(.*)\}$/s);
  if (!match) return false;
  // Check that forms are balanced braces
  const formsStr = match[2]!;
  let depth = 0;
  for (const ch of formsStr) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}

// Expected minimum plural form counts per locale (CLDR)
const PLURAL_FORM_COUNTS: Record<string, number> = {
  en: 2, // one, other
  ar: 6, // zero, one, two, few, many, other
  ru: 3, // one, few, many (Intl.PluralRules uses one/few/many; other is rare for integers)
  fr: 2, // one, other
  es: 2, // one, other
  pt: 2, // one, other
  hi: 2, // one, other
  bn: 2, // one, other
  zh: 1, // other only
  ja: 1, // other only
};

// ============================================================================
// 1. Interpolation placeholders preserved across all locales
// ============================================================================
describe("i18n interpolation placeholder preservation", () => {
  const enEntries = flattenEntries(loadLocaleJson("en"));
  const enPlaceholders = new Map<string, string[]>();
  for (const { key, value } of enEntries) {
    if (typeof value === "string") {
      const placeholders = extractPlaceholders(value);
      if (placeholders.length > 0) {
        enPlaceholders.set(key, placeholders.sort());
      }
    }
  }

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    it(`${locale} preserves all interpolation placeholders from en.json`, () => {
      const localeData = loadLocaleJson(locale);
      const localeEntries = flattenEntries(localeData);
      const localeMap = new Map(localeEntries.map(({ key, value }) => [key, value]));
      const violations: string[] = [];

      for (const [key, expectedPlaceholders] of enPlaceholders) {
        const localeValue = localeMap.get(key);
        if (typeof localeValue !== "string") continue;
        const actualPlaceholders = extractPlaceholders(localeValue).sort();
        if (JSON.stringify(actualPlaceholders) !== JSON.stringify(expectedPlaceholders)) {
          violations.push(
            `${key}: expected {${expectedPlaceholders.join(", ")}} but got {${actualPlaceholders.join(", ")}}`,
          );
        }
      }

      expect(violations, `${locale} has placeholder mismatches`).toEqual([]);
    });
  }
});

// ============================================================================
// 2. No ICU syntax errors in translation values
// ============================================================================
describe("i18n ICU syntax validation", () => {
  for (const locale of LOCALES) {
    it(`${locale}.json has no ICU syntax errors`, () => {
      const entries = flattenEntries(loadLocaleJson(locale));
      const errors: string[] = [];

      for (const { key, value } of entries) {
        if (typeof value !== "string") continue;
        if (isICUPlural(value) && !validateICUSyntax(value)) {
          errors.push(`${key}: malformed ICU plural syntax`);
        }
      }

      expect(errors, `${locale} has ICU syntax errors`).toEqual([]);
    });
  }
});

// ============================================================================
// 3. Plural keys have correct number of forms per locale
// ============================================================================
describe("i18n plural form completeness", () => {
  for (const locale of LOCALES) {
    const expectedCount = PLURAL_FORM_COUNTS[locale];
    if (!expectedCount) continue;

    it(`${locale}.json plural keys have at least ${expectedCount} form(s)`, () => {
      const entries = flattenEntries(loadLocaleJson(locale));
      const violations: string[] = [];

      for (const { key, value } of entries) {
        if (typeof value !== "string" || !isICUPlural(value)) continue;
        // Count the number of plural forms
        const formMatches = value.match(/(?:=\d+|zero|one|two|few|many|other)\s*\{/g);
        const formCount = formMatches?.length ?? 0;
        if (formCount < expectedCount) {
          violations.push(`${key}: has ${formCount} forms, expected at least ${expectedCount}`);
        }
      }

      // This test only validates form counts when plural keys exist
      // It won't fail if there are no plural keys yet
      expect(violations, `${locale} has incomplete plural forms`).toEqual([]);
    });
  }
});

// ============================================================================
// 4. No untranslated English text in non-English locales
// ============================================================================
describe("i18n no untranslated English leakage", () => {
  const enEntries = flattenEntries(loadLocaleJson("en"));
  const enValues = new Map(
    enEntries
      .filter(({ value }) => typeof value === "string" && (value as string).length > 10)
      .map(({ key, value }) => [key, value as string]),
  );

  // Strings allowed to remain in English across all locales
  const ALLOWED_ENGLISH = new Set([
    "Production City",
    "you@example.com",
    "000000",
    // Proper noun — Australian/First Nations cultural term, intentionally same in all locales
    "First Nations",
    // Proper nouns — personal name and cultural affiliation, same in all locales
    "Matthew Compton (Wiradjuri).",
    // Short UI label
    "How it works",
    // Industry term — same spelling in French, Spanish, Portuguese, etc.
    "POST-PRODUCTION",
  ]);

  // Home page editorial content key prefixes that are placeholder translations.
  // Empty: real translations were added in #348 for all 9 non-English locales.
  const PENDING_TRANSLATION_KEY_PREFIXES: string[] = [];

  // Keys that are expected to be identical across locales (phone numbers, URLs, etc.)
  // Also includes legal content placeholders added in PRO-325 (translation deferred to
  // a future localisation pass; all 10 locales intentionally carry English text for now).
  const IDENTITY_KEY_PATTERNS = [
    /phone.*number/i,
    /email.*address/i,
    /website.*url/i,
    /\.url$/i,
    /\.email$/i,
    /\.phone$/i,
    /\.ctaLink$/,
    /\.troyName$/,
    /\.matthewName$/,
    // Cookie Policy page — entirely new in PRO-325, English placeholder throughout
    /^legal\.cookies\./,
    /^legal\.cookiePolicy$/,
    // New sections added to Privacy Policy in PRO-325
    /^legal\.privacy\.(about|dataCollection\.sensitive|purpose\.note|rights\.note|howWeCollect|marketing|crossBorder|security|cookiesSection|children|anonymity|ndb|complaints)\./,
    /^legal\.privacy\.(dataCollection\.sensitive|purpose\.note|rights\.note)$/,
    // New sections added to Terms of Use in PRO-325
    /^legal\.terms\.(about|userAccounts|submissions|consumerLaw|indemnity|thirdPartyLinks|disputeResolution|severability|waiver|assignment|entireAgreement)\./,
    /^legal\.terms\.(usage\.(items|reserve)|ip\.(restriction|licence)|disclaimer\.(prelaunch|items)|forwardLooking\.note|liability\.(items|note))$/,
    /^legal\.terms\.liability\.items\.\d+$/,
    /^legal\.terms\.usage\.items\.\d+$/,
    /^legal\.terms\.disclaimer\.items\.\d+$/,
    // companyTeam keys that are non-translatable by nature
    /\.troyEmail$/,           // email address
    /\.troyPhone$/,           // phone number with country prefixes
    /\.troyPortraitLabel$/,   // person name (like troyName)
    /\.troyPortraitInitials$/, // name initials
    /\.roleCeo$/,             // "CEO" is an international abbreviation
    /\.tbc$/,                 // "TBC" is used universally
    /\.bioPending$/,           // decorative placeholder notation
    /\.portraitPlaceholder$/,  // decorative placeholder notation
    /\.troyPortraitAriaLabel$/, // person name + "portrait" (same word in French)
    // masterplan eyebrow: "Campus" is the same Latin-origin word in es/fr/pt
    /^masterplan\.hero\.eyebrow$/,
    // Numbered section labels (e.g. "03 — Services") — the word may be the same in some locales
    /\.sectionLabel$/,
    // Position paper — EOI industry/technical document, English placeholder throughout (#518)
    /^positionPaper\./,
    // New disclaimer keys added in PRO-1461 — translation deferred to a future localisation pass
    /^company\.disclaimer\./,
    /^firstNations\.disclaimer\./,
    /^legal\.privacy\.internationalTransfers\./,
    // CEO-verified copy corrections in PRO-1461 — new English text, retranslation deferred
    /^company\.pullQuote$/,
    /^firstNations\.evidenceLabel$/,
    /^firstNations\.evidenceHeading$/,
    /^firstNations\.evidence[345]$/,
    /^legal\.privacy\.jurisdiction\.description$/,
    /^legal\.terms\.disclaimer\.description$/,
  ];

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    it(`${locale}.json has no untranslated English text (beyond brand names)`, () => {
      const localeEntries = flattenEntries(loadLocaleJson(locale));
      const localeMap = new Map(localeEntries.map(({ key, value }) => [key, value]));
      const violations: string[] = [];

      for (const [key, enValue] of enValues) {
        const localeValue = localeMap.get(key);
        if (typeof localeValue !== "string") continue;

        // Skip allowed English values
        if (ALLOWED_ENGLISH.has(enValue.trim())) continue;
        // Skip email/URL patterns
        if (/^https?:\/\//.test(enValue) || /^[^\s]+@[^\s]+$/.test(enValue)) continue;
        // Skip keys that are expected to be identical (phone numbers, URLs, etc.)
        if (IDENTITY_KEY_PATTERNS.some((p) => p.test(key))) continue;
        // Skip values that look like phone numbers or URLs
        if (/^\+[\d\s-]+$/.test(enValue.trim())) continue;
        if (/^www\./.test(enValue.trim())) continue;
        // Skip measurement/dimension strings (e.g., "10m × 10m (100 sqm)")
        if (/\d+m\s*[×x]\s*\d+m/.test(enValue)) continue;
        // Skip values that are mostly numbers/units (technical specs)
        if (/^\d[\d\s,.×x()a-z]+$/i.test(enValue.trim()) && enValue.length < 30) continue;
        // Skip geographic place names (keep in English across locales)
        if (/^[A-Z][a-z]+,\s+[A-Z]/.test(enValue.trim())) continue;
        // Skip short technical terms that may be universal (e.g., "Invitations", "Notifications", "FAQ")
        if (enValue.trim().length < 20 && /^[A-Z][a-z]+s?$/.test(enValue.trim())) continue;
        // Skip meta titles that contain brand name (e.g., "FAQ — Production City")
        if (key.endsWith(".meta.title") || key.endsWith(".meta.description")) continue;
        // Skip technical facility spec descriptions (dimensions, acoustic ratings, etc.)
        // These are universal technical specifications that are the same across all locales.
        if (key.includes(".spec")) continue;
        // Skip scroll indicator — stylistic English UI label, intentionally not translated.
        if (key.endsWith(".scrollIndicator")) continue;
        // Skip keys with count placeholders only (e.g., "{count} questions")
        if (/^\{count\}\s+\w+$/.test(enValue.trim())) continue;

        // Skip keys that are pending professional translation (#344)
        if (PENDING_TRANSLATION_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;

        // If the locale value is identical to English, it's likely untranslated
        if (localeValue === enValue) {
          violations.push(`${key}: identical to English ("${enValue.slice(0, 60)}...")`);
        }
      }

      expect(violations, `${locale} has untranslated English text`).toEqual([]);
    });
  }
});
