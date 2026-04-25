/**
 * First Nations approach page.
 * Route: /first-nations and /:locale/first-nations
 */

import { ErrorBoundary } from "../error-boundary";
import { FirstNationsPage } from "../pages/first-nations";

export default function Page() {
  return (
    <ErrorBoundary>
      <FirstNationsPage />
    </ErrorBoundary>
  );
}
