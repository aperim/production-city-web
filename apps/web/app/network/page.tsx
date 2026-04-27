/**
 * Network page — global campus network.
 * Route: /network and /:locale/network
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { NetworkPage } from "../pages/network";

export const metadata: Metadata = {
  title: "Global Network — Production City™",
  description:
    "A global network of vertically integrated studio campuses across five continents. One operator. One standard.",
  openGraph: {
    title: "Global Network — Production City™",
    description:
      "A global network of vertically integrated studio campuses across five continents. One operator. One standard.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <NetworkPage />
    </ErrorBoundary>
  );
}
