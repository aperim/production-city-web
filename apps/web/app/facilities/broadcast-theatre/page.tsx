/**
 * Broadcast Theatre facility detail page.
 * Route: /facilities/broadcast-theatre and /:locale/facilities/broadcast-theatre
 */

import { ErrorBoundary } from "../../error-boundary";
import { FacilityBroadcastTheatrePage } from "../../pages/facility-broadcast-theatre";

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityBroadcastTheatrePage />
    </ErrorBoundary>
  );
}
