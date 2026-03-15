/**
 * Locale middleware utilities for the Cloudflare Worker.
 *
 * Handles URL-based locale routing: /{locale}/path prefix parsing,
 * trailing slash normalization, Accept-Language detection, cookie validation,
 * and open redirect prevention.
 *
 * @see Issue #277
 * @module locale-middleware
 */

import {
  isSupportedLocale,
} from "../../../packages/ui/src/lib/i18n-constants.js";

/** Maximum Accept-Language header length to prevent abuse. */
const MAX_ACCEPT_LANGUAGE_LENGTH = 1024;

/** Maximum cookie value length for locale cookies. */
const MAX_COOKIE_VALUE_LENGTH = 10;

/**
 * Patterns that indicate open redirect attacks in paths.
 * Checked against decoded path.
 */
const DANGEROUS_PATH_PATTERNS = [
  /\/\//,        // double slash (authority component)
  /@/,           // authority component
  /\.\./,        // dot segments
];

/**
 * Patterns checked against raw (encoded) path to catch evasion.
 */
const DANGEROUS_ENCODED_PATTERNS = [
  /%2[fF]/i,     // encoded slash
  /%5[cC]/i,     // encoded backslash
  /%2[eE]/i,     // encoded dot
];

/** Paths that bypass locale middleware entirely. */
const BYPASS_PREFIXES = [
  "/api/",
  "/auth/",
  "/assets/",
  "/_next/",
  "/__",
];

const BYPASS_EXACT = [
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/.well-known",
];

interface ParsedLocale {
  locale: string;
  remainingPath: string;
}

/**
 * Parse locale prefix from URL path.
 * Returns null if no locale prefix is present (i.e. English default).
 *
 * Handles case normalization: /ZH/ → zh
 */
export function parseLocalePrefix(pathname: string): ParsedLocale | null {
  // Match /{2-3 letter code}/ or /{2-3 letter code} at end
  const match = pathname.match(/^\/([a-zA-Z]{2,3})(\/.*)?$/);
  if (!match) return null;

  const segment = match[1]!.toLowerCase();
  const rest = match[2] ?? "";

  // Only treat 2-letter codes as potential locale prefixes
  if (segment.length > 3) return null;

  // Check if this is a known locale or a potential invalid one
  // (2-letter codes that could be locale prefixes)
  if (segment.length === 2 || segment.length === 3) {
    return {
      locale: segment,
      remainingPath: rest || "/",
    };
  }

  return null;
}

/**
 * Check if a path should bypass locale middleware.
 */
export function shouldBypassLocaleMiddleware(pathname: string): boolean {
  for (const prefix of BYPASS_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  for (const exact of BYPASS_EXACT) {
    if (pathname === exact || pathname.startsWith(exact + "/")) return true;
  }
  // Static file extensions
  if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|webp|avif)$/i.test(pathname)) {
    return true;
  }
  return false;
}

/**
 * Parse Accept-Language header and return the best non-English supported locale match.
 *
 * Returns null if:
 * - Header is empty/missing
 * - Header exceeds length limit
 * - Best match is English
 * - No supported locale found
 *
 * @see Finding #7 — bounded parsing
 */
