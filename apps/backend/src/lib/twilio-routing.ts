/**
 * Twilio sender route prefix matching.
 * Matches the longest prefix of the recipient number to select the sender.
 */

export interface SenderRoute {
  phoneNumber: string;
  prefixes: string[];
  isDefault: boolean;
}

/**
 * Select the best sender number for a recipient based on prefix matching.
 * Uses longest-prefix match. Falls back to the default route.
 * Returns null if no match and no default.
 */
export function selectSenderRoute(
  recipientNumber: string,
  routes: SenderRoute[],
): SenderRoute | null {
  let bestMatch: SenderRoute | null = null;
  let bestPrefixLength = 0;

  for (const route of routes) {
    for (const prefix of route.prefixes) {
      if (
        recipientNumber.startsWith(prefix) &&
        prefix.length > bestPrefixLength
      ) {
        bestMatch = route;
        bestPrefixLength = prefix.length;
      }
    }
  }

  if (bestMatch) return bestMatch;

  // Fall back to default
  return routes.find((r) => r.isDefault) ?? null;
}
