/**
 * Creative & Ecosystem landing page — the integrated creative ecosystem.
 * Route: /creative and /:locale/creative
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { CreativePage } from "../pages/creative";
import { getServerLocale } from "../i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("creative.meta.title", undefined, locale);
  const description = t("creative.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <CreativePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
