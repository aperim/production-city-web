/**
 * Commercial Sound Stages facility detail page.
 * Route: /facilities/commercial-sound-stages and /:locale/facilities/commercial-sound-stages
 */

import { ErrorBoundary } from "../../error-boundary";
import { FacilityCommercialSoundStagesPage } from "../../pages/facility-commercial-sound-stages";

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityCommercialSoundStagesPage />
    </ErrorBoundary>
  );
}
