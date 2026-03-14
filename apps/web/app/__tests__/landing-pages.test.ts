import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Landing page structure and i18n completeness tests.
 *
 * Validates that all 7 landing pages exist, export correct components,
 * and that all required i18n keys are present in all locale files.
 */

const APP_ROOT = resolve(import.meta.dirname, "..");

describe("landing page structure", () => {
  const pages = [
    { route: "page.tsx", component: "pages/home.tsx", name: "Home" },
    { route: "facilities/page.tsx", component: "pages/facilities.tsx", name: "Facilities" },
    { route: "creative/page.tsx", component: "pages/creative.tsx", name: "Creative" },
    { route: "vision/page.tsx", component: "pages/vision.tsx", name: "Vision" },
    { route: "community/page.tsx", component: "pages/community.tsx", name: "Community" },
    { route: "faq/page.tsx", component: "pages/faq.tsx", name: "FAQ" },
    { route: "contact/page.tsx", component: "pages/contact.tsx", name: "Contact" },
  ];

  for (const page of pages) {
    it(`${page.name} route file exists at ${page.route}`, () => {
      expect(existsSync(resolve(APP_ROOT, page.route))).toBe(true);
    });

    it(`${page.name} page component file exists at ${page.component}`, () => {
      expect(existsSync(resolve(APP_ROOT, page.component))).toBe(true);
    });

    it(`${page.name} route file imports from ErrorBoundary`, () => {
      const content = readFileSync(resolve(APP_ROOT, page.route), "utf-8");
      expect(content).toContain("ErrorBoundary");
    });

    it(`${page.name} page component uses LandingPageTemplate`, () => {
      const content = readFileSync(resolve(APP_ROOT, page.component), "utf-8");
      expect(content).toContain("LandingPageTemplate");
    });

    it(`${page.name} page component uses useTranslation`, () => {
      const content = readFileSync(resolve(APP_ROOT, page.component), "utf-8");
      expect(content).toContain("useTranslation");
    });

    it(`${page.name} page component uses "use client" directive`, () => {
      const content = readFileSync(resolve(APP_ROOT, page.component), "utf-8");
      expect(content).toContain('"use client"');
    });
  }
});

describe("landing page EOI integration", () => {
  const pagesWithEoi = ["pages/home.tsx", "pages/facilities.tsx", "pages/creative.tsx", "pages/vision.tsx", "pages/community.tsx", "pages/contact.tsx"];

  for (const page of pagesWithEoi) {
    it(`${page} includes EOISection`, () => {
      const content = readFileSync(resolve(APP_ROOT, page), "utf-8");
      expect(content).toContain("EOISection");
    });

    it(`${page} uses shared EOI hooks`, () => {
      const content = readFileSync(resolve(APP_ROOT, page), "utf-8");
      expect(content).toContain("useEoiLabels");
      expect(content).toContain("useEoiCategories");
      expect(content).toContain("useEoiSubmit");
    });
  }
});

