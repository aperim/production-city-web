/**
 * E.164 phone number validation.
 * Uses a regex for validation (no external dependency for now).
 * E.164 format: +[country code][number], max 15 digits total.
 */

/** E.164 pattern: starts with +, followed by 1-15 digits */
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Validates that a phone number is in E.164 format.
 */
export function isValidE164(phone: string): boolean {
  return E164_REGEX.test(phone);
}

/**
 * Normalize a phone number to E.164 format.
 * Strips spaces, dashes, parentheses. Adds + prefix if missing digits-only input.
 * Returns null if the result is not valid E.164.
 */
export function normalizeToE164(phone: string): string | null {
  // Strip whitespace, dashes, parentheses, dots
  let cleaned = phone.replace(/[\s\-().]/g, "");

  // If it doesn't start with +, try adding it
  if (!cleaned.startsWith("+") && /^[1-9]\d{1,14}$/.test(cleaned)) {
    cleaned = `+${cleaned}`;
  }

  return isValidE164(cleaned) ? cleaned : null;
}
