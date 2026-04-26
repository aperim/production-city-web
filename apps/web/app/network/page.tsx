/**
 * Network page — global campus sequence.
 * Route: /network and /:locale/network
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { NetworkPage } from "../pages/network";

export const metadata: Metadata = {
  title: "Global Network — Production City™",
  description:
    "The Production City global campus network: a sequence of production precincts spanning Sydney, London, Toronto, Tokyo, and beyond.",
  openGraph: {
    title: "Global Network — Production City™",
    description:
      "The Production City global campus network: a sequence of production precincts spanning Sydney, London, Toronto, Tokyo, and beyond.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <NetworkPage />
    </ErrorBoundary>
  );
}
