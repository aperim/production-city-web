import { describe, expect, it } from "vitest";
import { buildLocaleUrl } from "./url-utils";

describe("LanguageSwitcher URL generation", () => {
  it("generates /zh/facilities when switching to zh on /facilities", () => {
    expect(buildLocaleUrl("zh", "/facilities")).toBe("/zh/facilities");
  });

  it("preserves query params and hash", () => {
    expect(buildLocaleUrl("zh", "/facilities?query=1#section")).toBe(
      "/zh/facilities?query=1#section",
    );
  });

  it("generates / (no prefix) when switching to English", () => {
    expect(buildLocaleUrl("en", "/facilities")).toBe("/facilities");
  });

  it("handles root path / → /zh/", () => {
    expect(buildLocaleUrl("zh", "/")).toBe("/zh/");
  });

  it("handles English on root path", () => {
    expect(buildLocaleUrl("en", "/")).toBe("/");
  });

  it("handles path with trailing slash normalization", () => {
    expect(buildLocaleUrl("zh", "/facilities/")).toBe("/zh/facilities");
  });

  it("strips existing locale prefix before building new URL", () => {
    expect(buildLocaleUrl("ja", "/zh/facilities")).toBe("/ja/facilities");
  });

  it("preserves complex query params", () => {
    expect(buildLocaleUrl("fr", "/contact?ref=footer&utm_source=email#form")).toBe(
      "/fr/contact?ref=footer&utm_source=email#form",
    );
  });

  it("handles English stripping existing locale prefix", () => {
    expect(buildLocaleUrl("en", "/ar/facilities")).toBe("/facilities");
  });
});
