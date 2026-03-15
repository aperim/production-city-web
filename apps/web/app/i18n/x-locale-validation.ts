/**
 * X-Locale header validation at the app boundary.
 *
 * The app MUST validate X-Locale against SUPPORTED_LOCALES even though
 * the Worker also validates — the app can be reached without the Worker
 * in dev/preview environments.
 *
 * @see Issue #277 Finding #4
 * @module x-locale-validation
 */

import { isSupportedLocale, type SupportedLocale } from "./index.js";

/**
 * Validate an X-Locale header value. Returns the locale if valid,
 * falls back to "en" otherwise.
 */
export function validateXLocale(value: string | null | undefined): SupportedLocale {
  if (!value || typeof value !== "string") return "en";
  if (value.length > 10) return "en";
  if (isSupportedLocale(value)) return value;
  return "en";
}
