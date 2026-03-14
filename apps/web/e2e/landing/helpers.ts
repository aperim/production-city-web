/**
 * Shared helpers for landing page E2E tests.
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** All landing page routes. */
export const LANDING_PAGES = [
  { path: "/", name: "Home" },
  { path: "/facilities", name: "Facilities" },
  { path: "/creative", name: "Creative" },
  { path: "/vision", name: "Vision" },
  { path: "/community", name: "Community" },
  { path: "/faq", name: "FAQ" },
  { path: "/contact", name: "Contact" },
];

/** Supported locale codes. */
export const LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
] as const;

/** RTL locales. */
export const RTL_LOCALES = ["ar"] as const;

/** Assert the page is at a specific locale. */
export async function assertLocale(page: Page, locale: string) {
  const htmlLang = await page.locator("html").getAttribute("lang");
  expect(htmlLang).toBe(locale);

  if (locale === "ar") {
    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");
  }
}

/** Switch language using the language switcher dropdown. */
export async function switchLanguage(page: Page, locale: string) {
  // Open the language switcher
  const trigger = page.getByRole("button", { name: /language/i });
  await trigger.click();

  // Find the menu item for the target locale
  const menuItems = page.getByRole("menuitemradio");
  const count = await menuItems.count();

  for (let i = 0; i < count; i++) {
    const item = menuItems.nth(i);
    const code = await item.getAttribute("data-locale");
    if (code === locale) {
      await item.click();
      break;
    }
  }
}

/** Generate a unique email for test isolation. */
export function uniqueEmail(): string {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `e2e-${id}@test.production.city`;
}
