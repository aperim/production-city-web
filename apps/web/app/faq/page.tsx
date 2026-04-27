/**
 * FAQ landing page.
 * Route: /faq and /:locale/faq
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { FAQPage } from "../pages/faq";

export const metadata: Metadata = {
  title: "FAQ — Production City™",
  description: "Frequently asked questions about Production City™: facilities, services, tenancy, investment, and First Nations partnership.",
  openGraph: {
    title: "FAQ — Production City™",
    description: "Frequently asked questions about Production City™: facilities, services, tenancy, investment, and First Nations partnership.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "FAQ — Production City™",
    description: "Frequently asked questions about Production City™: facilities, services, tenancy, investment, and First Nations partnership.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FAQPage />
    </ErrorBoundary>
  );
}
