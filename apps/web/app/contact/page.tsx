/**
 * Contact & EOI landing page.
 * Route: /contact and /:locale/contact
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { ContactPage } from "../pages/contact";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Contact — Production City™",
  description: "Get in touch with Production City™: enquiries for producers, investors, government, and technology partners.",
  openGraph: {
    title: "Contact — Production City™",
    description: "Get in touch with Production City™: enquiries for producers, investors, government, and technology partners.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Contact — Production City™",
    description: "Get in touch with Production City™: enquiries for producers, investors, government, and technology partners.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <ContactPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
