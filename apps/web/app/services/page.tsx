/**
 * Services page.
 * Route: /services and /:locale/services
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { ServicesPage } from "../pages/services";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Services — Production City™",
  description:
    "Integrated production services for screen and stage: pre-production, principal photography, post-production, and distribution.",
  openGraph: {
    title: "Services — Production City™",
    description:
      "Integrated production services for screen and stage: pre-production, principal photography, post-production, and distribution.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Services — Production City™",
    description: "Integrated production services for screen and stage: pre-production, principal photography, post-production, and distribution.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <ServicesPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
