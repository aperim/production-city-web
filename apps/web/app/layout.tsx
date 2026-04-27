import "../app.css";
import type { Metadata } from "vinext/shims/metadata";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "./i18n/x-locale-validation.js";
import { getDirection, getOgLocale } from "./i18n/index.js";
import { buildHreflangLinks, buildCanonicalUrl, validatePath, getOgLocaleAlternates } from "./components/LocaleHead.js";

const CANONICAL_HOST = "https://production.city";
const SITE_NAME = "Production City™";
const OG_IMAGE_URL = `${CANONICAL_HOST}/media/home-hero/light.jpg`;
const TWITTER_SITE = "@productioncity";

export const metadata: Metadata = {
  title: {
    default: "Production City™",
    template: "%s — Production City™",
  },
  description: "Production City™ is Australia's first fully integrated screen and stage production precinct.",
  openGraph: {
    siteName: "Production City™",
    type: "website",
  },
};

/**
 * Root layout for the Production City web application.
 *
 * Server-resolved locale: reads X-Locale header set by Worker locale middleware
 * and renders <html lang> and dir server-side (Issue #277).
 *
 * Locale-aware global OG tags (og:url, og:locale, og:locale:alternate) are
 * rendered here because they depend on the request locale and cannot be
 * expressed as static per-page Metadata exports.
 *
 * Security headers are applied at the worker level (worker/index.ts).
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  const direction = getDirection(locale);
  const rawPath = headersList.get("X-Path") ?? "/";
  const currentPath = validatePath(rawPath) ? rawPath : "/";
  const queryString = headersList.get("X-Query") ?? "";

  const hreflangLinks = buildHreflangLinks(currentPath, CANONICAL_HOST);
  const canonicalUrl = buildCanonicalUrl(currentPath, locale, CANONICAL_HOST, queryString);
  const ogLocale = getOgLocale(locale);
  const ogLocaleAlternates = getOgLocaleAlternates(locale);

  return (
    <html lang={locale} dir={direction}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark light" />
        <link rel="canonical" href={canonicalUrl} />
        {hreflangLinks.map((link) => (
          <link key={link.hreflang} rel="alternate" hrefLang={link.hreflang} href={link.href} />
        ))}

        {/* ── Open Graph global tags (locale-aware, cannot live in static Metadata exports) ── */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content={ogLocale} />
        {ogLocaleAlternates.map((alt) => (
          <meta key={alt} property="og:locale:alternate" content={alt} />
        ))}
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:alt" content="Production City™ — A vertically integrated screen and stage campus" />

        {/* ── Twitter Card global fallbacks ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={TWITTER_SITE} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <meta name="twitter:image:alt" content="Production City™ — A vertically integrated screen and stage campus" />

        {/* ── Dublin Core namespace declarations + site-wide static tags ── */}
        <link rel="schema.DC" href="http://purl.org/dc/elements/1.1/" />
        <link rel="schema.DCTERMS" href="http://purl.org/dc/terms/" />
        <meta name="DC.publisher" content="Production City Pty Ltd" />
        <meta name="DC.rights" content="© 2026 Production City Pty Ltd. All rights reserved." />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.language" content={locale} />

        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230f172a'/><text x='50' y='68' font-size='52' text-anchor='middle' fill='white' font-family='system-ui'>P</text></svg>"
        />
        {/*
          Blocking inline script: applies dark theme BEFORE first paint to prevent
          flash-of-wrong-theme. The script reads the user's localStorage preference
          and adds the .dark class to <html> before the browser renders.
          This is a static string literal with no user input — no XSS risk.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pc-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        {/* Organization + WebSite — global structured data, static content, no user input */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://production.city/#organization",
              name: "Production City",
              url: "https://production.city",
              logo: { "@type": "ImageObject", url: "https://production.city/logo.svg" },
              description:
                "Production City is a purpose-built integrated screen and stage campus in Queensland, Australia — combining sound stages, broadcast theatre, studio offices, and shared infrastructure under one operator.",
              address: { "@type": "PostalAddress", addressCountry: "AU", addressRegion: "Queensland" },
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: "troy@team.production.city",
                  telephone: "+61-2-9137-9100",
                  areaServed: "AU",
                  availableLanguage: "English",
                },
              ],
              sameAs: ["https://www.linkedin.com/company/productioncity"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://production.city/#website",
              name: "Production City",
              url: "https://production.city",
              publisher: { "@id": "https://production.city/#organization" },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
