/**
 * Terms of Use page.
 * Route: /terms and /:locale/terms
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { TermsPage } from "../pages/terms";
import { getServerLocale } from "../i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("legal.terms.meta.title", undefined, locale);
  const description = t("legal.terms.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <TermsPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
