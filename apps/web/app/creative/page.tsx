/**
 * Creative & Ecosystem landing page — the integrated creative ecosystem.
 * Route: /creative and /:locale/creative
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { CreativePage } from "../pages/creative";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Creative — Production City™",
  description: "The Production City™ creative ecosystem: an integrated environment for screen and stage storytelling from development to distribution.",
  openGraph: {
    title: "Creative — Production City™",
    description: "The Production City™ creative ecosystem: an integrated environment for screen and stage storytelling from development to distribution.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Creative — Production City™",
    description: "The Production City™ creative ecosystem: an integrated environment for screen and stage storytelling from development to distribution.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <CreativePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