export function parseAcceptLanguage(header: string | null | undefined): string | null {
  if (!header || typeof header !== "string") return null;
  if (header.length > MAX_ACCEPT_LANGUAGE_LENGTH) return null;

  const entries: Array<{ locale: string; q: number }> = [];

  const parts = header.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const [langPart, ...params] = trimmed.split(";");
    if (!langPart) continue;

    const lang = langPart.trim().toLowerCase();
    if (lang === "*") continue;

    let q = 1.0;
    let qValid = true;
    for (const param of params) {
      const trimmedParam = param.trim();
      // Check if this is a q= parameter
      if (/^q\s*=/i.test(trimmedParam)) {
        const qMatch = trimmedParam.match(/^q\s*=\s*([0-9.]+)$/i);
        if (!qMatch) {
          // q= present but value is not a valid number
          qValid = false;
          break;
        }
        const parsed = parseFloat(qMatch[1]!);
        if (isNaN(parsed) || parsed < 0 || parsed > 1) {
          qValid = false;
          break;
        }
        q = parsed;
      }
    }
    if (!qValid) continue;

    // Try exact match first
    if (isSupportedLocale(lang) && lang !== "en") {
      entries.push({ locale: lang, q });
      continue;
    }

    // Try language subtag (pt-BR → pt)
    const primary = lang.split("-")[0]!;
    if (isSupportedLocale(primary) && primary !== "en") {
      entries.push({ locale: primary, q });
    }
  }

  if (entries.length === 0) return null;

  // Sort by q-value descending
  entries.sort((a, b) => b.q - a.q);

  return entries[0]!.locale;
}

/**
 * Check if trailing slash normalization is needed.
 *
 * Rules:
 * - /zh → 301 to /zh/ (locale root needs trailing slash)
 * - /zh/facilities/ → 301 to /zh/facilities (strip trailing slash on sub-paths)
 * - /facilities/ → 301 to /facilities (strip trailing slash on English paths)
 * - / and /zh/ → no redirect needed
 */
export function normalizeTrailingSlash(
  pathname: string,
  locale: string | null,
): { redirect: string; status: 301 } | null {
  // Bare locale without trailing slash: /zh → /zh/
  if (locale && pathname === `/${locale}`) {
    return { redirect: `/${locale}/`, status: 301 };
  }

  // Root path — no redirect needed
  if (pathname === "/") return null;

  // Locale root /zh/ — no redirect needed
  if (locale && pathname === `/${locale}/`) return null;

  // Strip trailing slash on sub-paths
  if (pathname.endsWith("/") && pathname.length > 1) {
    return { redirect: pathname.slice(0, -1), status: 301 };
  }

  return null;
}

/**
 * Build a safe redirect URL with open redirect prevention.
 *
 * @throws Error if path contains dangerous patterns
 * @see Finding #3 — open redirect prevention
 */
export function buildRedirectUrl(path: string, canonicalOrigin: string): string {
  // Check encoded patterns BEFORE decoding
  for (const pattern of DANGEROUS_ENCODED_PATTERNS) {
    if (pattern.test(path)) {
      throw new Error(`Dangerous encoded pattern in redirect path: ${path}`);
    }
  }

  // Check decoded patterns
  for (const pattern of DANGEROUS_PATH_PATTERNS) {
    if (pattern.test(path)) {
      throw new Error(`Dangerous pattern in redirect path: ${path}`);
    }
  }

  // Separate path and query string
  const queryIndex = path.indexOf("?");
  const pathOnly = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const query = queryIndex >= 0 ? path.slice(queryIndex) : "";

  const url = new URL(pathOnly + query, canonicalOrigin);

  // Verify origin matches canonical (Finding #3)
  if (url.origin !== canonicalOrigin) {
    throw new Error(`Redirect origin mismatch: ${url.origin} !== ${canonicalOrigin}`);
  }

  return url.toString();
}

/**
 * Validate a cookie locale value against the supported locales allowlist.
 *
 * @see Finding #9 — cookie forgery validation
 */
export function validateCookieLocale(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  if (value.length > MAX_COOKIE_VALUE_LENGTH) return null;
  if (isSupportedLocale(value)) return value;
  return null;
}

/**
 * Sanitize an invalid locale string for analytics logging.
 * Returns a short hash instead of raw input to prevent high-cardinality abuse.
 *
 * @see Finding #14
 */
export function sanitizeInvalidLocale(raw: string): string {
  // Simple hash: take first 8 chars of a base36 hash
  let hash = 0;
  const bounded = raw.slice(0, 32);
  for (let i = 0; i < bounded.length; i++) {
    hash = ((hash << 5) - hash + bounded.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}
