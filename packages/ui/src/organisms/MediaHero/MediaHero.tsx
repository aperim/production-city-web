import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ThemedImage } from "../../molecules/ThemedImage/ThemedImage";
import { MediaAttribution } from "../../molecules/MediaAttribution/MediaAttribution";

/** Props for the MediaHero organism */
interface MediaHeroProps {
  /** Image source for light theme */
  lightSrc: string;
  /** Image source for dark theme (falls back to lightSrc) */
  darkSrc?: string;
  /** Alt text for the image */
  alt: string;
  /** Image width in pixels */
  width: number;
  /** Hero height in pixels (used for min-height) */
  height?: number;
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
  /** Overlay content (headings, CTA buttons, etc.) */
  children?: ReactNode;
  className?: string;
}

/**
 * MediaHero organism — full-width hero image with overlay content.
 *
 * Passes loading="eager" and fetchPriority="high" (above-fold LCP element).
 * Hard-edged functional gradient overlay for text readability.
 * Attribution positioned bottom-right.
 */
function MediaHero({
  lightSrc,
  darkSrc,
  alt,
  width,
  height = 600,
  averageColor,
  photographer,
  photographerUrl,
  source,
  sourceUrl,
  aiAssisted,
  aiGenerated,
  hasFirstNationsPermission,
  children,
  className,
}: MediaHeroProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        className,
      )}
      style={{ minHeight: `${Math.min(height, 800)}px` }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <ThemedImage
          lightSrc={lightSrc}
          darkSrc={darkSrc}
          alt={alt}
          width={width}
          height={height}
          averageColor={averageColor}
          loading="eager"
          fetchPriority="high"
          className="h-full w-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
        />
      </div>

      {/* Functional gradient overlay (hard-edged per Uncodixify) */}
      {children && (
        <div
          data-testid="hero-gradient"
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }}
        />
      )}

      {/* Overlay content */}
      {children && (
        <div className="relative z-20 flex h-full items-end p-6 sm:p-8 lg:p-12">
          <div
            className="max-w-2xl text-white"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
          >
            {children}
          </div>
        </div>
      )}

      {/* Attribution (bottom-right) */}
      <div className="absolute bottom-0 right-0 z-20 px-3 py-2 text-xs text-white/70">
        <MediaAttribution
          photographer={photographer}
          photographerUrl={photographerUrl}
          source={source}
          sourceUrl={sourceUrl}
          aiAssisted={aiAssisted}
          aiGenerated={aiGenerated}
          hasFirstNationsPermission={hasFirstNationsPermission}
          className="text-white/70 [&_a]:text-white/80 [&_a:hover]:text-white"
        />
      </div>
    </section>
  );
}

export { MediaHero };
export type { MediaHeroProps };
