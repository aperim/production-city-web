/**
 * Select light/dark pairs from reviewed candidates.
 * Executable via: node --experimental-transform-types --experimental-detect-module scripts/media/pexels-pair.ts
 */

import type { ReviewResult, MediaPairResult } from "./lib/types.js";

/**
 * Parse hex color to RGB.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/**
 * Compute perceived brightness (0-255).
 */
function perceivedBrightness(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Minimum brightness difference between light and dark variants */
const MIN_CONTRAST_DIFFERENCE = 50;

/**
 * Select the best light/dark pair from reviewed candidates.
 *
 * Selection logic:
 * 1. Filter to accepted candidates only
 * 2. Find best light candidate (highest score among themeVariant="light")
 * 3. Find best dark candidate (highest score among themeVariant="dark")
 * 4. Verify sufficient contrast between the pair
 * 5. If no valid pair, fall back to the highest-scoring universal or single candidate
 */
export function selectPairs(
  candidates: ReviewResult[],
  contentContext: string,
): MediaPairResult {
  const accepted = candidates.filter((c) => c.accepted);

  if (accepted.length === 0) {
    return { contentContext, light: null, dark: null, fallback: null };
  }

  // Sort each variant by score (descending)
  const lightCandidates = accepted
    .filter((c) => c.themeVariant === "light")
    .sort((a, b) => b.score - a.score);

  const darkCandidates = accepted
    .filter((c) => c.themeVariant === "dark")
    .sort((a, b) => b.score - a.score);

  const bestLight = lightCandidates[0] ?? null;
  const bestDark = darkCandidates[0] ?? null;

  // Check if we have a valid pair with sufficient contrast
  if (bestLight && bestDark) {
    const lightBrightness = perceivedBrightness(bestLight.photo.avg_color);
    const darkBrightness = perceivedBrightness(bestDark.photo.avg_color);
    const contrastDiff = Math.abs(lightBrightness - darkBrightness);

    if (contrastDiff >= MIN_CONTRAST_DIFFERENCE) {
      return {
        contentContext,
        light: bestLight.photo,
        dark: bestDark.photo,
        fallback: null,
      };
    }
  }

  // Fallback: use the highest-scoring accepted candidate as universal
  const best = accepted.sort((a, b) => b.score - a.score)[0];
  return {
    contentContext,
    light: null,
    dark: null,
    fallback: best?.photo ?? null,
  };
}
