/**
 * BCP 47 sub-tag fallback resolution.
 *
 * Resolves locale tags with region/script sub-tags to the closest
 * supported locale: pt-BR → pt, zh-Hans-CN → zh, en-US → en.
 *
 * @see Issue #277
 * @module subtag-fallback
 */

import { isSupportedLocale, type SupportedLocale } from "./index.js";

/**
 * Resolve a BCP 47 locale tag to the closest supported locale.
 *
 * Resolution order:
 * 1. Exact match (e.g. "en")
 * 2. Primary language sub-tag (e.g. "pt-BR" → "pt")
 *
 * Returns null if no supported locale matches.
 */
export function resolveSubTag(tag: string): SupportedLocale | null {
  if (!tag || typeof tag !== "string") return null;

  const normalized = tag.toLowerCase().trim();
  if (!normalized) return null;

  // Exact match
  if (isSupportedLocale(normalized)) return normalized;

  // Primary language sub-tag: split on "-" and check first segment
  const primary = normalized.split("-")[0]!;
  if (isSupportedLocale(primary)) return primary;

  return null;
}
