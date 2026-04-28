/**
 * Build-time XML sitemap generator with locale variants.
 *
 * Generates sitemap entries for all pages x all locales with xhtml:link
 * hreflang alternates and x-default.
 *
 * Canonical origin is hard-coded to prevent SEO poisoning.
 *
 * @see Issue #280
 * @module generate-sitemap
 */

/**
 * Supported locales — duplicated from packages/ui/src/lib/i18n-constants.ts
 * to avoid import resolution issues when running via Node type-stripping.
 * Must stay in sync with the canonical list.
 */
const SUPPORTED_LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
] as const;
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/** Canonical origin — hard-coded for SEO poisoning prevention. */
export const CANONICAL_ORIGIN = "https://production.city";

/** All public landing pages (paths without locale prefix). */
export const PAGES = [
  "/",
  "/facilities",
  "/facilities/screen-sound-stages",
  "/facilities/commercial-sound-stages",
  "/facilities/broadcast-theatre",
  "/facilities/broadcast-control-room",
  "/masterplan",
  "/services",
  "/company",
  "/first-nations",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

/**
 * Build the locale-prefixed URL for a given locale and path.
 * English has no prefix (lives at root).
 */
function buildLocaleUrl(path: string, locale: string): string {
  if (locale === "en") {
    return path === "/" ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${path}`;
  }
  return path === "/"
    ? `${CANONICAL_ORIGIN}/${locale}/`
    : `${CANONICAL_ORIGIN}/${locale}${path}`;
}

/**
 * Generate the complete XML sitemap string.
 */
export function generateSitemap(): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const page of PAGES) {
    for (const locale of SUPPORTED_LOCALES) {
      const loc = buildLocaleUrl(page, locale);
      lines.push("  <url>");
      lines.push(`    <loc>${loc}</loc>`);

      // hreflang alternates for all locales
      for (const altLocale of SUPPORTED_LOCALES) {
        const altHref = buildLocaleUrl(page, altLocale);
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altHref}" />`,
        );
      }

      // x-default points to English URL
      const xDefaultHref = buildLocaleUrl(page, "en");
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`,
      );

      lines.push("  </url>");
    }
  }

  lines.push("</urlset>");
  return lines.join("\n");
}

/**
 * When run as a script, write sitemap.xml to the dist output directory.
 * Also writes to public/ for dev server access.
 */
function main() {
  const sitemap = generateSitemap();

  // Write to public/media directory for static serving in dev
  const publicDir = resolve(import.meta.dirname, "../public");
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(resolve(publicDir, "sitemap.xml"), sitemap, "utf-8");

  // Also write to dist/client if it exists (post-build)
  const distDir = resolve(import.meta.dirname, "../dist/client");
  try {
    mkdirSync(distDir, { recursive: true });
    writeFileSync(resolve(distDir, "sitemap.xml"), sitemap, "utf-8");
  } catch {
    // dist may not exist during dev — that's fine
  }

  const urlCount = PAGES.length * SUPPORTED_LOCALES.length;
  console.log(`Sitemap generated: ${urlCount} URLs (${PAGES.length} pages x ${SUPPORTED_LOCALES.length} locales)`);
}

// Run as script when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
