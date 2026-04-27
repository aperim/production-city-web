/**
 * Community & Engagement landing page.
 * Route: /community and /:locale/community
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { CommunityPage } from "../pages/community";
import { getServerLocale } from "../i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("community.meta.title", undefined, locale);
  const description = t("community.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <CommunityPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