describe("landing page i18n completeness", () => {
  const locales = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"];

  const requiredKeyPrefixes = [
    "home.meta", "home.intro", "home.whatIs", "home.facilitiesPreview",
    "home.creativePreview", "home.visionTeaser", "home.eoi",
    "facilities.meta", "facilities.overview", "facilities.screenStages",
    "facilities.commercialStages", "facilities.broadcastTheatre",
    "facilities.controlRoom", "facilities.ancillary", "facilities.eoi",
    "facilities.disclaimer",
    "creative.meta", "creative.ecosystem", "creative.services",
    "creative.caseStudies", "creative.eoi",
    "creative.disclaimer",
    "vision.meta", "vision.mission", "vision.global", "vision.market",
    "vision.why", "vision.stakeholders", "vision.team", "vision.eoi",
    "vision.disclaimer",
    "community.meta", "community.education", "community.sustainability",
    "community.synergies", "community.alliances", "community.bridges",
    "community.eoi", "community.disclaimer",
    "community.acknowledgement", "community.innovation",
    "faq.meta", "faq.q1", "faq.a1", "faq.c1",
    "contact.meta", "contact.info", "contact.eoi",
  ];

  /** Flatten a nested object into dot-notation keys. */
  function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  const enJson = JSON.parse(
    readFileSync(resolve(APP_ROOT, "i18n/en.json"), "utf-8"),
  ) as Record<string, unknown>;
  const enKeys = flattenKeys(enJson);

  it("English locale has all required key prefixes", () => {
    for (const prefix of requiredKeyPrefixes) {
      const matching = enKeys.filter((k) => k.startsWith(prefix));
      expect(matching.length, `Missing keys for prefix: ${prefix}`).toBeGreaterThan(0);
    }
  });

  for (const locale of locales.filter((l) => l !== "en")) {
    it(`${locale} locale file has all landing page keys from English`, () => {
      const localeJson = JSON.parse(
        readFileSync(resolve(APP_ROOT, `i18n/${locale}.json`), "utf-8"),
      ) as Record<string, unknown>;
      const localeKeys = new Set(flattenKeys(localeJson));

      const landingKeys = enKeys.filter((k) =>
        requiredKeyPrefixes.some((prefix) => k.startsWith(prefix)),
      );

      const missing = landingKeys.filter((k) => !localeKeys.has(k));
      expect(missing, `${locale} missing keys`).toEqual([]);
    });
  }
});

describe("landing page component-specific content", () => {
  it("Home page includes Acknowledgement of Country section", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/home.tsx"), "utf-8");
    expect(content).toContain("acknowledgement");
  });

  it("Facilities page renders facility sections", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/facilities.tsx"), "utf-8");
    expect(content).toContain("FacilitySection");
  });

  it("Facilities page includes ForwardLookingDisclaimer", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/facilities.tsx"), "utf-8");
    expect(content).toContain("ForwardLookingDisclaimer");
  });

  it("Facilities page displays facility specs with real values", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/facilities.tsx"), "utf-8");
    expect(content).toContain("specDimensions");
    expect(content).toContain("specHeight");
    expect(content).toContain("specNrc");
  });

  it("Creative page uses ServiceGrid", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/creative.tsx"), "utf-8");
    expect(content).toContain("ServiceGrid");
  });

  it("Creative page includes ForwardLookingDisclaimer", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/creative.tsx"), "utf-8");
    expect(content).toContain("ForwardLookingDisclaimer");
  });

  it("Creative page has 4 case studies including international collaborative", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/creative.tsx"), "utf-8");
    expect(content).toContain("featureFilm");
    expect(content).toContain("liveBroadcast");
    expect(content).toContain("internationalCollab");
    expect(content).toContain("modernTheatre");
  });

  it("Creative page has dedicated discipline media sections", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/creative.tsx"), "utf-8");
    expect(content).toContain("creative-vfx");
    expect(content).toContain("creative-post-production");
    expect(content).toContain("creative-motion-capture");
    expect(content).toContain("creative-costume");
  });

  it("Vision page uses GlobalCampusMap", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/vision.tsx"), "utf-8");
    expect(content).toContain("GlobalCampusMap");
  });

  it("Vision page uses StakeholderGrid", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/vision.tsx"), "utf-8");
    expect(content).toContain("StakeholderGrid");
  });

  it("Vision page includes ForwardLookingDisclaimer", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/vision.tsx"), "utf-8");
    expect(content).toContain("ForwardLookingDisclaimer");
  });

  it("Facilities page sets defaultCategory to producer", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/facilities.tsx"), "utf-8");
    expect(content).toContain('defaultCategory="producer"');
  });

  it("Creative page sets defaultCategory to creative", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/creative.tsx"), "utf-8");
    expect(content).toContain('defaultCategory="creative"');
  });

  it("Vision page sets defaultCategory to investor", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/vision.tsx"), "utf-8");
    expect(content).toContain('defaultCategory="investor"');
  });

  it("Community page includes ForwardLookingDisclaimer", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/community.tsx"), "utf-8");
    expect(content).toContain("ForwardLookingDisclaimer");
  });

  it("Community page sets defaultCategory to education", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/community.tsx"), "utf-8");
    expect(content).toContain('defaultCategory="education"');
  });

  it("Community page includes Acknowledgement of Country", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/community.tsx"), "utf-8");
    expect(content).toContain("acknowledgement");
  });

  it("Community page includes innovation section", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/community.tsx"), "utf-8");
    expect(content).toContain("innovation");
  });

  it("FAQ page uses FAQSection", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/faq.tsx"), "utf-8");
    expect(content).toContain("FAQSection");
  });

  it("FAQ page includes Schema.org structured data", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/faq.tsx"), "utf-8");
    expect(content).toContain("application/ld+json");
    expect(content).toContain("FAQPage");
  });

  it("FAQ page has category filtering", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/faq.tsx"), "utf-8");
    expect(content).toContain("activeCategory");
    expect(content).toContain("Facilities");
    expect(content).toContain("Services");
    expect(content).toContain("Global");
    expect(content).toContain("Community");
    expect(content).toContain("Engagement");
  });

  it("Contact page includes Acknowledgement of Country", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/contact.tsx"), "utf-8");
    expect(content).toContain("acknowledgement");
  });

  it("Contact page supports URL category param", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/contact.tsx"), "utf-8");
    expect(content).toContain("category");
    expect(content).toContain("URLSearchParams");
  });

  it("Contact page displays contact information", () => {
    const content = readFileSync(resolve(APP_ROOT, "pages/contact.tsx"), "utf-8");
    expect(content).toContain("contact.info");
    expect(content).toContain("mailto:");
    expect(content).toContain("tel:");
  });
});

