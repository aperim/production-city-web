import "../app.css";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "./i18n/x-locale-validation.js";
import { getDirection } from "./i18n/index.js";
import { buildHreflangLinks, buildCanonicalUrl, validatePath } from "./components/LocaleHead.js";

/**
 * Root layout for the Production City web application.
 *
 * Server-resolved locale: reads X-Locale header set by Worker locale middleware
 * and renders <html lang> and dir server-side (Issue #277).
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

  const canonicalHost = "https://production.city";
  const hreflangLinks = buildHreflangLinks(currentPath, canonicalHost);
  const canonicalUrl = buildCanonicalUrl(currentPath, locale, canonicalHost, queryString);

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
        <title>Production City™ — Coming Soon</title>
        <meta
          name="description"
          content="Production City™ is coming soon."
        />
        <meta property="og:title" content="Production City™ — Coming Soon" />
        <meta
          property="og:description"
          content="Production City™ is coming soon."
        />
        <meta property="og:type" content="website" />
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
      </head>
      <body>{children}</body>
    </html>
  );
}
