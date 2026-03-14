import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * WCAG 2.1 AA Accessibility Audit for Landing Pages (#153)
 *
 * Static analysis of page components, templates, organisms, and i18n
 * to verify compliance with WCAG 2.1 AA criteria. Runtime checks
 * (contrast, reflow, focus trapping) are covered by E2E tests.
 */

const APP_ROOT = resolve(import.meta.dirname, "..");
const UI_ROOT = resolve(import.meta.dirname, "../../../../packages/ui/src");

const PAGE_FILES = readdirSync(resolve(APP_ROOT, "pages"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => `pages/${f}`);

function readFile(relativePath: string, root = APP_ROOT): string {
  return readFileSync(resolve(root, relativePath), "utf-8");
}

// ============================================================================
// 1.3.1 Info and Relationships — Heading hierarchy, landmark regions, form labels
// ============================================================================
describe("WCAG 1.3.1 — Info and Relationships", () => {
  it("every page has exactly one h1 element (inline or via CinematicHero)", () => {
    for (const page of PAGE_FILES) {
      const content = readFile(page);
      const h1Matches = content.match(/<h1[\s>]/g);
      const usesCinematicHero = content.includes("<CinematicHero");
      // CinematicHero renders an h1 internally, so pages using it
      // should NOT also have an inline h1 (would create duplicates).
      if (usesCinematicHero) {
        expect(
          h1Matches?.length ?? 0,
          `${page} uses CinematicHero (provides h1) but also has inline <h1>`,
        ).toBe(0);
      } else {
        expect(
          h1Matches?.length,
          `${page} should have exactly 1 <h1>, found ${h1Matches?.length ?? 0}`,
        ).toBe(1);
      }
    }
  });

  it("h1 elements have id for aria-labelledby references", () => {
    for (const page of PAGE_FILES) {
      const content = readFile(page);
      // Skip pages using CinematicHero — h1 is rendered in the component
      if (content.includes("<CinematicHero")) continue;
      const h1Match = content.match(/<h1[^>]*>/);
      if (h1Match) {
        expect(
          h1Match[0],
          `${page}: <h1> should have an id attribute`,
        ).toContain("id=");
      }
    }
  });

  it("sections have aria-labelledby linking to heading ids", () => {
    for (const page of PAGE_FILES) {
      const content = readFile(page);
      const sections = content.match(/<section[^>]*>/g) ?? [];
      for (const section of sections) {
        expect(
          section,
          `${page}: <section> should have aria-labelledby`,
        ).toContain("aria-labelledby=");
      }
    }
  });

  it("form inputs have associated labels (htmlFor/id pairing)", () => {
    const eoiForm = readFile(
      "molecules/EOIForm/EOIForm.tsx",
      UI_ROOT,
    );
    const labels = eoiForm.match(/htmlFor="([^"]+)"/g) ?? [];
    const ids = eoiForm.match(/\bid="(eoi-[^"]+)"/g) ?? [];
    expect(labels.length).toBeGreaterThan(0);
    expect(ids.length).toBeGreaterThan(0);
    // Each label's htmlFor should have a matching id
    for (const label of labels) {
      const forValue = label.match(/htmlFor="([^"]+)"/)?.[1];
      if (forValue && forValue !== "website") {
        // Skip honeypot
        expect(
          eoiForm,
          `EOIForm: label for="${forValue}" should have matching input id`,
        ).toContain(`id="${forValue}"`);
      }
    }
  });
});

// ============================================================================
// 2.1.1 Keyboard — All functionality keyboard accessible
// ============================================================================
describe("WCAG 2.1.1 — Keyboard accessibility", () => {
  it("interactive elements have focus-visible styles", () => {
    const navFile = readFile(
      "organisms/LandingNavigation/LandingNavigation.tsx",
      UI_ROOT,
    );
    expect(navFile).toContain("focus-visible:");

    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    expect(eoiForm).toContain("focus-visible:");
  });

  it("language switcher supports keyboard navigation", () => {
    const langSwitcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    expect(langSwitcher).toContain("ArrowDown");
    expect(langSwitcher).toContain("ArrowUp");
    expect(langSwitcher).toContain("Escape");
    expect(langSwitcher).toContain("Home");
    expect(langSwitcher).toContain("End");
  });

  it("FAQ items are keyboard-expandable (button trigger with aria-expanded)", () => {
    const faqItem = readFile("molecules/FAQItem/FAQItem.tsx", UI_ROOT);
    expect(faqItem).toContain("aria-expanded");
    expect(faqItem).toContain("<button");
    expect(faqItem).toContain("aria-controls");
  });

  it("mobile menu toggle is a button with aria-expanded", () => {
    const nav = readFile(
      "organisms/LandingNavigation/LandingNavigation.tsx",
      UI_ROOT,
    );
    expect(nav).toContain("aria-expanded={mobileOpen}");
    expect(nav).toContain('aria-label="Navigation menu"');
  });

  it("mobile overlay uses dialog role with focus trap (Finding #10)", () => {
    const nav = readFile(
      "organisms/LandingNavigation/LandingNavigation.tsx",
      UI_ROOT,
    );
    expect(nav).toContain('role="dialog"');
    expect(nav).toContain('aria-modal="true"');
    expect(nav).toContain('"Escape"');
  });
});

