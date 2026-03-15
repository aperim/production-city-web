import { describe, it, expect } from "vitest";
import {
  SUPPORTED_LOCALES,
  LOCALE_META,
  isSupportedLocale,
  getDirection,
  getOgLocale,
} from "../i18n-constants.js";

describe("i18n-constants", () => {
  describe("SUPPORTED_LOCALES", () => {
    it("contains all 10 locales", () => {
      expect(SUPPORTED_LOCALES).toHaveLength(10);
      expect([...SUPPORTED_LOCALES]).toEqual(
        expect.arrayContaining(["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"]),
      );
    });
  });

  describe("LOCALE_META", () => {
    it("has entries for all supported locales", () => {
      const codes = LOCALE_META.map((m) => m.code);
      for (const locale of SUPPORTED_LOCALES) {
        expect(codes).toContain(locale);
      }
    });

    it("each entry has required fields", () => {
      for (const meta of LOCALE_META) {
        expect(meta.code).toBeDefined();
        expect(meta.name).toBeDefined();
        expect(meta.nativeName).toBeDefined();
        expect(meta.direction).toMatch(/^(ltr|rtl)$/);
        expect(meta.ogLocale).toBeDefined();
      }
    });
  });

  describe("isSupportedLocale()", () => {
    it("returns true for supported locales", () => {
      for (const locale of SUPPORTED_LOCALES) {
        expect(isSupportedLocale(locale)).toBe(true);
      }
    });

    it("returns false for unsupported locales", () => {
      expect(isSupportedLocale("de")).toBe(false);
      expect(isSupportedLocale("xx")).toBe(false);
      expect(isSupportedLocale("")).toBe(false);
      expect(isSupportedLocale("EN")).toBe(false);
    });
  });

  describe("getDirection()", () => {
    it("returns rtl for Arabic", () => {
      expect(getDirection("ar")).toBe("rtl");
    });

    it("returns ltr for all other locales", () => {
      for (const locale of SUPPORTED_LOCALES) {
        if (locale === "ar") continue;
        expect(getDirection(locale)).toBe("ltr");
      }
    });
  });

  describe("getOgLocale()", () => {
    it("returns correct mapping for each locale", () => {
      expect(getOgLocale("en")).toBe("en_US");
      expect(getOgLocale("zh")).toBe("zh_CN");
      expect(getOgLocale("ar")).toBe("ar_SA");
      expect(getOgLocale("es")).toBe("es_419");
      expect(getOgLocale("pt")).toBe("pt_BR");
      expect(getOgLocale("ja")).toBe("ja_JP");
    });
  });
});
