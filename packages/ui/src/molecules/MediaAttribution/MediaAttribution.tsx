import { cn } from "../../lib/utils";
import { AttributionLink } from "../../atoms/AttributionLink/AttributionLink";
import { MediaBadge } from "../../atoms/MediaBadge/MediaBadge";

/** Props for the MediaAttribution molecule */
interface MediaAttributionProps {
  /** Photographer or creator name */
  photographer: string;
  /** URL to the photographer's profile */
  photographerUrl?: string;
  /** Source platform name */
  source: string;
  /** URL to the source platform */
  sourceUrl?: string;
  /** Whether the media was AI-assisted */
  aiAssisted?: boolean;
  /** Whether the media was AI-generated */
  aiGenerated?: boolean;
  /** Whether the media has First Nations cultural permission */
  hasFirstNationsPermission?: boolean;
  className?: string;
}

/**
 * MediaAttribution molecule — combined attribution display with badges.
 *
 * Composes AttributionLink + applicable MediaBadge instances.
 * Renders badges inline with attribution text.
 */
function MediaAttribution({
  photographer,
  photographerUrl,
  source,
  sourceUrl,
  aiAssisted,
  aiGenerated,
  hasFirstNationsPermission,
  className,
}: MediaAttributionProps) {
  const hasBadges = aiAssisted || aiGenerated || hasFirstNationsPermission;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        className,
      )}
    >
      <AttributionLink
        photographer={photographer}
        photographerUrl={photographerUrl}
        source={source}
        sourceUrl={sourceUrl}
      />
      {hasBadges && (
        <span className="inline-flex items-center gap-1">
          {aiAssisted && <MediaBadge variant="ai-assisted" size="sm" />}
          {aiGenerated && <MediaBadge variant="ai-generated" size="sm" />}
          {hasFirstNationsPermission && (
            <MediaBadge variant="first-nations" size="sm" />
          )}
        </span>
      )}
    </div>
  );
}

export { MediaAttribution };
export type { MediaAttributionProps };
