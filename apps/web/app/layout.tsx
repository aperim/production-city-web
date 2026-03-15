import "../app.css";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "./i18n/x-locale-validation.js";
import { getDirection } from "./i18n/index.js";

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

  return (
    <html lang={locale} dir={direction}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="dark light" />
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
