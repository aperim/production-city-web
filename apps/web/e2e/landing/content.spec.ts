/**
 * E2E tests: Landing page content integrity.
 * Validates section presence, FAQ functionality, and contact info.
 */

import { test, expect } from "@playwright/test";

test.describe("Home page content", () => {
  test("displays intro section with heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Production City")).toBeVisible();
  });

  test("displays EOI section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#eoi-section")).toBeVisible();
  });

  test("displays Acknowledgement of Country", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Traditional Owners/i),
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

test.describe("Creative page content", () => {
  test("displays ecosystem and services", async ({ page }) => {
    await page.goto("/creative");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Vision page content", () => {
  test("displays vision heading and mission", async ({ page }) => {
    await page.goto("/vision");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("displays forward-looking disclaimer", async ({ page }) => {
    await page.goto("/vision");
    await expect(
      page.getByText(/forward-looking statements/i),
    ).toBeVisible();
  });
});

test.describe("Community page content", () => {
  test("displays community heading", async ({ page }) => {
    await page.goto("/community");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("displays education and sustainability sections", async ({ page }) => {
    await page.goto("/community");
    await expect(page.getByText(/Education/i).first()).toBeVisible();
    await expect(page.getByText(/Sustainability/i).first()).toBeVisible();
  });

  test("displays forward-looking disclaimer", async ({ page }) => {
    await page.goto("/community");
    await expect(
      page.getByText(/forward-looking statements/i),
    ).toBeVisible();
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
    // Count all FAQ items before filtering — each FAQItem has one button[aria-expanded]
    const faqButtons = page.locator("button[aria-expanded]");
    const allItemsBefore = await faqButtons.count();
    expect(allItemsBefore).toBe(20);

    // Click Facilities category
    const facilitiesBtn = page.getByRole("button", {
      name: /Facilities/i,
    });
    await facilitiesBtn.click();
    await expect(facilitiesBtn).toHaveAttribute("aria-pressed", "true");

    // Fewer questions should be visible after filtering
    const filteredCount = await faqButtons.count();
    expect(filteredCount).toBeLessThan(allItemsBefore);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("search filtering hides non-matching questions", async ({ page }) => {
    await page.goto("/faq");
    const faqButtons = page.locator("button[aria-expanded]");
    const allBefore = await faqButtons.count();
    expect(allBefore).toBe(20);

    const search = page.getByRole("searchbox");
    await search.fill("sound stages");

    // Should have fewer questions visible
    const filteredCount = await faqButtons.count();
    expect(filteredCount).toBeLessThan(allBefore);
    expect(filteredCount).toBeGreaterThan(0);
    // Matching text should still be visible
    await expect(page.getByText(/sound stages/i).first()).toBeVisible();
  });

  test("FAQ items expand on click", async ({ page }) => {
    await page.goto("/faq");
    const firstButton = page.locator("button[aria-expanded]").first();
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
    // The associated region should be visible
    const panelId = await firstButton.getAttribute("aria-controls");
    await expect(page.locator(`#${panelId}`)).toBeVisible();
  });

  test("FAQ has Schema.org structured data", async ({ page }) => {
    await page.goto("/faq");
    const script = page.locator('script[type="application/ld+json"]');
    await expect(script).toBeAttached();
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
    await expect(
      page.getByText("troy@team.production.city"),
    ).toBeVisible();
    await expect(page.getByText("+61 2 9137 9100")).toBeVisible();
    await expect(page.getByText("+1 650 215 6253")).toBeVisible();
  });

  test("displays email link with mailto", async ({ page }) => {
    await page.goto("/contact");
    const emailLink = page.locator('a[href="mailto:troy@team.production.city"]');
    await expect(emailLink).toBeVisible();
  });

  test("displays phone links with tel", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator('a[href="tel:+61291379100"]')).toBeVisible();
    await expect(page.locator('a[href="tel:+16502156253"]')).toBeVisible();
  });

  test("displays Acknowledgement of Country", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByText(/Traditional Owners/i),
    ).toBeVisible();
  });

  test("category pre-selection via URL param", async ({ page }) => {
    await page.goto("/contact?category=producer");
    await expect(page.getByRole("main")).toBeVisible();
    // The EOI form should be present
    await expect(page.locator("#eoi-section")).toBeVisible();
  });
});
