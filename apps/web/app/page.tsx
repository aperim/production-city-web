/**
 * Home landing page — the primary entry point for Production City.
 * Route: / and /:locale/
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "./error-boundary";
import { HomePage } from "./pages/home";
import { getServerLocale } from "./i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "./i18n/x-locale-validation.js";
import { t, loadLocale } from "./i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("home.meta.title", undefined, locale);
  const description = t("home.meta.description", undefined, locale);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Production City™",
      images: "https://production.city/opengraph-image.png",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: "https://production.city/opengraph-image.png",
    },
  };
}

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <HomePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
