/**
 * Broadcast Theatre facility detail page.
 * Route: /facilities/broadcast-theatre and /:locale/facilities/broadcast-theatre
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { FacilityBroadcastTheatrePage } from "../../pages/facility-broadcast-theatre";

export const metadata: Metadata = {
  title: "Broadcast Theatre — Production City™ Facilities",
  description:
    "Production City™'s broadcast theatre: a 600-seat live performance and broadcast venue built for simultaneous stage performance and camera capture.",
  openGraph: {
    title: "Broadcast Theatre — Production City™ Facilities",
    description:
      "Production City™'s broadcast theatre: a 600-seat live performance and broadcast venue built for simultaneous stage performance and camera capture.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityBroadcastTheatrePage />
    </ErrorBoundary>
  );
}