// ============================================================================
// 2.1.2 No Keyboard Trap — Focus can leave all components
// ============================================================================
describe("WCAG 2.1.2 — No keyboard trap", () => {
  it("language switcher menu closes on Escape", () => {
    const langSwitcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    expect(langSwitcher).toContain('e.key === "Escape"');
    expect(langSwitcher).toContain("close()");
  });

  it("language switcher menu closes on Tab (no trap)", () => {
    const langSwitcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    expect(langSwitcher).toContain('e.key === "Tab"');
    expect(langSwitcher).toContain("setOpen(false)");
  });

  it("language switcher returns focus to trigger on close", () => {
    const langSwitcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    expect(langSwitcher).toContain("triggerRef.current?.focus()");
  });
});

// ============================================================================
// 2.4.1 Bypass Blocks — Skip-to-content link
// ============================================================================
describe("WCAG 2.4.1 — Bypass blocks", () => {
  it("LandingPageTemplate has skip-to-content link", () => {
    const template = readFile(
      "templates/LandingPageTemplate/LandingPageTemplate.tsx",
      UI_ROOT,
    );
    expect(template).toContain('href="#main-content"');
    expect(template).toContain("Skip to main content");
  });

  it("LandingPageTemplate has main element with id for skip link", () => {
    const template = readFile(
      "templates/LandingPageTemplate/LandingPageTemplate.tsx",
      UI_ROOT,
    );
    expect(template).toContain('id="main-content"');
    expect(template).toContain("<main");
  });

  it("skip link is visually hidden but focusable", () => {
    const template = readFile(
      "templates/LandingPageTemplate/LandingPageTemplate.tsx",
      UI_ROOT,
    );
    expect(template).toContain("sr-only");
    expect(template).toContain("focus:not-sr-only");
  });
});

// ============================================================================
// 2.4.2 Page Titled — Pages should have unique meta titles
// ============================================================================
describe("WCAG 2.4.2 — Page titled", () => {
  const pageMetaKeys = [
    "home.meta.title",
    "facilities.meta.title",
    "creative.meta.title",
    "vision.meta.title",
  ];

  it("all pages have unique meta title keys in i18n", () => {
    const en = JSON.parse(readFile("i18n/en.json"));
    const titles = pageMetaKeys.map((key) => {
      const parts = key.split(".");
      let value: unknown = en;
      for (const part of parts) {
        value = (value as Record<string, unknown>)?.[part];
      }
      return value;
    });

    // All titles should be non-empty strings
    for (const title of titles) {
      expect(typeof title).toBe("string");
      expect((title as string).length).toBeGreaterThan(0);
    }

    // All titles should be unique
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });
});

// ============================================================================
// 2.4.3 Focus Order — Logical tab order
// ============================================================================
describe("WCAG 2.4.3 — Focus order", () => {
  it("no positive tabIndex values (which disrupt natural order)", () => {
    for (const page of PAGE_FILES) {
      const content = readFile(page);
      // tabIndex={-1} is OK (removes from tab order), positive values are not
      const positiveTabIndex = content.match(/tabIndex=\{(\d+)\}/g);
      if (positiveTabIndex) {
        for (const match of positiveTabIndex) {
          const value = parseInt(match.match(/\d+/)?.[0] ?? "0", 10);
          expect(
            value,
            `${page}: tabIndex={${value}} disrupts natural focus order`,
          ).toBe(0);
        }
      }
    }
  });

  it("honeypot field has tabIndex={-1} to exclude from tab order", () => {
    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    expect(eoiForm).toContain("tabIndex={-1}");
  });
});

