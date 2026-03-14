/**
 * E2E tests: SEO and accessibility for landing pages.
 * Validates meta tags, heading hierarchy, keyboard navigation, and WCAG basics.
 */

import { test, expect } from "@playwright/test";
import { LANDING_PAGES } from "./helpers";

test.describe("SEO — meta tags", () => {
  for (const lp of LANDING_PAGES) {
    test(`${lp.name} page has <title>`, async ({ page }) => {
      await page.goto(lp.path);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).toContain("Production City");
    });
  }
});

test.describe("SEO — FAQ structured data", () => {
  test("FAQ page has valid Schema.org FAQPage JSON-LD", async ({ page }) => {
    await page.goto("/faq");
    const script = page.locator('script[type="application/ld+json"]');
    await expect(script).toBeAttached();
    const rawContent = await script.textContent();
    expect(rawContent).not.toBeNull();
    const data = JSON.parse(rawContent!);
    expect(data["@type"]).toBe("FAQPage");
    expect(data["@context"]).toBe("https://schema.org");
    expect(data.mainEntity).toBeInstanceOf(Array);
    expect(data.mainEntity.length).toBe(20);
    for (const item of data.mainEntity) {
      expect(item["@type"]).toBe("Question");
      expect(item.name).toBeTruthy();
      expect(item.acceptedAnswer["@type"]).toBe("Answer");
      expect(item.acceptedAnswer.text).toBeTruthy();
    }
  });
});

test.describe("Accessibility — heading hierarchy", () => {
  for (const lp of LANDING_PAGES) {
    test(`${lp.name} page has h1`, async ({ page }) => {
      await page.goto(lp.path);
      const h1 = page.locator("h1");
      await expect(h1.first()).toBeVisible();
    });

    test(`${lp.name} page has no skipped heading levels`, async ({
      page,
    }) => {
      await page.goto(lp.path);
      const headings = await page.evaluate(() => {
        const all = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        return Array.from(all).map((h) =>
          Number.parseInt(h.tagName.slice(1), 10),
        );
      });

      expect(headings.length).toBeGreaterThan(0);
      // First heading should be h1
      expect(headings[0]).toBe(1);

      // No heading should skip more than 1 level from previous
      for (let i = 1; i < headings.length; i++) {
        const diff = headings[i]! - headings[i - 1]!;
        expect(
          diff,
          `Heading level jumped from h${headings[i - 1]} to h${headings[i]} on ${lp.path}`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});

test.describe("Accessibility — focus visibility", () => {
  test("interactive elements have visible focus indicator", async ({ page }) => {
    await page.goto("/");
    // Tab to first focusable element
    await page.keyboard.press("Tab");

    // Verify an element is focused and it is interactive
    const focusInfo = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        outline: style.outline,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });

    expect(focusInfo).not.toBeNull();
    expect(focusInfo!.tagName).toBeTruthy();
    // Element must have a visible focus indicator: either outline or box-shadow
    const hasOutline =
      focusInfo!.outlineStyle !== "none" && focusInfo!.outlineWidth !== "0px";
    const hasBoxShadow =
      focusInfo!.boxShadow !== "none" && focusInfo!.boxShadow !== "";
    expect(
      hasOutline || hasBoxShadow,
      `Focused element <${focusInfo!.tagName}> has no visible focus indicator. outline: ${focusInfo!.outline}, box-shadow: ${focusInfo!.boxShadow}`,
    ).toBe(true);
  });
});

test.describe("Accessibility — language switcher ARIA", () => {
  test("language switcher has accessible trigger", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /language/i });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded");
  });
});

test.describe("Performance — no horizontal overflow", () => {
  for (const lp of LANDING_PAGES) {
    test(`${lp.name} page has no horizontal overflow`, async ({ page }) => {
      await page.goto(lp.path);
      const overflow = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1
        );
      });
      expect(overflow).toBe(false);
    });
  }
});
