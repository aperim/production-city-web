/**
 * Commercial Sound Stages facility detail page.
 * Route: /facilities/commercial-sound-stages and /:locale/facilities/commercial-sound-stages
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { FacilityCommercialSoundStagesPage } from "../../pages/facility-commercial-sound-stages";

export const metadata: Metadata = {
  title: "Commercial Sound Stages — Production City™ Facilities",
  description:
    "Flexible commercial sound stages at Production City™: 45×45 m at 15 m clearance, full-surround LED, and integrated broadcast infrastructure.",
  openGraph: {
    title: "Commercial Sound Stages — Production City™ Facilities",
    description:
      "Flexible commercial sound stages at Production City™: 45×45 m at 15 m clearance, full-surround LED, and integrated broadcast infrastructure.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityCommercialSoundStagesPage />
    </ErrorBoundary>
  );
}
