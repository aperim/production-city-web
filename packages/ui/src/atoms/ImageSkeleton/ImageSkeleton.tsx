import { cn } from "../../lib/utils";

/** Props for the ImageSkeleton atom */
interface ImageSkeletonProps {
  /** Image width in pixels (used for aspect ratio) */
  width: number;
  /** Image height in pixels (used for aspect ratio) */
  height: number;
  /** Average color of the image to use as background */
  averageColor?: string;
  className?: string;
}

/**
 * ImageSkeleton atom — placeholder while image loads.
 *
 * Maintains aspect ratio from width/height.
 * Uses averageColor as background when available, falls back to muted.
 * Decorative: aria-hidden="true".
 */
function ImageSkeleton({
  width,
  height,
  averageColor,
  className,
}: ImageSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full rounded-md animate-pulse motion-reduce:animate-none",
        !averageColor && "bg-muted",
        className,
      )}
      style={{
        aspectRatio: `${width} / ${height}`,
        ...(averageColor ? { backgroundColor: averageColor } : {}),
      }}
    />
  );
}

export { ImageSkeleton };
export type { ImageSkeletonProps };
