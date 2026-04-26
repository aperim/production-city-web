// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Home page (#92) — structural TDD tests.
 *
 * Validates that the rewritten home page matches the reference design
 * (reference/index.html) with editorial sections, IP lifecycle diagram,
 * facilities tiles, audience routing, and retained EOI/acknowledgement.
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

  it("imports AcknowledgementOfCountry from the UI package", () => {
    expect(readHome()).toContain("AcknowledgementOfCountry");
  });

  it("imports LandingPageTemplate from the UI package", () => {
    expect(readHome()).toContain("LandingPageTemplate");
  });
});

describe("Home page — Hero section", () => {
  it("has a full-viewport hero with display headline", () => {
    const src = readHome();
    expect(src).toContain("min-h-dvh");
    expect(src).toContain("We make stories.");
  });

  it("has hero eyebrow with brand and locations", () => {
    const src = readHome();
    expect(src).toContain("Production City™");
    expect(src).toContain("Sydney · Switzerland · Singapore · Africa");
  });

  it("has hero CTAs for facilities and EOI", () => {
    const src = readHome();
    expect(src).toContain("See the facilities");
    expect(src).toContain("Register interest");
    expect(src).toContain("#eoi-section");
  });
});

describe("Home page — Operating model section", () => {
  it("has operating model section with heading", () => {
    const src = readHome();
    expect(src).toContain("01 — Operating model");
    expect(src).toContain("One operator. One campus. Script to delivery.");
  });

  it("includes four operating pillars", () => {
    const src = readHome();
    expect(src).toContain("One IP · two formats");
    expect(src).toContain("One operator · one campus");
    expect(src).toContain("Shared pipeline, specialised finishes");
    expect(src).toContain("Closed-loop canon");
  });

  it("includes stat strip with key metrics", () => {
    const src = readHome();
    expect(src).toContain("operator");
    expect(src).toContain("lanes, in parallel");
    expect(src).toContain("stations from idea to audience");
  });

  it("includes signal diagram component", () => {
    const src = readHome();
    expect(src).toContain("SignalDiagram");
  });
});

describe("Home page — Facilities preview section", () => {
  it("has facilities section with tile grid", () => {
    const src = readHome();
    expect(src).toContain("02 — Facilities");
    expect(src).toContain("Built together. Not retrofitted.");
  });

  it("includes all four facility types", () => {
    const src = readHome();
    expect(src).toContain("SCREEN SOUND STAGES");
    expect(src).toContain("COMMERCIAL SOUND STAGES");
    expect(src).toContain("BROADCAST THEATRE");
    expect(src).toContain("BROADCAST CONTROL ROOM");
  });
});

describe("Home page — Services section", () => {
  it("has services section listing disciplines", () => {
    const src = readHome();
    expect(src).toContain("03 — Services");
    expect(src).toContain("VIRTUAL PRODUCTION");
    expect(src).toContain("POST-PRODUCTION");
  });
});

describe("Home page — First Nations section", () => {
  it("has First Nations approach section", () => {
    const src = readHome();
    expect(src).toContain("04 — First Nations approach");
    expect(src).toContain("Embedded, not added on.");
  });

  it("references Matthew Compton and Wiradjuri heritage", () => {
    const src = readHome();
    expect(src).toContain("Matthew Compton");
    expect(src).toContain("Wiradjuri");
  });
});

describe("Home page — Pull quote section", () => {
  it("has first-site-advantage pull quote", () => {
    const src = readHome();
    expect(src).toContain("05 — FIRST SITE ADVANTAGE");
    expect(src).toContain("Hosting the first site is not hosting a branch");
  });
});

describe("Home page — Network section", () => {
  it("has network sequence section with region table", () => {
    const src = readHome();
    expect(src).toContain("06 — The sequence");
    expect(src).toContain("Sequenced. Not simultaneous.");
  });

  it("includes network map component", () => {
    expect(readHome()).toContain("NetworkMap");
  });

  it("lists all regions with status", () => {
    const src = readHome();
    expect(src).toContain("Australia");
    expect(src).toContain("Switzerland");
    expect(src).toContain("Singapore");
  });
});

describe("Home page — Audience routing section", () => {
  it("has audience routing section", () => {
    const src = readHome();
    expect(src).toContain("07 — Who we work with");
    expect(src).toContain("Four doors in.");
  });

  it("includes four audience cards", () => {
    const src = readHome();
    expect(src).toContain("For producers and studios");
    expect(src).toContain("For government");
    expect(src).toContain("For investors");
    expect(src).toContain("For technology partners");
  });
});

describe("Home page — Chorus section", () => {
  it("has chorus/closing statement", () => {
    expect(readHome()).toContain("We make stories");
  });
});

describe("Home page — Acknowledgement of Country", () => {
  it("uses AcknowledgementOfCountry shared component", () => {
    expect(readHome()).toContain("<AcknowledgementOfCountry");
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

  it("uses useTranslation hook for remaining i18n text", () => {
    expect(readHome()).toContain("useTranslation");
  });

  it("wraps content sections in ScrollRevealSection", () => {
    const src = readHome();
    const count = (src.match(/<ScrollRevealSection/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });
});
