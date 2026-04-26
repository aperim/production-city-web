/**
 * Screen Sound Stages facility detail page.
 * Route: /facilities/screen-sound-stages and /:locale/facilities/screen-sound-stages
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { FacilityScreenSoundStagesPage } from "../../pages/facility-screen-sound-stages";

export const metadata: Metadata = {
  title: "Screen Sound Stages — Production City™ Facilities",
  description:
    "Screen sound stages at Production City™: purpose-built for principal photography, LED volume production, and high-end episodic and feature film.",
  openGraph: {
    title: "Screen Sound Stages — Production City™ Facilities",
    description:
      "Screen sound stages at Production City™: purpose-built for principal photography, LED volume production, and high-end episodic and feature film.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilityScreenSoundStagesPage />
    </ErrorBoundary>
  );
}
