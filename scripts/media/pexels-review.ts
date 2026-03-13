/**
 * Evaluate media candidates for quality and light/dark suitability.
 * Executable via: node --experimental-transform-types --experimental-detect-module scripts/media/pexels-review.ts
 */

import type { PexelsPhoto, ReviewResult } from "./lib/types.js";

interface ReviewOptions {
  minWidth: number;
  minHeight: number;
}

/**
 * Parse a hex color string to RGB values.
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
 * Compute perceived brightness (0-255) using the luminance formula.
 */
function perceivedBrightness(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  // ITU-R BT.601 luma
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Determine theme variant based on average color brightness.
 * Dark images (brightness < 100) → "dark"
 * Light images (brightness > 155) → "light"
 * Mid-range → "universal"
 */
function classifyThemeVariant(
  avgColor: string,
): "light" | "dark" | "universal" {
  const brightness = perceivedBrightness(avgColor);
  if (brightness < 100) return "dark";
  if (brightness > 155) return "light";
  return "universal";
}

/**
 * Review a list of photo candidates for quality and theme suitability.
 * Returns a structured review result for each candidate.
 */
export function reviewCandidates(
  photos: PexelsPhoto[],
  options: ReviewOptions,
): ReviewResult[] {
  return photos.map((photo) => {
    const reasons: string[] = [];
    let score = 50; // base score
    let accepted = true;

    // Resolution check
    if (photo.width < options.minWidth || photo.height < options.minHeight) {
      accepted = false;
      reasons.push(
        `Below minimum resolution: ${photo.width}x${photo.height} < ${options.minWidth}x${options.minHeight}`,
      );
      score -= 30;
    } else {
      reasons.push(
        `Resolution ${photo.width}x${photo.height} meets threshold`,
      );
      // Bonus for higher resolution
      score += Math.min(
        30,
        Math.floor((photo.width * photo.height) / (4000 * 2667) * 30),
      );
    }

    // Alt text quality
    if (!photo.alt || photo.alt.length < 5) {
      reasons.push("Alt text missing or too short");
      score -= 10;
    } else {
      reasons.push("Alt text present");
      score += 5;
    }

    // Theme variant classification
    const themeVariant = classifyThemeVariant(photo.avg_color);
    reasons.push(`Color palette classified as ${themeVariant} (avg: ${photo.avg_color})`);

    // Aspect ratio scoring — landscape preferred for hero images
    const aspectRatio = photo.width / photo.height;
    if (aspectRatio >= 1.3 && aspectRatio <= 2.0) {
      reasons.push("Good landscape aspect ratio");
      score += 10;
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    return {
      photo,
      accepted,
      themeVariant,
      score,
      reasons,
    };
  });
}
