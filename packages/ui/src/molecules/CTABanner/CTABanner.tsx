import { cn } from "../../lib/utils";
import { sanitizeHref } from "../../atoms/Link/Link";

/** Props for the CTABanner molecule */
export interface CTABannerProps {
  /** Heading text. */
  heading: string;
  /** Optional subtext below heading. */
  subtext?: string;
  /** Button label text. */
  buttonLabel: string;
  /** Button link target. */
  buttonHref?: string;
  /**
   * Banner variant.
   * - "inline": within content flow
   * - "footer": end of section, with top border
   * @default "inline"
   */
  variant?: "inline" | "footer";
  /** When true, uses tighter padding. */
  compact?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * CTABanner molecule — contextual call-to-action for EOI.
 *
 * Heading + subtext + button. NOT a hero section — clean, functional,
 * integrated into page flow. No gradient backgrounds or decorative elements.
 */
export function CTABanner({
  heading,
  subtext,
  buttonLabel,
  buttonHref = "#contact",
  variant = "inline",
  compact = false,
  className,
}: CTABannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between",
        compact ? "py-4" : "py-8",
        variant === "footer" && "border-t border-border pt-8",
        className,
      )}
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
        {subtext && (
          <p className="mt-1 text-sm text-muted-foreground">{subtext}</p>
        )}
      </div>
      <a
        href={sanitizeHref(buttonHref)}
        className={cn(
          "inline-flex shrink-0 items-center px-4 py-2 text-sm font-medium",
          "bg-primary text-primary-foreground rounded-md",
          "transition-colors duration-150 hover:opacity-90",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        {buttonLabel}
      </a>
    </div>
  );
}
