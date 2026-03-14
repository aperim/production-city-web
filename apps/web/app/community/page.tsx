/**
 * Community & Engagement landing page.
 * Route: /community and /:locale/community
 */

import { ErrorBoundary } from "../error-boundary";
import { CommunityPage } from "../pages/community";

export default function Page() {
  return (
    <ErrorBoundary>
      <CommunityPage />
    </ErrorBoundary>
  );
}
