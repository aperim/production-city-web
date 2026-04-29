// @vitest-environment node
/**
 * TDD gate for PRO-1461 legal copy updates.
 *
 * Verifies:
 * - New i18n keys exist in en.json
 * - Modified keys have the correct updated values
 * - All 9 non-English locale files have the same structural keys
 * - Page components reference the correct disclaimer keys
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const WEB_I18N_DIR = resolve(import.meta.dirname, "../i18n");
const WEB_PAGES_DIR = resolve(import.meta.dirname, "../pages");
const LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"];

function loadLocale(locale: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(resolve(WEB_I18N_DIR, `${locale}.json`), "utf-8"),
  ) as Record<string, unknown>;
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((curr, key) => {
    if (curr !== null && typeof curr === "object" && !Array.isArray(curr)) {
      return (curr as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function readPage(filename: string): string {
  return readFileSync(resolve(WEB_PAGES_DIR, filename), "utf-8");
}

// ============================================================================
// 1. HIGH — New forward-looking disclaimer keys
// ============================================================================
describe("PRO-1461: new forward-looking disclaimer keys", () => {
  it("en.json has firstNations.disclaimer.forwardLooking", () => {
    const en = loadLocale("en");
    const val = getNestedValue(en, "firstNations.disclaimer.forwardLooking");
    expect(typeof val).toBe("string");
    expect(val as string).toContain("forward-looking statements");
    expect(val as string).toContain("governance");
    expect(val as string).toContain("not a financial prospectus");
  });

  it("en.json has company.disclaimer.forwardLooking", () => {
    const en = loadLocale("en");
    const val = getNestedValue(en, "company.disclaimer.forwardLooking");
    expect(typeof val).toBe("string");
    expect(val as string).toContain("forward-looking statements");
    expect(val as string).toContain("operating model");
    expect(val as string).toContain("not a financial prospectus");
  });

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    it(`${locale}.json has firstNations.disclaimer.forwardLooking`, () => {
      const data = loadLocale(locale);
      const val = getNestedValue(data, "firstNations.disclaimer.forwardLooking");
      expect(val).toBeDefined();
      expect(typeof val).toBe("string");
      expect((val as string).trim()).not.toBe("");
    });

    it(`${locale}.json has company.disclaimer.forwardLooking`, () => {
      const data = loadLocale(locale);
      const val = getNestedValue(data, "company.disclaimer.forwardLooking");
      expect(val).toBeDefined();
      expect(typeof val).toBe("string");
      expect((val as string).trim()).not.toBe("");
    });
  }
});

// ============================================================================
// 2. HIGH — CEO-verified corrections
// ============================================================================
describe("PRO-1461: CEO-verified factual corrections", () => {
  it("company.pullQuote uses 'in active development' not 'being built now'", () => {
    const en = loadLocale("en");
    const val = getNestedValue(en, "company.pullQuote") as string;
    expect(val).not.toContain("being built now");
    expect(val).toContain("in active development");
  });

  it("firstNations.evidenceHeading is 'How we build accountability.'", () => {
    const en = loadLocale("en");
    expect(getNestedValue(en, "firstNations.evidenceHeading")).toBe(
      "How we build accountability.",
    );
  });

  it("firstNations.evidenceLabel is 'How this is structured'", () => {
    const en = loadLocale("en");
    expect(getNestedValue(en, "firstNations.evidenceLabel")).toBe(
      "How this is structured",
    );
  });

  it("firstNations.evidence3 mentions 'with reporting commitments from operations commencement'", () => {
    const en = loadLocale("en");
    const val = getNestedValue(en, "firstNations.evidence3") as string;
    expect(val).toContain("reporting commitments from operations commencement");
  });

  it("firstNations.evidence4 uses 'will be delivered' not 'is delivered'", () => {
    const en = loadLocale("en");
    const val = getNestedValue(en, "firstNations.evidence4") as string;
    expect(val).toContain("will be delivered");
    expect(val).not.toMatch(/through which the programme is delivered/);
  });

  it("firstNations.evidence5 starts with 'Designed alignment'", () => {
    const en = loadLocale("en");
    const val = getNestedValue(en, "firstNations.evidence5") as string;
    expect(val).toMatch(/^Designed alignment/);
  });
});

// ============================================================================
// 3. MODERATE — Investment solicitation sentence additions
// ============================================================================
describe("PRO-1461: investment solicitation sentence appended", () => {
  const INVESTMENT_SENTENCE =
    "This is not a financial prospectus or investment solicitation.";

  it("facilities.disclaimer.forwardLooking ends with investment solicitation sentence", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "facilities.disclaimer.forwardLooking",
    ) as string;
    expect(val).toContain(INVESTMENT_SENTENCE);
  });

  it("creative.disclaimer.forwardLooking ends with investment solicitation sentence", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "creative.disclaimer.forwardLooking",
    ) as string;
    expect(val).toContain(INVESTMENT_SENTENCE);
  });

  it("community.disclaimer.forwardLooking ends with investment solicitation sentence", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "community.disclaimer.forwardLooking",
    ) as string;
    expect(val).toContain(INVESTMENT_SENTENCE);
  });
});

// ============================================================================
// 4. MODERATE — Privacy updates
// ============================================================================
describe("PRO-1461: privacy policy updates", () => {
  it("en.json has legal.privacy.internationalTransfers.title", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "legal.privacy.internationalTransfers.title",
    );
    expect(val).toBe("International Data Transfers");
  });

  it("en.json has legal.privacy.internationalTransfers.description", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "legal.privacy.internationalTransfers.description",
    ) as string;
    expect(typeof val).toBe("string");
    expect(val).toContain("Postmark");
    expect(val).toContain("HubSpot");
    expect(val).toContain("Cloudflare");
    expect(val).toContain("Standard Contractual Clauses");
  });

  it("legal.privacy.jurisdiction.description contains EU/EEA supervisory authority text", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "legal.privacy.jurisdiction.description",
    ) as string;
    expect(val).toContain("EU/EEA");
    expect(val).toContain("supervisory authority");
  });

  for (const locale of LOCALES.filter((l) => l !== "en")) {
    it(`${locale}.json has legal.privacy.internationalTransfers.title`, () => {
      const data = loadLocale(locale);
      const val = getNestedValue(
        data,
        "legal.privacy.internationalTransfers.title",
      );
      expect(val).toBeDefined();
      expect(typeof val).toBe("string");
    });

    it(`${locale}.json has legal.privacy.internationalTransfers.description`, () => {
      const data = loadLocale(locale);
      const val = getNestedValue(
        data,
        "legal.privacy.internationalTransfers.description",
      );
      expect(val).toBeDefined();
      expect(typeof val).toBe("string");
    });
  }
});

// ============================================================================
// 5. MODERATE — Terms ACL carve-out
// ============================================================================
describe("PRO-1461: terms ACL carve-out", () => {
  it("legal.terms.disclaimer.description contains ACL carve-out text", () => {
    const en = loadLocale("en");
    const val = getNestedValue(
      en,
      "legal.terms.disclaimer.description",
    ) as string;
    expect(val).toContain(
      "Nothing in these terms excludes, restricts or modifies",
    );
  });
});

// ============================================================================
// 6. Page component disclaimer key references
// ============================================================================
describe("PRO-1461: page component disclaimer key references", () => {
  it("first-nations.tsx references firstNations.disclaimer.forwardLooking", () => {
    const src = readPage("first-nations.tsx");
    expect(src).toContain('t("firstNations.disclaimer.forwardLooking")');
    expect(src).not.toContain(
      'ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")}',
    );
  });

  it("company.tsx references company.disclaimer.forwardLooking", () => {
    const src = readPage("company.tsx");
    expect(src).toContain('t("company.disclaimer.forwardLooking")');
    expect(src).not.toContain(
      'ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")}',
    );
  });
});
