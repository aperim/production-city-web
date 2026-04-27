/**
 * First Nations approach page.
 * Route: /first-nations and /:locale/first-nations
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { FirstNationsPage } from "../pages/first-nations";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "First Nations — Production City™",
  description:
    "Production City™ is built in partnership with First Nations peoples. Our approach to Indigenous engagement, co-production, and cultural respect.",
  openGraph: {
    title: "First Nations — Production City™",
    description:
      "Production City™ is built in partnership with First Nations peoples. Our approach to Indigenous engagement, co-production, and cultural respect.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "First Nations — Production City™",
    description: "Production City™ is built in partnership with First Nations peoples. Our approach to Indigenous engagement, co-production, and cultural respect.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <FirstNationsPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
