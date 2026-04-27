/**
 * FAQ landing page.
 * Route: /faq and /:locale/faq
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { FAQPage } from "../pages/faq";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("faq.meta.title", undefined, locale);
  const description = t("faq.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const headersList = await headers();
  const serverLocale = validateXLocale(headersList.get("X-Locale"));

  return (
    <ErrorBoundary>
      <FAQPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
