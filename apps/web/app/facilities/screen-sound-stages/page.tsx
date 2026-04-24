/**
 * Screen Sound Stages facility detail page.
 * Route: /facilities/screen-sound-stages and /:locale/facilities/screen-sound-stages
 */

import { ErrorBoundary } from "../../error-boundary";
import { FacilityScreenSoundStagesPage } from "../../pages/facility-screen-sound-stages";

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityScreenSoundStagesPage />
    </ErrorBoundary>
  );
}
