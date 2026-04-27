/**
 * Services page.
 * Route: /services and /:locale/services
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { ServicesPage } from "../pages/services";
import { getServerLocale } from "../i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("services.meta.title", undefined, locale);
  const description = t("services.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <ServicesPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
