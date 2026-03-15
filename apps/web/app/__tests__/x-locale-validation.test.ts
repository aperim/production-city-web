/**
 * Tests for X-Locale header validation at the app boundary.
 * @see Issue #277 Finding #4
 */

import { describe, it, expect } from "vitest";
import { validateXLocale } from "../i18n/x-locale-validation.js";

describe("X-Locale validation at app boundary (Finding #4)", () => {
  it("accepts valid supported locales", () => {
    expect(validateXLocale("en")).toBe("en");
    expect(validateXLocale("zh")).toBe("zh");
    expect(validateXLocale("ar")).toBe("ar");
  });

  it("falls back to en for invalid locale", () => {
    expect(validateXLocale("xx")).toBe("en");
    expect(validateXLocale("de")).toBe("en");
  });

  it("falls back to en for null/undefined", () => {
    expect(validateXLocale(null)).toBe("en");
    expect(validateXLocale(undefined)).toBe("en");
  });

  it("falls back to en for oversized header", () => {
    expect(validateXLocale("z".repeat(100))).toBe("en");
  });

  it("falls back to en for empty string", () => {
    expect(validateXLocale("")).toBe("en");
  });
});
