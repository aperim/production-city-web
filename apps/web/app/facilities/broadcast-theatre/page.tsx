/**
 * Broadcast Theatre facility detail page.
 * Route: /facilities/broadcast-theatre and /:locale/facilities/broadcast-theatre
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { FacilityBroadcastTheatrePage } from "../../pages/facility-broadcast-theatre";
import { getServerLocale } from "../../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Broadcast Theatre — Production City™ Facilities",
  description:
    "Production City™'s broadcast theatre: a 600-seat live performance and broadcast venue built for simultaneous stage performance and camera capture.",
  openGraph: {
    title: "Broadcast Theatre — Production City™ Facilities",
    description:
      "Production City™'s broadcast theatre: a 600-seat live performance and broadcast venue built for simultaneous stage performance and camera capture.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Broadcast Theatre — Production City™ Facilities",
    description: "Production City™'s broadcast theatre: a 600-seat live performance and broadcast venue built for simultaneous stage performance and camera capture.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <FacilityBroadcastTheatrePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
