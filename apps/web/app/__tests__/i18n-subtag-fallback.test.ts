/**
 * Tests for BCP 47 sub-tag fallback resolution.
 * @see Issue #277
 */

import { describe, it, expect } from "vitest";
import { resolveSubTag } from "../i18n/subtag-fallback.js";

describe("i18n subtag fallback", () => {
  it("pt-BR → pt", () => {
    expect(resolveSubTag("pt-BR")).toBe("pt");
  });

  it("zh-Hans-CN → zh", () => {
    expect(resolveSubTag("zh-Hans-CN")).toBe("zh");
  });

  it("en-US → en", () => {
    expect(resolveSubTag("en-US")).toBe("en");
  });

  it("ar-EG → ar", () => {
    expect(resolveSubTag("ar-EG")).toBe("ar");
  });

  it("de → null (unsupported)", () => {
    expect(resolveSubTag("de")).toBeNull();
  });

  it("invalid → null", () => {
    expect(resolveSubTag("invalid")).toBeNull();
  });

  it("empty string → null", () => {
    expect(resolveSubTag("")).toBeNull();
  });

  it("handles lowercase sub-tags", () => {
    expect(resolveSubTag("zh-hans-cn")).toBe("zh");
  });

  it("ja-JP → ja", () => {
    expect(resolveSubTag("ja-JP")).toBe("ja");
  });

  it("fr-CA → fr", () => {
    expect(resolveSubTag("fr-CA")).toBe("fr");
  });

  it("bn-IN → bn", () => {
    expect(resolveSubTag("bn-IN")).toBe("bn");
  });

  it("ru-RU → ru", () => {
    expect(resolveSubTag("ru-RU")).toBe("ru");
  });

  it("es-419 → es", () => {
    expect(resolveSubTag("es-419")).toBe("es");
  });
});
