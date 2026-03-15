/**
 * Tests for slug generation utility.
 */

import { describe, it, expect } from "vitest";
import { slugify, generateUniqueSlug } from "../lib/slug.js";

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("foo bar baz")).toBe("foo-bar-baz");
  });

  it("strips diacritics", () => {
    expect(slugify("café résumé")).toBe("cafe-resume");
  });

  it("removes special characters", () => {
    expect(slugify("hello! @world #2026")).toBe("hello-world-2026");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("handles unicode characters", () => {
    expect(slugify("日本語テスト")).toBe("");
  });

  it("handles mixed unicode and ASCII", () => {
    expect(slugify("Test 日本語 123")).toBe("test-123");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("generateUniqueSlug", () => {
  it("returns base slug when no conflict", async () => {
    const result = await generateUniqueSlug("Hello World", async () => false);
    expect(result).toBe("hello-world");
  });

  it("appends -2 on first conflict", async () => {
    const existing = new Set(["hello-world"]);
    const result = await generateUniqueSlug("Hello World", async (s) => existing.has(s));
    expect(result).toBe("hello-world-2");
  });

  it("appends -3 when -2 also exists", async () => {
    const existing = new Set(["hello-world", "hello-world-2"]);
    const result = await generateUniqueSlug("Hello World", async (s) => existing.has(s));
    expect(result).toBe("hello-world-3");
  });

  it("throws on empty input", async () => {
    await expect(generateUniqueSlug("", async () => false)).rejects.toThrow("Cannot generate slug from empty input");
  });

  it("throws after 100 attempts", async () => {
    await expect(generateUniqueSlug("test", async () => true)).rejects.toThrow("Could not generate unique slug");
  });
});
