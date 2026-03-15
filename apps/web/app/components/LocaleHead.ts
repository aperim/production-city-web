/**
 * LocaleHead — SEO metadata generation for i18n pages.
 *
 * Generates hreflang alternate links, canonical URLs, og:locale tags,
 * and handles SEO poisoning prevention.
 *
 * Lives in apps/web (not packages/ui) because it requires routing context.
 *
 * @see Issue #278
 * @module LocaleHead
 */

import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getOgLocale,
} from "../i18n/index.js";

/** Tracking query params to strip from canonical URLs. */
const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
  "dclid",
  "twclid",
];

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * Build the locale-prefixed URL for a given locale and path.
 * English has no prefix.
 */
function buildLocaleUrl(path: string, locale: string, canonicalHost: string): string {
  if (locale === "en") {
    return `${canonicalHost}${path}`;
  }
  // For root path, locale root is /{locale}/
  if (path === "/") {
    return `${canonicalHost}/${locale}/`;
  }
  return `${canonicalHost}/${locale}${path}`;
}

/**
 * Build hreflang alternate links for all supported locales + x-default.
 *
 * @param currentPath - Path without locale prefix (e.g. "/facilities")
 * @param canonicalHost - Canonical host (e.g. "https://production.city")
 * @returns Array of hreflang link objects
 */
export function buildHreflangLinks(
  currentPath: string,
  canonicalHost: string,
): HreflangLink[] {
  const links: HreflangLink[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    links.push({
      hreflang: locale,
      href: buildLocaleUrl(currentPath, locale, canonicalHost),
    });
  }

  // x-default points to English (no prefix)
  links.push({
    hreflang: "x-default",
    href: buildLocaleUrl(currentPath, "en", canonicalHost),
  });

  return links;
}

/**
 * Build canonical URL for a specific locale.
 */
export function buildCanonicalUrl(
  currentPath: string,
  locale: SupportedLocale,
  canonicalHost: string,
): string {
  return buildLocaleUrl(currentPath, locale, canonicalHost);
}

/**
 * Strip tracking query parameters from a query string.
 *
 * @see Finding #18 — SEO poisoning prevention
 */
export function stripTrackingParams(queryString: string): string {
  if (!queryString) return "";

  const params = new URLSearchParams(queryString);
  const cleaned = new URLSearchParams();

  for (const [key, value] of params) {
    const isTracking =
      TRACKING_PARAMS.includes(key) ||
      key.startsWith("utm_");

    if (!isTracking) {
      cleaned.set(key, value);
    }
  }

  const result = cleaned.toString();
  return result ? `?${result}` : "";
}

/**
 * Validate a path for use in canonical/hreflang URLs.
 * Rejects paths with encoded slashes, dot segments, authority components.
 *
 * @see Finding #18 — SEO poisoning prevention
 */
export function validatePath(path: string): boolean {
  if (!path) return false;

  // Check for dangerous patterns in the decoded path
  if (/\/\//.test(path)) return false;   // authority component
  if (/@/.test(path)) return false;       // authority component
  if (/\.\./.test(path)) return false;    // dot segments

  // Check raw path for encoded evasion
  if (/%2[fF]/i.test(path)) return false;  // encoded slash
  if (/%5[cC]/i.test(path)) return false;  // encoded backslash
  if (/%2[eE]/i.test(path)) return false;  // encoded dot

  return true;
}

/**
 * Get og:locale:alternate values for all locales except the current one.
 */
export function getOgLocaleAlternates(currentLocale: SupportedLocale): string[] {
  return SUPPORTED_LOCALES
    .filter((l) => l !== currentLocale)
    .map((l) => getOgLocale(l));
}
