/**
 * Vision & Global Network landing page — global vision and stakeholder value.
 * Route: /vision and /:locale/vision
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { VisionPage } from "../pages/vision";
import { getServerLocale } from "../i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("vision.meta.title", undefined, locale);
  const description = t("vision.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <VisionPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