// ============================================================================
// 2.4.6 Headings and Labels — Descriptive headings
// ============================================================================
describe("WCAG 2.4.6 — Headings and labels", () => {
  it("all headings use i18n translated text (no hardcoded English)", () => {
    for (const page of PAGE_FILES) {
      const content = readFile(page);
      // All h1/h2/h3 content should use t() function calls
      const headingContents = content.match(
        /<h[123][^>]*>[\s\S]*?<\/h[123]>/g,
      ) ?? [];
      for (const heading of headingContents) {
        const innerText = heading
          .replace(/<[^>]+>/g, "")
          .trim();
        // If there's plain text, it should be "Production City" brand only
        // Also allow JSX expression variables like {heading}, {spec.label}, etc.
        if (innerText && !innerText.includes("{t(") && !innerText.includes("t(\"")) {
          const isJsxExpression = /^\{[a-zA-Z_.[\]()]+\}$/.test(innerText.trim());
          expect(
            innerText === "Production City" || innerText === "" || isJsxExpression,
            `${page}: heading contains hardcoded text: "${innerText}"`,
          ).toBe(true);
        }
      }
    }
  });
});

// ============================================================================
// 2.4.7 Focus Visible — Visible focus indicator
// ============================================================================
describe("WCAG 2.4.7 — Focus visible", () => {
  it("submit button has focus-visible styles", () => {
    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    // The submit button should have focus-visible outline
    expect(eoiForm).toContain("focus-visible:outline-2");
    expect(eoiForm).toContain("focus-visible:outline-ring");
  });

  it("navigation links container exists (focus styles applied by default UA or Tailwind)", () => {
    const nav = readFile(
      "organisms/LandingNavigation/LandingNavigation.tsx",
      UI_ROOT,
    );
    expect(nav).toContain("focus-visible:outline");
  });
});

// ============================================================================
// 3.1.1 Language of Page — <html lang> set correctly
// ============================================================================
describe("WCAG 3.1.1 — Language of page", () => {
  it("layout.tsx sets lang attribute on <html>", () => {
    const layout = readFile("layout.tsx");
    expect(layout).toContain('lang="en"');
  });

  it("I18nProvider dynamically updates document lang attribute", () => {
    const provider = readFile("i18n/context.tsx");
    expect(provider).toContain("document.documentElement.lang = locale");
  });

  it("I18nProvider dynamically updates document dir attribute for RTL", () => {
    const provider = readFile("i18n/context.tsx");
    expect(provider).toContain("document.documentElement.dir = getDirection(locale)");
  });
});

// ============================================================================
// 3.3.1 Error Identification — Form errors identified
// ============================================================================
describe("WCAG 3.3.1 — Error identification", () => {
  it("EOI form displays error message on submission failure", () => {
    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    expect(eoiForm).toContain("status === \"error\"");
    expect(eoiForm).toContain("labels.error");
  });

  it("required form fields have the required attribute", () => {
    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    // Name and email should be required
    const nameInput = eoiForm.match(
      /id="eoi-name"[\s\S]*?\/>/,
    )?.[0];
    expect(nameInput).toContain("required");

    const emailInput = eoiForm.match(
      /id="eoi-email"[\s\S]*?\/>/,
    )?.[0];
    expect(emailInput).toContain("required");
  });
});

// ============================================================================
// 3.3.2 Labels or Instructions — Form fields labeled
// ============================================================================
describe("WCAG 3.3.2 — Labels or instructions", () => {
  it("all visible form inputs have explicit labels", () => {
    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    const visibleInputIds = ["eoi-name", "eoi-email", "eoi-company", "eoi-category", "eoi-message", "eoi-consent", "eoi-updates"];
    for (const id of visibleInputIds) {
      expect(
        eoiForm,
        `EOIForm: input id="${id}" should have a label with htmlFor="${id}"`,
      ).toContain(`htmlFor="${id}"`);
    }
  });

  it("search input in FAQ has aria-label", () => {
    const faqSection = readFile(
      "organisms/FAQSection/FAQSection.tsx",
      UI_ROOT,
    );
    expect(faqSection).toContain("aria-label={searchPlaceholder}");
  });
});

