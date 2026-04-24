/**
 * Broadcast Control Room facility detail page.
 * Route: /facilities/broadcast-control-room and /:locale/facilities/broadcast-control-room
 */

import { ErrorBoundary } from "../../error-boundary";
import { FacilityBroadcastControlRoomPage } from "../../pages/facility-broadcast-control-room";

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityBroadcastControlRoomPage />
    </ErrorBoundary>
  );
}
