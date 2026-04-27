/**
 * Community & Engagement landing page.
 * Route: /community and /:locale/community
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { CommunityPage } from "../pages/community";

export const metadata: Metadata = {
  title: "Community — Production City™",
  description: "Production City™ community: how we invest in local talent, industry, education, and cultural outcomes.",
  openGraph: {
    title: "Community — Production City™",
    description: "Production City™ community: how we invest in local talent, industry, education, and cultural outcomes.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Community — Production City™",
    description: "Production City™ community: how we invest in local talent, industry, education, and cultural outcomes.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <CommunityPage />
    </ErrorBoundary>
  );
}
