import { cn } from "../../lib/utils";

/** Aspect ratio variants for PlateImage */
export type PlateImageAspect = "16/9" | "4/3" | "3/4" | "1/1";

/** Props for the PlateImage molecule */
export interface PlateImageProps {
  /**
   * Corner label — top-left (e.g., "A · SCREEN SOUND STAGE").
   * Monospace, muted.
   */
  cornerLabel?: string;
  /**
   * Corner label — top-right (e.g., "2,025 m²").
   * Monospace, muted.
   */
  cornerLabelRight?: string;
  /**
   * Center label displayed over the crosshatch pattern (e.g., "[ STAGE INTERIOR ]").
   */
  centerLabel?: string;
  /**
   * Bottom bar items — displayed as a flex row at the bottom.
   * Usually two values (left and right, e.g., ["45 × 45 m", "H 15 m"]).
   */
  bottomItems?: [string, string] | [string];
  /**
   * Accent border on the left edge (used for First Nations sections with ochre).
   * Pass a CSS color value or CSS custom property (e.g., "var(--ochre)").
   */
  accentBorder?: string;
  /**
   * Paper (light) variant — for use on light backgrounds.
   * Default is dark (crosshatch on near-black).
   */
  paper?: boolean;
  /** Aspect ratio. Defaults to "16/9". */
  aspect?: PlateImageAspect;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * PlateImage molecule — cinema-style image placeholder with crosshatch pattern,
 * corner labels, a center descriptor, and a bottom bar.
 *
 * Used as a placeholder/frame while real photography is awaited.
 * Maps to reference `.plate` pattern.
 *
 * Has a dark and paper (light) variant.
 */
export function PlateImage({
  cornerLabel,
  cornerLabelRight,
  centerLabel,
  bottomItems,
  accentBorder,
  paper = false,
  aspect = "16/9",
  className,
}: PlateImageProps) {
  const labelColor = paper ? "var(--muted-paper)" : "rgba(247,245,240,0.35)";
  const background = paper
    ? "repeating-linear-gradient(135deg, #E7E2D5 0 1px, transparent 1px 24px), linear-gradient(180deg, #EFEBE0, #E2DCCB)"
    : "repeating-linear-gradient(135deg, #1A1A1A 0 1px, transparent 1px 24px), linear-gradient(180deg, #141414, #0A0A0A)";

  return (
    <div
      className={cn("relative overflow-hidden border", className)}
      style={{
        aspectRatio: aspect,
        background,
        color: paper ? "var(--ink)" : "var(--paper)",
        borderColor: paper ? "var(--rule-paper)" : "var(--rule)",
        borderLeft: accentBorder ? `3px solid ${accentBorder}` : undefined,
        display: "grid",
        placeContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
      role="img"
      aria-label={centerLabel ?? "Image placeholder"}
    >
      {/* Top-left corner label */}
      {cornerLabel && (
        <span
          className="absolute left-3 top-3"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: labelColor,
            textTransform: "uppercase",
          }}
        >
          {cornerLabel}
        </span>
      )}

      {/* Top-right corner label */}
      {cornerLabelRight && (
        <span
          className="absolute right-3 top-3"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: labelColor,
            textTransform: "uppercase",
          }}
        >
          {cornerLabelRight}
        </span>
      )}

      {/* Center label */}
      {centerLabel && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: paper ? "var(--muted-paper)" : "rgba(247,245,240,0.5)",
            maxWidth: "22ch",
            textAlign: "center",
          }}
        >
          {centerLabel}
        </span>
      )}

      {/* Bottom bar */}
      {bottomItems && bottomItems.length > 0 && (
        <div
          className="absolute bottom-3 left-3 right-3 flex justify-between"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            color: labelColor,
            textTransform: "uppercase",
          }}
        >
          <span>{bottomItems[0]}</span>
          {bottomItems[1] && <span>{bottomItems[1]}</span>}
        </div>
      )}
    </div>
  );
}
