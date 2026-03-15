/**
 * URL utilities for locale-prefixed navigation.
 *
 * Generates locale-aware URLs for the LanguageSwitcher component.
 * English has no prefix (lives at /), all other locales use /{locale}/ prefix.
 *
 * @module url-utils
 */

const SUPPORTED_LOCALE_CODES = new Set([
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
]);

/**
 * Build a locale-prefixed URL from a target locale and current path.
 *
 * - English: no prefix (e.g., /facilities)
 * - Other locales: /{locale}/{path} (e.g., /zh/facilities)
 * - Root path for non-English: /{locale}/ (trailing slash)
 * - Strips existing locale prefix before building
 * - Preserves query params and hash fragments
 * - Normalizes trailing slashes on sub-paths
 */
export function buildLocaleUrl(targetLocale: string, currentFullPath: string): string {
  // Validate locale to prevent open-redirect via crafted locale values (Codex Finding)
  if (!SUPPORTED_LOCALE_CODES.has(targetLocale)) {
    targetLocale = "en";
  }

  // Split path from query/hash
  let path = currentFullPath;
  let suffix = "";

  const queryIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  const splitIndex =
    queryIndex >= 0 && hashIndex >= 0
      ? Math.min(queryIndex, hashIndex)
      : queryIndex >= 0
        ? queryIndex
        : hashIndex >= 0
          ? hashIndex
          : -1;

  if (splitIndex >= 0) {
    suffix = path.slice(splitIndex);
    path = path.slice(0, splitIndex);
  }

  // Strip existing locale prefix if present
  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LOCALE_CODES.has(segments[0]!)) {
    segments.shift();
  }

  // Strip trailing slash on sub-paths
  const cleanPath = segments.length > 0 ? `/${segments.join("/")}` : "/";

  // Build the new URL
  if (targetLocale === "en") {
    return cleanPath + suffix;
  }

  if (cleanPath === "/") {
    return `/${targetLocale}/${suffix}`;
  }

  return `/${targetLocale}${cleanPath}${suffix}`;
}
