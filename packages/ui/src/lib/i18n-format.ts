/**
 * Intl.* formatting utilities for locale-aware display.
 *
 * All functions accept a locale parameter and fall back to "en" on error.
 *
 * @module i18n-format
 */

import type { SupportedLocale } from "./i18n-constants.js";

/**
 * Format a date using Intl.DateTimeFormat.
 * Defaults to `{ dateStyle: 'medium' }`.
 */
export function formatDate(
  date: Date,
  locale: SupportedLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const opts = options ?? { dateStyle: "medium" };
  try {
    const result = new Intl.DateTimeFormat(locale, opts).format(date);
    return result;
  } catch {
    try {
      return new Intl.DateTimeFormat("en", opts).format(date);
    } catch {
      return "Invalid Date";
    }
  }
}

/**
 * Format a number using Intl.NumberFormat.
 * Handles thousands separators per locale.
 */
export function formatNumber(
  num: number,
  locale: SupportedLocale,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch {
    return new Intl.NumberFormat("en", options).format(num);
  }
}

/**
 * Format a currency amount using Intl.NumberFormat.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: SupportedLocale,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
    }).format(amount);
  }
}

/**
 * Format a relative time using Intl.RelativeTimeFormat.
 * Produces locale-appropriate "3 days ago" equivalents.
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: SupportedLocale,
): string {
  try {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      value,
      unit,
    );
  } catch {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      value,
      unit,
    );
  }
}
