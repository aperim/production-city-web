/**
 * Home landing page — the primary entry point for Production City.
 * Route: / and /:locale/
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "./error-boundary";
import { HomePage } from "./pages/home";

export const metadata: Metadata = {
  title: "Production City™ — The Home of Australian Screen & Stage",
  description:
    "Production City™ is Australia's first fully integrated screen and stage production precinct. Apply for early access.",
  openGraph: {
    title: "Production City™ — The Home of Australian Screen & Stage",
    description:
      "Production City™ is Australia's first fully integrated screen and stage production precinct. Apply for early access.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
