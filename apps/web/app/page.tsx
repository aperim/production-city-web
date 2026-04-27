/**
 * Home landing page — the primary entry point for Production City.
 * Route: / and /:locale/
 */

import type { Metadata } from "vinext/shims/metadata";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "./i18n/x-locale-validation.js";
import { t, loadLocale } from "./i18n/index.js";
import { ErrorBoundary } from "./error-boundary";
import { HomePage } from "./pages/home";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("home.meta.title", undefined, locale);
  const description = t("home.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const headersList = await headers();
  const serverLocale = validateXLocale(headersList.get("X-Locale"));

  return (
    <ErrorBoundary>
      <HomePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
