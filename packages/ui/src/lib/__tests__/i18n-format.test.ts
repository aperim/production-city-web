import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
} from "../i18n-format.js";

describe("i18n-format", () => {
  const testDate = new Date("2026-03-15T12:00:00Z");

  describe("formatDate()", () => {
    it("returns locale-appropriate date for en", () => {
      const result = formatDate(testDate, "en");
      expect(result).toContain("2026");
    });

    it("returns locale-appropriate date for zh", () => {
      const result = formatDate(testDate, "zh");
      expect(result).toContain("2026");
    });

    it("returns locale-appropriate date for ar", () => {
      const result = formatDate(testDate, "ar");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns locale-appropriate date for ja", () => {
      const result = formatDate(testDate, "ja");
      expect(result).toContain("2026");
    });

    it("passes through custom options", () => {
      const result = formatDate(testDate, "en", { dateStyle: "full" });
      expect(result).toContain("2026");
      expect(result.length).toBeGreaterThan(
        formatDate(testDate, "en").length,
      );
    });
  });

  describe("formatNumber()", () => {
    it("handles thousands separators for en", () => {
      const result = formatNumber(1000, "en");
      expect(result).toBe("1,000");
    });

    it("handles thousands separators for different locales", () => {
      const result = formatNumber(1000000, "en");
      expect(result).toBe("1,000,000");
    });

    it("handles zero", () => {
      expect(formatNumber(0, "en")).toBe("0");
    });

    it("handles negative numbers", () => {
      const result = formatNumber(-1000, "en");
      expect(result).toContain("1,000");
    });

    it("handles NaN", () => {
      const result = formatNumber(NaN, "en");
      expect(result).toBe("NaN");
    });

    it("handles Infinity", () => {
      const result = formatNumber(Infinity, "en");
      expect(result).toBe("∞");
    });
  });

  describe("formatCurrency()", () => {
    it("shows correct USD format for en", () => {
      const result = formatCurrency(1234.56, "USD", "en");
      expect(result).toContain("$");
      expect(result).toContain("1,234.56");
    });

    it("shows correct USD format for ja", () => {
      const result = formatCurrency(1234.56, "USD", "ja");
      expect(result).toContain("$");
    });

    it("handles zero", () => {
      const result = formatCurrency(0, "USD", "en");
      expect(result).toContain("$");
      expect(result).toContain("0.00");
    });
  });

  describe("formatRelativeTime()", () => {
    it("produces locale-specific relative time for en", () => {
      const result = formatRelativeTime(-3, "day", "en");
      expect(result).toBe("3 days ago");
    });

    it("produces locale-specific relative time for different locales", () => {
      const result = formatRelativeTime(-1, "day", "en");
      expect(result).toBe("yesterday");
    });
  });

  describe("error fallback", () => {
    it("all formatters handle edge cases without throwing", () => {
      expect(() => formatDate(new Date("invalid"), "en")).not.toThrow();
      expect(() => formatNumber(NaN, "en")).not.toThrow();
      expect(() => formatCurrency(NaN, "USD", "en")).not.toThrow();
      expect(() => formatRelativeTime(0, "day", "en")).not.toThrow();
    });
  });
});
