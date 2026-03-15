import { describe, it, expect } from "vitest";
import {
  getPluralCategory,
  parseICUPlural,
  resolvePlural,
} from "../i18n/pluralization.js";

describe("getPluralCategory", () => {
  describe("English", () => {
    it("0 -> other", () => expect(getPluralCategory("en", 0)).toBe("other"));
    it("1 -> one", () => expect(getPluralCategory("en", 1)).toBe("one"));
    it("2 -> other", () => expect(getPluralCategory("en", 2)).toBe("other"));
    it("42 -> other", () => expect(getPluralCategory("en", 42)).toBe("other"));
  });

  describe("Arabic (6 forms)", () => {
    it("0 -> zero", () => expect(getPluralCategory("ar", 0)).toBe("zero"));
    it("1 -> one", () => expect(getPluralCategory("ar", 1)).toBe("one"));
    it("2 -> two", () => expect(getPluralCategory("ar", 2)).toBe("two"));
    it("3 -> few", () => expect(getPluralCategory("ar", 3)).toBe("few"));
    it("11 -> many", () => expect(getPluralCategory("ar", 11)).toBe("many"));
    it("100 -> other", () => expect(getPluralCategory("ar", 100)).toBe("other"));
  });

  describe("Russian (one/few/many via Intl.PluralRules)", () => {
    it("0 -> many", () => expect(getPluralCategory("ru", 0)).toBe("many"));
    it("1 -> one", () => expect(getPluralCategory("ru", 1)).toBe("one"));
    it("2 -> few", () => expect(getPluralCategory("ru", 2)).toBe("few"));
    it("5 -> many", () => expect(getPluralCategory("ru", 5)).toBe("many"));
    it("21 -> one", () => expect(getPluralCategory("ru", 21)).toBe("one"));
    it("22 -> few", () => expect(getPluralCategory("ru", 22)).toBe("few"));
    it("100 -> many", () => expect(getPluralCategory("ru", 100)).toBe("many"));
  });

  describe("French (0 is singular per CLDR)", () => {
    it("0 -> one", () => expect(getPluralCategory("fr", 0)).toBe("one"));
    it("1 -> one", () => expect(getPluralCategory("fr", 1)).toBe("one"));
    it("2 -> other", () => expect(getPluralCategory("fr", 2)).toBe("other"));
  });

  describe("Chinese/Japanese (no grammatical plural)", () => {
    it("zh: 0 -> other", () => expect(getPluralCategory("zh", 0)).toBe("other"));
    it("zh: 1 -> other", () => expect(getPluralCategory("zh", 1)).toBe("other"));
    it("zh: 42 -> other", () => expect(getPluralCategory("zh", 42)).toBe("other"));
    it("ja: 0 -> other", () => expect(getPluralCategory("ja", 0)).toBe("other"));
    it("ja: 1 -> other", () => expect(getPluralCategory("ja", 1)).toBe("other"));
  });
});

describe("parseICUPlural", () => {
  it("parses valid ICU plural syntax", () => {
    const result = parseICUPlural("{count, plural, =0 {none} one {# item} other {# items}}");
    expect(result).not.toBeNull();
    expect(result!.variable).toBe("count");
    expect(result!.forms["=0"]).toBe("none");
    expect(result!.forms["one"]).toBe("# item");
    expect(result!.forms["other"]).toBe("# items");
  });

  it("returns null for non-plural strings", () => {
    expect(parseICUPlural("Hello world")).toBeNull();
  });

  it("returns null for malformed ICU strings", () => {
    expect(parseICUPlural("{count, plural, =0 {none}")).toBeNull();
  });

  it("handles all six Arabic plural forms", () => {
    const result = parseICUPlural(
      "{count, plural, zero {no items} one {one item} two {two items} few {# items-few} many {# items-many} other {# items-other}}",
    );
    expect(result).not.toBeNull();
    expect(Object.keys(result!.forms)).toHaveLength(6);
  });

  it("rejects deeply nested braces (bounded nesting - Finding #20)", () => {
    const deep = "{count, plural, one {" + "{".repeat(20) + "x" + "}".repeat(20) + "} other {y}}";
    expect(parseICUPlural(deep)).toBeNull();
  });

  it("handles brace-heavy interpolation params without crashing (Finding #20)", () => {
    expect(() => {
      parseICUPlural("{count, plural, one {{name}} other {{name}s}}");
    }).not.toThrow();
  });
});

describe("resolvePlural", () => {
  it("resolves English one/other", () => {
    const template = "{count, plural, one {# item} other {# items}}";
    expect(resolvePlural(template, { count: 1 }, "en")).toBe("1 item");
    expect(resolvePlural(template, { count: 5 }, "en")).toBe("5 items");
  });

  it("resolves exact match =0", () => {
    const template = "{count, plural, =0 {No items} one {# item} other {# items}}";
    expect(resolvePlural(template, { count: 0 }, "en")).toBe("No items");
  });

  it("falls back to other when requested form is missing", () => {
    const template = "{count, plural, other {# items}}";
    expect(resolvePlural(template, { count: 1 }, "en")).toBe("1 items");
  });

  it("returns the template string for non-ICU strings", () => {
    expect(resolvePlural("Hello world", {}, "en")).toBe("Hello world");
  });

  it("replaces # with the count value", () => {
    const template = "{count, plural, one {# thing} other {# things}}";
    expect(resolvePlural(template, { count: 42 }, "en")).toBe("42 things");
  });

  it("handles Arabic plural resolution", () => {
    const template = "{count, plural, zero {no items} one {one item} two {two items} few {# items-few} many {# items-many} other {# items-other}}";
    expect(resolvePlural(template, { count: 0 }, "ar")).toBe("no items");
    expect(resolvePlural(template, { count: 1 }, "ar")).toBe("one item");
    expect(resolvePlural(template, { count: 2 }, "ar")).toBe("two items");
    expect(resolvePlural(template, { count: 3 }, "ar")).toBe("3 items-few");
    expect(resolvePlural(template, { count: 11 }, "ar")).toBe("11 items-many");
    expect(resolvePlural(template, { count: 100 }, "ar")).toBe("100 items-other");
  });

  it("handles nested interpolation within plural forms", () => {
    const template = "{count, plural, one {# item for {name}} other {# items for {name}}}";
    expect(resolvePlural(template, { count: 1, name: "Alice" }, "en")).toBe("1 item for Alice");
    expect(resolvePlural(template, { count: 3, name: "Bob" }, "en")).toBe("3 items for Bob");
  });
});
