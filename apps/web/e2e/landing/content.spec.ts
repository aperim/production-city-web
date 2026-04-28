/**
 * E2E tests: Landing page content integrity.
 * Validates section presence, FAQ functionality, and contact info.
 */

import { test, expect } from "@playwright/test";

test.describe("Home page content", () => {
  test("displays intro section with heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    // "Production City" appears many times (nav, footer, etc.) — scope to main
    await expect(page.getByRole("main").getByText("Production City").first()).toBeVisible();
  });

  test("displays EOI section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#eoi-section")).toBeVisible();
  });

  test("Acknowledgement of Country renders in footer", async ({ page }) => {
    await page.goto("/");
    // Section removed from home main — rendered once by the shared footer
    await expect(
      page.locator("footer").getByText(/Traditional Owners/i),
    ).toBeVisible();
  });
});

test.describe("Facilities page content", () => {
  test("displays facility sections", async ({ page }) => {
    await page.goto("/facilities");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });
});


test.describe("FAQ page content", () => {
  test("displays FAQ heading", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("displays search input", async ({ page }) => {
    await page.goto("/faq");
    await expect(
      page.getByRole("searchbox"),
    ).toBeVisible();
  });

  test("displays category filter buttons", async ({ page }) => {
    await page.goto("/faq");
    const group = page.getByRole("group");
    await expect(group).toBeVisible();
    // Should have All + 5 category buttons
    const buttons = group.getByRole("button");
    await expect(buttons).toHaveCount(6);
  });

  test("category filtering reduces visible questions", async ({ page }) => {
    await page.goto("/faq");
    const main = page.getByRole("main");
    const faqButtons = main.locator("button[aria-expanded]");
    await expect(faqButtons).toHaveCount(20);

    const group = page.getByRole("group");
    const facilitiesBtn = group.getByRole("button", {
      name: "Facilities",
    });

    // Retry click until hydration completes and event handler is attached
    await expect(async () => {
      await facilitiesBtn.click();
      await expect(facilitiesBtn).toHaveAttribute("aria-pressed", "true", { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    const filteredCount = await faqButtons.count();
    expect(filteredCount).toBeLessThan(20);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("search filtering hides non-matching questions", async ({ page }) => {
    await page.goto("/faq");
    const main = page.getByRole("main");
    const faqButtons = main.locator("button[aria-expanded]");
    await expect(faqButtons).toHaveCount(20);

    const search = page.getByRole("searchbox");

    // Retry until hydration completes — clear and type keystroke-by-keystroke
    // to ensure React's onChange fires
    await expect(async () => {
      await search.clear();
      await search.pressSequentially("sound stages", { delay: 50 });
      await expect(faqButtons).not.toHaveCount(20, { timeout: 2_000 });
    }).toPass({ timeout: 15_000 });

    const filteredCount = await faqButtons.count();
    expect(filteredCount).toBeLessThan(20);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("FAQ items expand on click", async ({ page }) => {
    await page.goto("/faq");
    const main = page.getByRole("main");
    const firstButton = main.locator("button[aria-expanded]").first();
    // Wait for hydration: all 20 FAQ items should be present and interactive
    await expect(main.locator("button[aria-expanded]")).toHaveCount(20);
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");

    // Retry click until hydration completes and event handler is attached
    await expect(async () => {
      await firstButton.click();
      await expect(firstButton).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
    }).toPass({ timeout: 10_000 });

    const panelId = await firstButton.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
  });

  test("FAQ has Schema.org structured data", async ({ page }) => {
    await page.goto("/faq");
    // Schema.org data is injected via useEffect — wait for it
    await page.waitForFunction(() => {
      const el = document.querySelector('script[type="application/ld+json"]');
      return el && el.textContent && el.textContent.includes("FAQPage");
    }, { timeout: 10_000 });
    const script = page.locator('script[type="application/ld+json"]');
    const content = await script.textContent();
    expect(content).toContain("FAQPage");
    expect(content).toContain("Question");
  });
});

test.describe("Contact page content", () => {
  test("displays contact heading", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("displays contact information", async ({ page }) => {
    await page.goto("/contact");
    // Scoped to main to avoid footer duplicates
    const main = page.getByRole("main");
    await expect(
      main.getByText("troy@team.production.city"),
    ).toBeVisible();
    await expect(main.getByText("+61 2 9137 9100")).toBeVisible();
    await expect(main.getByText("+1 650 215 6253")).toBeVisible();
  });

  test("displays email link with mailto", async ({ page }) => {
    await page.goto("/contact");
    // Scope to main — footer also has a mailto link
    const main = page.getByRole("main");
    const emailLink = main.locator('a[href="mailto:troy@team.production.city"]');
    await expect(emailLink).toBeVisible();
  });

  test("displays phone links with tel", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator('a[href="tel:+61291379100"]')).toBeVisible();
    await expect(page.locator('a[href="tel:+16502156253"]')).toBeVisible();
  });

  test("Acknowledgement of Country renders in footer", async ({ page }) => {
    await page.goto("/contact");
    // Section removed from contact main — rendered once by the shared footer
    await expect(
      page.locator("footer").getByText(/Traditional Owners/i),
    ).toBeVisible();
  });

  test("category pre-selection via URL param", async ({ page }) => {
    await page.goto("/contact?category=producer");
    await expect(page.getByRole("main")).toBeVisible();
    // The EOI form should be present
    await expect(page.locator("#eoi-section")).toBeVisible();
  });
});
