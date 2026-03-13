import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { sanitizeHref } from "../Link/Link";

/** Props for the AttributionLink atom */
interface AttributionLinkProps {
  /** Photographer or creator name */
  photographer: string;
  /** URL to the photographer's profile */
  photographerUrl?: string;
  /** Source platform name (e.g., "Pexels") */
  source: string;
  /** URL to the source platform */
  sourceUrl?: string;
  className?: string;
}

/**
 * Renders a name, optionally as an external link.
 */
function CreditLink({
  name,
  url,
  testId,
}: {
  name: string;
  url?: string;
  testId?: string;
}): ReactNode {
  const safeUrl = url ? sanitizeHref(url) : undefined;
  if (safeUrl && safeUrl !== "#") {
    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
        className="truncate font-medium underline underline-offset-2 hover:text-foreground/80 max-w-[20ch] inline-block align-bottom"
      >
        {name}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <span
      data-testid={testId}
      className="truncate font-medium max-w-[20ch] inline-block align-bottom"
    >
      {name}
    </span>
  );
}

/**
 * AttributionLink atom — linked credit text for media source.
 *
 * Renders "Photo by {name} on {source}" with optional links.
 * External links open in new tab with rel="noopener noreferrer".
 */
function AttributionLink({
  photographer,
  photographerUrl,
  source,
  sourceUrl,
  className,
}: AttributionLinkProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1 text-sm text-muted-foreground", className)}>
      <span>Photo by</span>
      <CreditLink
        name={photographer}
        url={photographerUrl}
        testId="photographer-name"
      />
      <span>on</span>
      <CreditLink name={source} url={sourceUrl} testId="source-name" />
    </span>
  );
}

export { AttributionLink };
export type { AttributionLinkProps };
