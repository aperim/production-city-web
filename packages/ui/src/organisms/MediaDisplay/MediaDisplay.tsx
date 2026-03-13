import { cn } from "../../lib/utils";
import { ThemedImage } from "../../molecules/ThemedImage/ThemedImage";
import { MediaAttribution } from "../../molecules/MediaAttribution/MediaAttribution";

/** Props for the MediaDisplay organism */
interface MediaDisplayProps {
  /** Image source for light theme */
  lightSrc: string;
  /** Image source for dark theme (falls back to lightSrc) */
  darkSrc?: string;
  /** Alt text for the image */
  alt: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Average color for skeleton placeholder */
  averageColor?: string;
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
  /** CSS aspect ratio override (e.g., "16/9") */
  aspectRatio?: string;
  /** Loading strategy */
  loading?: "lazy" | "eager";
  /** Fetch priority hint */
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

/**
 * MediaDisplay organism — complete media display with attribution overlay.
 *
 * Composes ThemedImage + MediaAttribution.
 * Attribution appears as overlay on desktop, stacked caption on mobile.
 * Keyboard accessible with visible focus ring.
 */
function MediaDisplay({
  lightSrc,
  darkSrc,
  alt,
  width,
  height,
  averageColor,
  photographer,
  photographerUrl,
  source,
  sourceUrl,
  aiAssisted,
  aiGenerated,
  hasFirstNationsPermission,
  aspectRatio,
  loading,
  fetchPriority,
  className,
}: MediaDisplayProps) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
      role="figure"
      aria-label={`${alt} — Photo by ${photographer} on ${source}`}
    >
      <ThemedImage
        lightSrc={lightSrc}
        darkSrc={darkSrc}
        alt={alt}
        width={width}
        height={height}
        averageColor={averageColor}
        loading={loading}
        fetchPriority={fetchPriority}
        className="rounded-md"
      />
      <figcaption
        className={cn(
          /* Desktop: overlay at bottom */
          "mt-2 px-1",
          /* On larger screens: absolute overlay */
          "sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:px-3 sm:py-2",
          "sm:bg-background/60 sm:backdrop-blur-none",
          /* Hover: more opaque */
          "sm:opacity-80 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-150",
        )}
      >
        <MediaAttribution
          photographer={photographer}
          photographerUrl={photographerUrl}
          source={source}
          sourceUrl={sourceUrl}
          aiAssisted={aiAssisted}
          aiGenerated={aiGenerated}
          hasFirstNationsPermission={hasFirstNationsPermission}
        />
      </figcaption>
    </figure>
  );
}

export { MediaDisplay };
export type { MediaDisplayProps };
