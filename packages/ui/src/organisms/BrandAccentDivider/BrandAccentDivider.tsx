import { cn } from "../../lib/utils";

/** Props for the BrandAccentDivider organism */
interface BrandAccentDividerProps {
  /** Color variant */
  variant?: "primary" | "secondary" | "gradient";
  /** Width: full stretches edge-to-edge, centered is 60% and centered */
  width?: "full" | "centered";
  className?: string;
}

/**
 * BrandAccentDivider — subtle section separator with brand identity.
 *
 * Thin line (1-2px) with brand color. Gradient variant transitions
 * from primary to secondary — a tasteful thin accent.
 */
function BrandAccentDivider({
  variant = "primary",
  width = "full",
  className,
}: BrandAccentDividerProps) {
  const isGradient = variant === "gradient";

  return (
    <hr
      role="separator"
      className={cn(
        "border-0",
        width === "full" && "w-full",
        width === "centered" && "mx-auto w-3/5",
        variant === "primary" && "bg-[var(--color-primary)]",
        variant === "secondary" && "bg-[var(--color-secondary)]",
        className,
      )}
      style={{
        height: "2px",
        ...(isGradient && {
          background:
            "linear-gradient(to right, var(--color-primary), var(--color-secondary))",
        }),
      }}
    />
  );
}

export { BrandAccentDivider };
export type { BrandAccentDividerProps };
