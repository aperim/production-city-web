/**
 * Facilities landing page — deep-dive into planned production facilities.
 * Route: /facilities and /:locale/facilities
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { FacilitiesPage } from "../pages/facilities";

export const metadata: Metadata = {
  title: "Facilities — Production City™",
  description:
    "World-class screen and stage production facilities: LED volumes, broadcast theatres, commercial and screen sound stages.",
  openGraph: {
    title: "Facilities — Production City™",
    description:
      "World-class screen and stage production facilities: LED volumes, broadcast theatres, commercial and screen sound stages.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Facilities — Production City™",
    description: "World-class screen and stage production facilities: LED volumes, broadcast theatres, commercial and screen sound stages.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilitiesPage />
    </ErrorBoundary>
  );
}