// ============================================================================
// 4.1.2 Name, Role, Value — Custom components have correct ARIA
// ============================================================================
describe("WCAG 4.1.2 — Name, role, value", () => {
  it("language switcher uses correct ARIA roles", () => {
    const switcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    expect(switcher).toContain('aria-haspopup="menu"');
    expect(switcher).toContain('role="menu"');
    expect(switcher).toContain('role="menuitemradio"');
    expect(switcher).toContain("aria-checked=");
  });

  it("FAQ disclosure uses correct ARIA pattern", () => {
    const faqItem = readFile("molecules/FAQItem/FAQItem.tsx", UI_ROOT);
    expect(faqItem).toContain("aria-expanded={isOpen}");
    expect(faqItem).toContain("aria-controls={panelId}");
    expect(faqItem).toContain('role="region"');
    expect(faqItem).toContain("aria-labelledby={triggerId}");
  });

  it("honeypot field has aria-hidden to exclude from accessibility tree", () => {
    const eoiForm = readFile("molecules/EOIForm/EOIForm.tsx", UI_ROOT);
    expect(eoiForm).toContain('aria-hidden="true"');
  });
});

// ============================================================================
// RTL-Specific Accessibility
// ============================================================================
describe("RTL accessibility", () => {
  it("Arabic locale is configured with RTL direction", () => {
    const i18nIndex = readFile("i18n/index.ts");
    // Should map "ar" to "rtl"
    expect(i18nIndex).toContain("ar");
    expect(i18nIndex).toContain("rtl");
  });

  it("language switcher uses CSS logical properties (not left/right)", () => {
    const switcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    // Should use "end-0" or "start-0" instead of "right-0"/"left-0"
    expect(switcher).toContain("end-0");
    expect(switcher).not.toContain("right-0");
    expect(switcher).not.toContain("left-0");
  });

  it("FAQ item arrow uses logical margin (ms- not ml-)", () => {
    const faqItem = readFile("molecules/FAQItem/FAQItem.tsx", UI_ROOT);
    expect(faqItem).toContain("ms-4");
    expect(faqItem).not.toMatch(/\bml-\d/);
  });

  it("FAQ item text uses text-start for RTL alignment", () => {
    const faqItem = readFile("molecules/FAQItem/FAQItem.tsx", UI_ROOT);
    expect(faqItem).toContain("text-start");
  });

  it("language menu items use text-start for RTL alignment", () => {
    const switcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    expect(switcher).toContain("text-start");
  });

  it("all 10 locale files exist", () => {
    const locales = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"];
    for (const locale of locales) {
      const filePath = resolve(APP_ROOT, `i18n/${locale}.json`);
      expect(
        () => readFileSync(filePath, "utf-8"),
        `Missing locale file: ${locale}.json`,
      ).not.toThrow();
    }
  });
});

// ============================================================================
// Navigation landmark structure
// ============================================================================
describe("Landmark regions", () => {
  it("LandingPageTemplate uses <main> landmark", () => {
    const template = readFile(
      "templates/LandingPageTemplate/LandingPageTemplate.tsx",
      UI_ROOT,
    );
    expect(template).toContain("<main");
  });

  it("navigation uses <nav> landmark with aria-label", () => {
    const nav = readFile(
      "organisms/LandingNavigation/LandingNavigation.tsx",
      UI_ROOT,
    );
    expect(nav).toContain("<nav");
    expect(nav).toContain('aria-label="Main navigation"');
  });

  it("footer uses appropriate structure", () => {
    const footer = readFile(
      "organisms/LandingFooter/LandingFooter.tsx",
      UI_ROOT,
    );
    expect(footer).toContain("<footer");
  });

  it("forward-looking disclaimer uses <aside> landmark", () => {
    const disclaimer = readFile(
      "organisms/ForwardLookingDisclaimer/ForwardLookingDisclaimer.tsx",
      UI_ROOT,
    );
    expect(disclaimer).toContain("<aside");
    expect(disclaimer).toContain('aria-label="Disclaimer"');
  });
});

// ============================================================================
// Decorative vs meaningful content
// ============================================================================
describe("Decorative content handling", () => {
  it("language switcher globe icon is aria-hidden", () => {
    const switcher = readFile(
      "molecules/LanguageSwitcher/LanguageSwitcher.tsx",
      UI_ROOT,
    );
    // The globe icon should be decorative
    expect(switcher).toContain('aria-hidden="true"');
  });

  it("FAQ expand/collapse arrows are aria-hidden", () => {
    const faqItem = readFile("molecules/FAQItem/FAQItem.tsx", UI_ROOT);
    expect(faqItem).toContain('aria-hidden="true"');
  });

  it("AcknowledgementOfCountry shared component has region role (Finding #22)", () => {
    const aoc = readFile(
      "molecules/AcknowledgementOfCountry/AcknowledgementOfCountry.tsx",
      UI_ROOT,
    );
    expect(aoc).toContain('role="region"');
    expect(aoc).toContain("aria-labelledby");
  });
});
