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
  // New pages from PRO-93
  { path: "/services", name: "Services" },
  { path: "/network", name: "Network" },
  { path: "/company", name: "Company" },
  { path: "/company/team", name: "Company — Team" },
  { path: "/company/approach", name: "Company — Approach" },
  { path: "/first-nations", name: "First Nations" },
  { path: "/facilities/broadcast-control-room", name: "Broadcast Control Room" },
  { path: "/facilities/broadcast-theatre", name: "Broadcast Theatre" },
  { path: "/facilities/commercial-sound-stages", name: "Commercial Sound Stages" },
  { path: "/facilities/screen-sound-stages", name: "Screen Sound Stages" },
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

/** Locale display names for matching menu items. */
const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  bn: "বাংলা",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
};

/** Switch language using the language switcher dropdown. */
export async function switchLanguage(page: Page, locale: string) {
  // Open the language switcher
  const trigger = page.getByRole("button", { name: /language/i });
  await trigger.click();

  // Find and click the menu item by its display name
  const displayName = LOCALE_NAMES[locale];
  if (!displayName) {
    throw new Error(`Unknown locale: ${locale}`);
  }

  const menuItem = page.getByRole("menuitemradio", { name: displayName });
  await menuItem.click();
}

/** Generate a unique email for test isolation. */
export function uniqueEmail(): string {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `e2e-${id}@test.production.city`;
}
