/**
 * Vision & Global Network landing page — global vision and stakeholder value.
 * Route: /vision and /:locale/vision
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { VisionPage } from "../pages/vision";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Vision — Production City™",
  description: "The Production City™ vision: a global network of vertically integrated screen and stage campuses, starting in Sydney.",
  openGraph: {
    title: "Vision — Production City™",
    description: "The Production City™ vision: a global network of vertically integrated screen and stage campuses, starting in Sydney.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Vision — Production City™",
    description: "The Production City™ vision: a global network of vertically integrated screen and stage campuses, starting in Sydney.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <VisionPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
