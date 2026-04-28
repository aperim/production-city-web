// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Home page (#92, #344) — structural TDD tests.
 *
 * Validates that the rewritten home page matches the reference design
 * (reference/index.html) with editorial sections, IP lifecycle diagram,
 * facilities tiles, audience routing, and retained EOI/acknowledgement.
 *
 * String content checks use t() key assertions rather than hardcoded
 * English strings since all copy is now internationalised (#344).
 */

const HOME_PATH = resolve(import.meta.dirname, "..", "pages", "home.tsx");

function readHome(): string {
  return readFileSync(HOME_PATH, "utf-8");
}

describe("Home page — component imports", () => {
  it("imports ScrollRevealSection from the UI package", () => {
    expect(readHome()).toContain("ScrollRevealSection");
  });

  it("imports EOISection from the UI package", () => {
    expect(readHome()).toContain("EOISection");
  });

  it("imports LandingPageTemplate from the UI package", () => {
    expect(readHome()).toContain("LandingPageTemplate");
  });
});

describe("Home page — Hero section", () => {
  it("has a full-viewport hero with display headline via t()", () => {
    const src = readHome();
    expect(src).toContain("min-h-dvh");
    expect(src).toContain("home.hero.heading");
  });

  it("has hero eyebrow with brand name (non-translatable)", () => {
    const src = readHome();
    expect(src).toContain("Production City™");
  });

  it("has hero CTAs for facilities and EOI via t()", () => {
    const src = readHome();
    expect(src).toContain("home.hero.ctaFacilities");
    expect(src).toContain("home.hero.ctaEoi");
    expect(src).toContain("#eoi-section");
  });

  it("has location strip via t()", () => {
    const src = readHome();
    expect(src).toContain("home.hero.locations");
  });

  it("has hero subtitle via t()", () => {
    expect(readHome()).toContain("home.hero.subtitle");
  });

  it("has scroll indicator via t()", () => {
    expect(readHome()).toContain("home.hero.scrollIndicator");
  });
});

describe("Home page — Operating model section", () => {
  it("has operating model section with heading via t()", () => {
    const src = readHome();
    expect(src).toContain("home.operatingModel.sectionLabel");
    expect(src).toContain("home.operatingModel.heading");
  });

  it("includes four operating pillars via t()", () => {
    const src = readHome();
    expect(src).toContain("home.operatingModel.pillars.realtime.title");
    expect(src).toContain("home.operatingModel.pillars.oneOperator.title");
    expect(src).toContain("home.operatingModel.pillars.sharedPipeline.title");
    expect(src).toContain("home.operatingModel.pillars.closedLoop.title");
  });

  it("includes stat strip via t()", () => {
    const src = readHome();
    expect(src).toContain("home.operatingModel.stats.operator");
    expect(src).toContain("home.operatingModel.stats.lanes");
    expect(src).toContain("home.operatingModel.stats.stations");
    expect(src).toContain("home.operatingModel.stats.loop");
  });

  it("includes signal diagram component", () => {
    const src = readHome();
    expect(src).toContain("SignalDiagram");
  });

  it("has body paragraphs via t()", () => {
    const src = readHome();
    expect(src).toContain("home.operatingModel.body1");
    expect(src).toContain("home.operatingModel.body2");
  });
});

describe("Home page — Facilities preview section", () => {
  it("has facilities section label via t()", () => {
    const src = readHome();
    expect(src).toContain("home.facilitiesSection.sectionLabel");
    expect(src).toContain("home.facilitiesSection.heading");
  });

  it("includes all four facility types via t()", () => {
    const src = readHome();
    expect(src).toContain("home.facilitiesSection.tiles.screenStages.label");
    expect(src).toContain("home.facilitiesSection.tiles.commercialStages.label");
    expect(src).toContain("home.facilitiesSection.tiles.broadcastTheatre.label");
    expect(src).toContain("home.facilitiesSection.controlRoom.label");
  });
});

describe("Home page — First Nations section", () => {
  it("has First Nations approach section via t()", () => {
    const src = readHome();
    expect(src).toContain("home.firstNations.sectionLabel");
    expect(src).toContain("home.firstNations.heading");
  });

  it("has First Nations prose via t()", () => {
    const src = readHome();
    expect(src).toContain("home.firstNations.prose");
    expect(src).toContain("home.firstNations.proseMatthew");
  });

  it("links to /first-nations page", () => {
    expect(readHome()).toContain("/first-nations");
  });
});

describe("Home page — Pull quote section", () => {
  it("has first-site-advantage pull quote via t()", () => {
    const src = readHome();
    expect(src).toContain("home.firstSite.sectionLabel");
    expect(src).toContain("home.firstSite.quote");
    expect(src).toContain("home.firstSite.quoteHighlight");
  });
});

describe("Home page — Audience routing section", () => {
  it("has audience routing section via t()", () => {
    const src = readHome();
    expect(src).toContain("home.audience.sectionLabel");
    expect(src).toContain("home.audience.heading");
  });

  it("includes four audience cards via t()", () => {
    const src = readHome();
    expect(src).toContain("home.audience.cards.producers.title");
    expect(src).toContain("home.audience.cards.government.title");
    expect(src).toContain("home.audience.cards.investors.title");
    expect(src).toContain("home.audience.cards.techPartners.title");
  });

  it("audience enter CTA via t()", () => {
    expect(readHome()).toContain("home.audience.enter");
  });

  it("audience cards link to /contact?category= paths", () => {
    const src = readHome();
    expect(src).toContain("/contact?category=producer");
    expect(src).toContain("/contact?category=investor");
    expect(src).toContain("/contact?category=partner");
  });
});

describe("Home page — Chorus section", () => {
  it("has chorus via t()", () => {
    expect(readHome()).toContain("home.chorus.text");
  });
});

describe("Home page — EOI section", () => {
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

describe("Home page — Infrastructure", () => {
  it('uses "use client" directive', () => {
    expect(readHome()).toContain('"use client"');
  });

  it("uses I18nProvider wrapper", () => {
    expect(readHome()).toContain("I18nProvider");
  });

  it("accepts and forwards serverLocale prop to I18nProvider", () => {
    const src = readHome();
    expect(src).toContain("serverLocale");
  });

  it("uses useTranslation hook for remaining i18n text", () => {
    expect(readHome()).toContain("useTranslation");
  });

  it("wraps content sections in ScrollRevealSection", () => {
    const src = readHome();
    const count = (src.match(/<ScrollRevealSection/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });

  it("does not use hardcoded English heading strings as const values", () => {
    const src = readHome();
    expect(src).not.toContain('"We make stories."');
    expect(src).not.toContain('"One operator. One campus. Script to delivery."');
    expect(src).not.toContain('"Built together. Not retrofitted."');
    expect(src).not.toContain('"Four doors in."');
    expect(src).not.toContain('"Sequenced. Not simultaneous."');
    expect(src).not.toContain('"Embedded, not added on."');
  });
});

describe("Home page — serverLocale wiring", () => {
  const PAGE_PATH = resolve(import.meta.dirname, "..", "page.tsx");

  it("root page.tsx passes serverLocale to HomePage", () => {
    const src = readFileSync(PAGE_PATH, "utf-8");
    expect(src).toContain("serverLocale");
  });
});
