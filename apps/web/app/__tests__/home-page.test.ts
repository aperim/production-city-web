import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Home page (#239) — structural TDD tests.
 *
 * Validates that the rewritten home page uses Phase 1 cinematic components
 * and follows all review findings from the issue.
 */

const HOME_PATH = resolve(import.meta.dirname, "..", "pages", "home.tsx");

function readHome(): string {
  return readFileSync(HOME_PATH, "utf-8");
}

describe("Home page — Phase 1 component usage", () => {
  it("imports CinematicHero from the UI package", () => {
    expect(readHome()).toContain("CinematicHero");
  });

  it("imports ScrollRevealSection from the UI package", () => {
    expect(readHome()).toContain("ScrollRevealSection");
  });

  it("imports MediaPanel from the UI package", () => {
    expect(readHome()).toContain("MediaPanel");
  });

  it("imports StatementBlock from the UI package", () => {
    expect(readHome()).toContain("StatementBlock");
  });

  it("imports BrandAccentDivider from the UI package", () => {
    expect(readHome()).toContain("BrandAccentDivider");
  });

  it("imports EOISection from the UI package", () => {
    expect(readHome()).toContain("EOISection");
  });
});

describe("Home page — Hero section", () => {
  it("uses CinematicHero component (not MediaHero)", () => {
    const src = readHome();
    expect(src).toContain("<CinematicHero");
    expect(src).not.toContain("<MediaHero");
  });

  it("passes home-hero image via MEDIA config", () => {
    expect(readHome()).toContain('home-hero');
  });

  it('hero title uses i18n key for "We Make Stories"', () => {
    const src = readHome();
    // Should use t() for the title, not hardcoded
    expect(src).toMatch(/t\(["']home\.intro\.tagline["']\)/);
  });

  it("hero subtitle uses i18n key", () => {
    const src = readHome();
    expect(src).toMatch(/t\(["']home\.intro\.tagline3["']\)/);
  });

  it("hero has two CTAs via ctas prop", () => {
    const src = readHome();
    expect(src).toContain("ctas={");
  });

  it("hero CTA labels come from i18n", () => {
    const src = readHome();
    expect(src).toMatch(/t\(["']home\.intro\.ctaPrimary["']\)/);
    expect(src).toMatch(/t\(["']home\.intro\.ctaSecondary["']\)/);
  });
});

describe("Home page — Content sections", () => {
  it("has a StatementBlock for 'What Is Production City'", () => {
    const src = readHome();
    expect(src).toContain("<StatementBlock");
  });

  it("has MediaPanel for facilities preview (image left)", () => {
    const src = readHome();
    expect(src).toContain("home-facilities-preview");
  });

  it("has MediaPanel for creative ecosystem (image right)", () => {
    const src = readHome();
    expect(src).toContain("home-creative-preview");
    // Should have imagePosition="right"
    expect(src).toContain('imagePosition="right"');
  });

  it("has MediaPanel for global vision (image left)", () => {
    expect(readHome()).toContain("home-vision-preview");
  });

  it("wraps content sections in ScrollRevealSection", () => {
    const src = readHome();
    // Should have multiple ScrollRevealSection wrappers
    const count = (src.match(/<ScrollRevealSection/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it("uses BrandAccentDivider between sections", () => {
    const src = readHome();
    const count = (src.match(/<BrandAccentDivider/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

describe("Home page — Community section", () => {
  it("has community section with i18n text", () => {
    const src = readHome();
    expect(src).toMatch(/t\(["']home\.communityPreview\.heading["']\)/);
  });
});

describe("Home page — Acknowledgement of Country (Finding #22)", () => {
  it("renders an Acknowledgement of Country section", () => {
    const src = readHome();
    expect(src).toContain("acknowledgement");
  });

  it("uses AcknowledgementOfCountry shared component", () => {
    const src = readHome();
    expect(src).toContain("AcknowledgementOfCountry");
  });
});

describe("Home page — EOI section (Finding #4)", () => {
  it("includes EOISection component", () => {
    expect(readHome()).toContain("<EOISection");
  });

  it("has eoi-section id for anchor link from hero CTA", () => {
    expect(readHome()).toContain('id="eoi-section"');
  });

  it("uses shared EOI hooks", () => {
    const src = readHome();
    expect(src).toContain("useEoiLabels");
    expect(src).toContain("useEoiCategories");
    expect(src).toContain("useEoiSubmit");
  });
});

describe("Home page — i18n compliance (Finding #9)", () => {
  it("uses 'use client' directive", () => {
    expect(readHome()).toContain('"use client"');
  });

  it("uses useTranslation hook", () => {
    expect(readHome()).toContain("useTranslation");
  });

  it("does not contain hardcoded user-facing English text (except brand name)", () => {
    const content = readHome();
    const lines = content.split("\n");
    const violations: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (
        line.trim().startsWith("import") ||
        line.trim().startsWith("*") ||
        line.trim().startsWith("//") ||
        line.trim().startsWith("/**") ||
        line.includes("className=") ||
        line.includes("aria-") ||
        line.includes('id="') ||
        line.includes("href=") ||
        line.includes('"use client"')
      ) {
        continue;
      }
      const matches = line.match(/>([A-Z][a-z]+(?:\s+[A-Za-z]+)+)</g);
      if (matches) {
        for (const match of matches) {
          const text = match.slice(1, -1).trim();
          if (text && text !== "Production City") {
            violations.push(`Line ${i + 1}: "${text}"`);
          }
        }
      }
    }

    expect(violations, "Found hardcoded text").toEqual([]);
  });
});

describe("Home page — LandingPageTemplate usage", () => {
  it("wraps content in LandingPageTemplate", () => {
    expect(readHome()).toContain("LandingPageTemplate");
  });

  it("uses I18nProvider wrapper", () => {
    expect(readHome()).toContain("I18nProvider");
  });
});
