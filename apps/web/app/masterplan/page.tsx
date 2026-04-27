/**
 * Campus Masterplan landing page — interactive 3D campus viewer with narrative arc.
 * Route: /masterplan and /:locale/masterplan
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { MasterplanPage } from "../pages/masterplan";

export const metadata: Metadata = {
  title: "Campus Masterplan — Production City™",
  description: "Explore the Production City™ campus masterplan: an interactive 3D view of the integrated screen and stage precinct.",
  openGraph: {
    title: "Campus Masterplan — Production City™",
    description: "Explore the Production City™ campus masterplan: an interactive 3D view of the integrated screen and stage precinct.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Campus Masterplan — Production City™",
    description: "Explore the Production City™ campus masterplan: an interactive 3D view of the integrated screen and stage precinct.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <MasterplanPage />
    </ErrorBoundary>
  );
}