describe("shared landing layout hooks", () => {
  it("use-landing-layout.ts exists", () => {
    expect(existsSync(resolve(APP_ROOT, "lib/use-landing-layout.ts"))).toBe(true);
  });

  it("exports all required hooks", () => {
    const content = readFileSync(resolve(APP_ROOT, "lib/use-landing-layout.ts"), "utf-8");
    expect(content).toContain("useLandingNav");
    expect(content).toContain("useLandingFooter");
    expect(content).toContain("useEoiLabels");
    expect(content).toContain("useEoiCategories");
    expect(content).toContain("useEoiSubmit");
  });

  it("uses submitEoi from api-client", () => {
    const content = readFileSync(resolve(APP_ROOT, "lib/use-landing-layout.ts"), "utf-8");
    expect(content).toContain("submitEoi");
  });
});

describe("all page text is externalized via i18n", () => {
  const pageFiles = [
    "pages/home.tsx",
    "pages/facilities.tsx",
    "pages/creative.tsx",
    "pages/vision.tsx",
    "pages/community.tsx",
    "pages/contact.tsx",
  ];

  for (const page of pageFiles) {
    it(`${page} does not contain hardcoded user-facing English text (except brand name)`, () => {
      const content = readFileSync(resolve(APP_ROOT, page), "utf-8");
      // All text content should come from t() calls, except "Production City" brand name
      // and eoi-section id. Check that there are no plain text strings in JSX.
      const lines = content.split("\n");
      const violations: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        // Skip imports, comments, className, aria attrs, id attrs, href attrs
        if (
          line.trim().startsWith("import") ||
          line.trim().startsWith("*") ||
          line.trim().startsWith("//") ||
          line.trim().startsWith("/**") ||
          line.includes("className=") ||
          line.includes("aria-") ||
          line.includes('id="') ||
          line.includes('href=') ||
          line.includes('"use client"')
        ) {
          continue;
        }
        // Match JSX text content (text between > and <, excluding {expressions})
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

      expect(violations, `Found hardcoded text in ${page}`).toEqual([]);
    });
  }
});
