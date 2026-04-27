/**
 * Broadcast Control Room facility detail page.
 * Route: /facilities/broadcast-control-room and /:locale/facilities/broadcast-control-room
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { FacilityBroadcastControlRoomPage } from "../../pages/facility-broadcast-control-room";

export const metadata: Metadata = {
  title: "Broadcast Control Room — Production City™ Facilities",
  description:
    "A purpose-built broadcast control room supporting live-to-air, OB, and multi-format production workflows at Production City™.",
  openGraph: {
    title: "Broadcast Control Room — Production City™ Facilities",
    description:
      "A purpose-built broadcast control room supporting live-to-air, OB, and multi-format production workflows at Production City™.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Broadcast Control Room — Production City™ Facilities",
    description: "A purpose-built broadcast control room supporting live-to-air, OB, and multi-format production workflows at Production City™.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityBroadcastControlRoomPage />
    </ErrorBoundary>
  );
}
