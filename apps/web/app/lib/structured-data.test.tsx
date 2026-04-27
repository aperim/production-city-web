import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DublinCoreMeta } from "./structured-data";

const localeState = vi.hoisted(() => ({ locale: "en" }));

vi.mock("../i18n/context", () => ({
  useTranslation: () => ({
    locale: localeState.locale,
    t: (key: string) => key,
    direction: localeState.locale === "ar" ? "rtl" : "ltr",
    setLocale: vi.fn(),
  }),
}));

function dcMeta(name: string) {
  return document.head.querySelector(`meta[name="${name}"]`)?.getAttribute("content");
}

function dcMetaCount() {
  return document.head.querySelectorAll('meta[name^="DC."]').length;
}

describe("DublinCoreMeta", () => {
  beforeEach(() => {
    localeState.locale = "en";
  });

  afterEach(() => {
    cleanup();
    document.head.querySelectorAll('meta[name^="DC."]').forEach((element) => element.remove());
  });

  it("injects page-level Dublin Core meta tags and removes them on unmount", async () => {
    const { unmount } = render(
      <DublinCoreMeta
        title="Privacy — Production City"
        creator="Production City Legal"
        subject="privacy, legal, data protection"
        description="Privacy policy for Production City."
        type="Text"
        path="/privacy"
        date="2026-04-27"
      />,
    );

    await waitFor(() => {
      expect(dcMeta("DC.title")).toBe("Privacy — Production City");
      expect(dcMeta("DC.creator")).toBe("Production City Legal");
      expect(dcMeta("DC.subject")).toBe("privacy, legal, data protection");
      expect(dcMeta("DC.description")).toBe("Privacy policy for Production City.");
      expect(dcMeta("DC.date")).toBe("2026-04-27");
      expect(dcMeta("DC.type")).toBe("Text");
      expect(dcMeta("DC.identifier")).toBe("https://production.city/privacy");
    });

    unmount();

    expect(dcMetaCount()).toBe(0);
  });

  it("uses locale-prefixed canonical identifiers and replaces old tags on update", async () => {
    localeState.locale = "fr";

    const { rerender } = render(
      <DublinCoreMeta
        title="FAQ — Production City"
        description="Questions fréquentes."
        type="InteractiveResource"
        path="/faq"
      />,
    );

    await waitFor(() => {
      expect(dcMeta("DC.identifier")).toBe("https://production.city/fr/faq");
      expect(dcMeta("DC.type")).toBe("InteractiveResource");
    });

    rerender(
      <DublinCoreMeta
        title="Contact — Production City"
        description="Contactez Production City."
        type="InteractiveResource"
        path="/contact"
      />,
    );

    await waitFor(() => {
      expect(dcMeta("DC.title")).toBe("Contact — Production City");
      expect(dcMeta("DC.description")).toBe("Contactez Production City.");
      expect(dcMeta("DC.identifier")).toBe("https://production.city/fr/contact");
      expect(document.head.querySelectorAll('meta[name="DC.title"]')).toHaveLength(1);
      expect(document.head.querySelectorAll('meta[name="DC.identifier"]')).toHaveLength(1);
    });
  });
});
