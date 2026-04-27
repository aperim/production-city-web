/**
 * Server-side locale resolution.
 * Reads the X-Locale header set by the Worker locale middleware and
 * returns the validated locale. Falls back to "en" if unset or invalid.
 *
 * Import only in server components (page.tsx files — no "use client").
 */

import { headers } from "vinext/shims/headers";
import { validateXLocale } from "./x-locale-validation.js";
import type { SupportedLocale } from "./index.js";

export async function getServerLocale(): Promise<SupportedLocale> {
  const headersList = await headers();
  return validateXLocale(headersList.get("X-Locale"));
}
