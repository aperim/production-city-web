/**
 * Tests for E.164 phone number validation.
 */

import { describe, it, expect } from "vitest";
import { isValidE164, normalizeToE164 } from "../lib/phone.js";

describe("isValidE164", () => {
  it("accepts valid E.164 numbers", () => {
    expect(isValidE164("+14155552671")).toBe(true);
    expect(isValidE164("+61400000000")).toBe(true);
    expect(isValidE164("+8613800138000")).toBe(true);
    expect(isValidE164("+1")).toBe(false); // too short (only country code)
    expect(isValidE164("+12")).toBe(true); // minimum 2 digits after +
  });

  it("rejects numbers without +", () => {
    expect(isValidE164("14155552671")).toBe(false);
  });

  it("rejects numbers starting with +0", () => {
    expect(isValidE164("+0123456789")).toBe(false);
  });

  it("rejects numbers with spaces", () => {
    expect(isValidE164("+1 415 555 2671")).toBe(false);
  });

  it("rejects numbers exceeding 15 digits", () => {
    expect(isValidE164("+1234567890123456")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidE164("")).toBe(false);
  });

  it("rejects letters", () => {
    expect(isValidE164("+1234abc")).toBe(false);
  });
});

describe("normalizeToE164", () => {
  it("normalizes by stripping spaces", () => {
    expect(normalizeToE164("+1 415 555 2671")).toBe("+14155552671");
  });

  it("normalizes by stripping dashes", () => {
    expect(normalizeToE164("+1-415-555-2671")).toBe("+14155552671");
  });

  it("normalizes by stripping parentheses", () => {
    expect(normalizeToE164("+1 (415) 555-2671")).toBe("+14155552671");
  });

  it("adds + prefix for digit-only input", () => {
    expect(normalizeToE164("14155552671")).toBe("+14155552671");
  });

  it("returns null for invalid input", () => {
    expect(normalizeToE164("not-a-number")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeToE164("")).toBeNull();
  });

  it("strips dots", () => {
    expect(normalizeToE164("+1.415.555.2671")).toBe("+14155552671");
  });
});
