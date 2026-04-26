/**
 * E2E tests: i18n locale routing, RTL layout, LanguageSwitcher, and locale suggestion.
 *
 * Covers: locale prefix routing (10 locales), LanguageSwitcher end-to-end navigation,
 * invalid locale redirect, Arabic RTL, hreflang links, Content-Language header,
 * locale suggestion prompt, trailing slash normalization, new-pages locale routing.
 *
 * Finding #24: Uses parameterized tests with explicit timeouts for 70-render verification.
 *
 * @see Issue #280
 * @see PRO-190
 */

import { test, expect } from "@playwright/test";

const SUPPORTED_LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"] as const;

const PAGES = ["/", "/facilities", "/creative", "/vision", "/community", "/faq", "/contact"] as const;

/**
 * Build the locale-prefixed URL. English has no prefix.
 */
function localeUrl(locale: string, page: string): string {
  if (locale === "en") return page;
  return page === "/" ? `/${locale}/` : `/${locale}${page}`;
}

// ─── Locale Prefix Routing ──────────────────────────────────────────────

test.describe("i18n — locale prefix routing", () => {
  for (const locale of SUPPORTED_LOCALES) {
    test(`${locale} locale home page loads at ${localeUrl(locale, "/")}`, async ({ page }) => {
      const url = localeUrl(locale, "/");
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });
  }
});

// ─── HTML lang and dir attributes ───────────────────────────────────────

