/**
 * Terms of Use page.
 * Route: /terms and /:locale/terms
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { TermsPage } from "../pages/terms";

export const metadata: Metadata = {
  title: "Terms of Use — Production City™",
  description: "Production City™ terms of use: the conditions governing use of the Production City website and services.",
  openGraph: {
    title: "Terms of Use — Production City™",
    description: "Production City™ terms of use: the conditions governing use of the Production City website and services.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Terms of Use — Production City™",
    description: "Production City™ terms of use: the conditions governing use of the Production City website and services.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <TermsPage />
    </ErrorBoundary>
  );
}
