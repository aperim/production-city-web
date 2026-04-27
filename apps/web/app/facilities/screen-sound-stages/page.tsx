/**
 * Screen Sound Stages facility detail page.
 * Route: /facilities/screen-sound-stages and /:locale/facilities/screen-sound-stages
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { FacilityScreenSoundStagesPage } from "../../pages/facility-screen-sound-stages";
import { getServerLocale } from "../../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Screen Sound Stages — Production City™ Facilities",
  description:
    "Screen sound stages at Production City™: purpose-built for principal photography, LED volume production, and high-end episodic and feature film.",
  openGraph: {
    title: "Screen Sound Stages — Production City™ Facilities",
    description:
      "Screen sound stages at Production City™: purpose-built for principal photography, LED volume production, and high-end episodic and feature film.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Screen Sound Stages — Production City™ Facilities",
    description: "Screen sound stages at Production City™: purpose-built for principal photography, LED volume production, and high-end episodic and feature film.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <FacilityScreenSoundStagesPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
