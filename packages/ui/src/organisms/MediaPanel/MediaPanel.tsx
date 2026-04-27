import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Attribution info for media panel image */
interface MediaPanelAttribution {
  photographer: string;
  source: string;
}

/** Props for the MediaPanel organism */
interface MediaPanelProps {
  /** Image source */
  imageSrc: string;
  /** Accessibility description */
  imageAlt: string;
  /** Position of the image relative to text */
  imagePosition?: "left" | "right";
  /** Text content */
  children: ReactNode;
  /** Image credit */
  attribution?: MediaPanelAttribution;
  className?: string;
}

/**
 * MediaPanel — side-by-side image + text content block.
 *
 * 50/50 split at desktop, stacked at mobile. Image has subtle hover zoom.
 * Alternating imagePosition creates visual rhythm across sections.
 */
function MediaPanel({
  imageSrc,
  imageAlt,
  imagePosition = "left",
  children,
  attribution,
  className,
}: MediaPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row",
        imagePosition === "right" && "md:flex-row-reverse",
        className,
      )}
    >
      {/* Image side */}
      <div
        data-testid="media-panel-image"
        className="relative w-full overflow-hidden md:w-1/2 pc-img-hover"
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {attribution && (
          <div
            className="absolute bottom-0 end-0 start-0 px-3 py-2 text-xs text-white/80"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            Photo by {attribution.photographer} / {attribution.source}
          </div>
        )}
      </div>

      {/* Text side */}
      <div className="flex w-full items-center md:w-1/2">
        <div
          className="w-full border-s-2 border-[var(--color-primary)] p-6 sm:p-8 lg:p-12"
          style={{ fontSize: "var(--font-size-body, 1rem)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { MediaPanel };
export type { MediaPanelProps, MediaPanelAttribution };
