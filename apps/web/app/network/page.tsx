/**
 * Network page — global campus network.
 * Route: /network and /:locale/network
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { NetworkPage } from "../pages/network";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Global Network — Production City™",
  description:
    "A global network of vertically integrated studio campuses across five continents. One operator. One standard.",
  openGraph: {
    title: "Global Network — Production City™",
    description:
      "A global network of vertically integrated studio campuses across five continents. One operator. One standard.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Global Network — Production City™",
    description: "A global network of vertically integrated studio campuses across five continents. One operator. One standard.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <NetworkPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