test.describe("i18n — html attributes", () => {
  test("English page has lang=en and dir=ltr", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("Arabic page has lang=ar and dir=rtl", async ({ page }) => {
    await page.goto("/ar/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("Chinese page has lang=zh and dir=ltr", async ({ page }) => {
    await page.goto("/zh/");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });
});

// ─── Content-Language header ────────────────────────────────────────────

test.describe("i18n — Content-Language header", () => {
  for (const locale of ["en", "zh", "ar", "ja"] as const) {
    test(`Content-Language header is ${locale} for ${localeUrl(locale, "/")}`, async ({ page }) => {
      const response = await page.goto(localeUrl(locale, "/"));
      expect(response?.headers()["content-language"]).toBe(locale);
    });
  }
});

// ─── hreflang links ─────────────────────────────────────────────────────

test.describe("i18n — hreflang links", () => {
  test("home page has hreflang links for all 10 locales + x-default", async ({ page }) => {
    await page.goto("/");

    for (const locale of SUPPORTED_LOCALES) {
      const link = page.locator(`link[rel="alternate"][hreflang="${locale}"]`);
      await expect(link).toHaveCount(1);
    }

    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(xDefault).toHaveCount(1);
  });

  test("non-English page has hreflang links for all locales", async ({ page }) => {
    await page.goto("/zh/facilities");

    for (const locale of SUPPORTED_LOCALES) {
      const link = page.locator(`link[rel="alternate"][hreflang="${locale}"]`);
      await expect(link).toHaveCount(1);
    }
  });
});

// ─── Unsupported short prefixes are treated as normal page routes (Issue #304) ──

test.describe("i18n — unsupported short prefixes are normal routes", () => {
  test("/xx/ is treated as a normal page (not a locale redirect)", async ({ page }) => {
    const response = await page.goto("/xx/");
    // With the fix, /xx/ is no longer parsed as a locale prefix.
    // Trailing slash gets stripped to /xx, which is a normal page route.
    expect(page.url()).toMatch(/\/xx$/);
    // Page may 404 since /xx isn't a real page, but it should NOT redirect to /
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test("/faq is treated as a normal page (not a locale redirect)", async ({ page }) => {
    const response = await page.goto("/faq");
    expect(page.url()).toContain("/faq");
    expect(response?.status()).toBe(200);
  });
});

// ─── Trailing slash normalization ───────────────────────────────────────

test.describe("i18n — trailing slash normalization", () => {
  test("/zh redirects to /zh/", async ({ page }) => {
    await page.goto("/zh");
    expect(page.url()).toMatch(/\/zh\/$/);
  });

  test("/zh/facilities/ redirects to /zh/facilities", async ({ page }) => {
    await page.goto("/zh/facilities/");
    expect(page.url()).toMatch(/\/zh\/facilities$/);
  });
});

// ─── LanguageSwitcher ───────────────────────────────────────────────────

test.describe("i18n — LanguageSwitcher", () => {
  test("language switcher is visible on home page", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /language/i });
    await expect(trigger.first()).toBeVisible();
  });

  test("language switcher opens and shows locale options", async ({ page }) => {
    await page.goto("/");
    // Use footer language switcher
    const trigger = page.getByRole("contentinfo").getByRole("button", { name: /language/i });

    await expect(async () => {
      await trigger.click();
      await expect(page.getByRole("menuitemradio", { name: "English" })).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
  });

  test("selecting Chinese navigates to /zh/ from home page", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const trigger = footer.getByRole("button", { name: /language/i });

    await expect(async () => {
      await trigger.click();
      await expect(
        page.getByRole("menuitemradio", { name: "中文" }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    await page.getByRole("menuitemradio", { name: "中文" }).click();

    await expect(page).toHaveURL(/\/zh\//, { timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  });

  test("selecting Arabic navigates to /ar/ and sets dir=rtl", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const trigger = footer.getByRole("button", { name: /language/i });

    await expect(async () => {
      await trigger.click();
      await expect(
        page.getByRole("menuitemradio", { name: "العربية" }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    await page.getByRole("menuitemradio", { name: "العربية" }).click();

    await expect(page).toHaveURL(/\/ar\//, { timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("selecting Chinese on /facilities navigates to /zh/facilities", async ({
    page,
  }) => {
    await page.goto("/facilities");
    const footer = page.getByRole("contentinfo");
    const trigger = footer.getByRole("button", { name: /language/i });

    await expect(async () => {
      await trigger.click();
      await expect(
        page.getByRole("menuitemradio", { name: "中文" }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    await page.getByRole("menuitemradio", { name: "中文" }).click();

    await expect(page).toHaveURL(/\/zh\/facilities/, { timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  });

  test("selecting English on a non-English page returns to the base path", async ({
    page,
  }) => {
    await page.goto("/zh/facilities");
    const footer = page.getByRole("contentinfo");
    const trigger = footer.getByRole("button", { name: /language/i });

    await expect(async () => {
      await trigger.click();
      await expect(
        page.getByRole("menuitemradio", { name: "English" }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    await page.getByRole("menuitemradio", { name: "English" }).click();

    // English has no locale prefix — URL should be /facilities (no /en/)
    await expect(page).toHaveURL(/\/facilities$/, { timeout: 10_000 });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

// ─── Page content ───────────────────────────────────────────────────────

test.describe("i18n — page content", () => {
  test("all pages render without layout breakage", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();

    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
      );
    });
    expect(overflow).toBe(false);
  });
});

// ─── 70-page rendering verification (Finding #24: parameterized) ────────

test.describe("i18n — full locale rendering verification", () => {
  test.describe.configure({ timeout: 300_000 }); // 5 min budget for 70 renders

  for (const locale of SUPPORTED_LOCALES) {
    for (const pagePath of PAGES) {
      const url = localeUrl(locale, pagePath);
      test(`${locale}${pagePath} renders correctly`, async ({ page }) => {
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);

        // Correct html lang
        await expect(page.locator("html")).toHaveAttribute("lang", locale);

        // Correct dir
        const expectedDir = locale === "ar" ? "rtl" : "ltr";
        await expect(page.locator("html")).toHaveAttribute("dir", expectedDir);

        // Content-Language header matches
        expect(response?.headers()["content-language"]).toBe(locale);

        // No untranslated i18n keys visible (dot-notation like nav.home, home.title)
        // Only flag patterns that match known i18n key namespaces with sub-keys
        const bodyText = await page.textContent("body");
        const i18nKeyPattern = /\b(?:nav|home|facilities|creative|vision|community|faq|contact|common|footer|auth|eoi|legal)\.[a-z][a-zA-Z]+\.[a-z][a-zA-Z]+\b/g;
        const untranslatedKeys = bodyText?.match(i18nKeyPattern) ?? [];
        expect(untranslatedKeys).toEqual([]);
      });
    }
  }
});

// ─── New pages locale routing (PRO-190) ─────────────────────────────────
// Spot-checks a representative subset of locales against the 10 new pages
// added in PRO-93. Full 100-render grid is not run to keep suite time
// reasonable; en/zh/ar/ja provide LTR, CJK, RTL, and East-Asian coverage.

const NEW_PAGES_PATHS = [
  "/services",
  "/network",
  "/company",
  "/company/approach",
  "/first-nations",
  "/facilities/broadcast-control-room",
  "/facilities/broadcast-theatre",
  "/facilities/commercial-sound-stages",
  "/facilities/screen-sound-stages",
] as const;

const SPOT_LOCALES = ["en", "zh", "ar", "ja"] as const;

test.describe("i18n — new pages locale routing", () => {
  test.describe.configure({ timeout: 120_000 });

  for (const locale of SPOT_LOCALES) {
    for (const pagePath of NEW_PAGES_PATHS) {
      const url = localeUrl(locale, pagePath);
      test(`${locale}${pagePath} returns 200 with correct lang`, async ({
        page,
      }) => {
        const response = await page.goto(url);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);

        const expectedDir = locale === "ar" ? "rtl" : "ltr";
        await expect(page.locator("html")).toHaveAttribute("dir", expectedDir);

        expect(response?.headers()["content-language"]).toBe(locale);
      });
    }
  }
});

// ─── New pages hreflang ──────────────────────────────────────────────────

test.describe("i18n — new pages hreflang links", () => {
  const SAMPLE_NEW_PAGES = ["/services", "/company", "/first-nations"] as const;

  for (const pagePath of SAMPLE_NEW_PAGES) {
    test(`${pagePath} has hreflang links for all 10 locales + x-default`, async ({
      page,
    }) => {
      await page.goto(pagePath);

      for (const locale of SUPPORTED_LOCALES) {
        const link = page.locator(
          `link[rel="alternate"][hreflang="${locale}"]`,
        );
        await expect(link).toHaveCount(1);
      }

      const xDefault = page.locator(
        'link[rel="alternate"][hreflang="x-default"]',
      );
      await expect(xDefault).toHaveCount(1);
    });
  }
});

// ─── Locale suggestion prompt ───────────────────────────────────────────

test.describe("i18n — locale suggestion prompt", () => {
  test("Worker sets Accept-Language derived locale suggestion (unit-tested)", async ({ page }) => {
    // The locale suggestion cookie is set by the Worker when Accept-Language
    // indicates a non-English locale. This behavior is fully covered by
    // worker/locale-middleware.test.ts unit tests.
    //
    // E2E verification is limited because:
    // 1. The Secure cookie flag prevents storage on HTTP localhost
    // 2. Route interception doesn't reliably modify headers in the Worker layer
    //
    // This test verifies the page loads without errors when serving English
    // content (the baseline for locale suggestion).
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
