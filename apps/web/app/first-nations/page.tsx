/**
 * First Nations approach page.
 * Route: /first-nations and /:locale/first-nations
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { FirstNationsPage } from "../pages/first-nations";

export const metadata: Metadata = {
  title: "First Nations — Production City™",
  description:
    "Production City™ is built in partnership with First Nations peoples. Our approach to Indigenous engagement, co-production, and cultural respect.",
  openGraph: {
    title: "First Nations — Production City™",
    description:
      "Production City™ is built in partnership with First Nations peoples. Our approach to Indigenous engagement, co-production, and cultural respect.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FirstNationsPage />
    </ErrorBoundary>
  );
}
