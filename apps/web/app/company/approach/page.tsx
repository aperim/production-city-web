/**
 * Company approach page.
 * Route: /company/approach and /:locale/company/approach
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { CompanyApproachPage } from "../../pages/company-approach";
import { getServerLocale } from "../../i18n/get-server-locale.js";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../../i18n/x-locale-validation.js";
import { t, loadLocale } from "../../i18n/index.js";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("companyApproach.meta.title", undefined, locale);
  const description = t("companyApproach.meta.description", undefined, locale);
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
      <CompanyApproachPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
