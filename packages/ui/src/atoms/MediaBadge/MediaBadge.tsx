import { useState, useId, useCallback, type KeyboardEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const mediaBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        "ai-assisted": "border-amber-600/40 bg-amber-900/20 text-amber-400",
        "ai-generated": "border-violet-600/40 bg-violet-900/20 text-violet-400",
        "first-nations": "border-emerald-600/40 bg-emerald-900/20 text-emerald-400",
      },
      size: {
        sm: "h-5 w-5",
        md: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const BADGE_CONFIG = {
  "ai-assisted": {
    label: "AI-assisted media",
    tooltip: "This media was created with AI assistance",
    icon: (
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      </svg>
    ),
  },
  "ai-generated": {
    label: "AI-generated media",
    tooltip: "This media was generated entirely by AI",
    icon: (
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5V5a1 1 0 0 0 1 1h.5A2.5 2.5 0 0 1 16 8.5a2.5 2.5 0 0 1-2.5 2.5H13a1 1 0 0 0-1 1v.5A2.5 2.5 0 0 1 9.5 15 2.5 2.5 0 0 1 7 12.5V12a1 1 0 0 0-1-1h-.5A2.5 2.5 0 0 1 3 8.5 2.5 2.5 0 0 1 5.5 6H6a1 1 0 0 0 1-1v-.5A2.5 2.5 0 0 1 9.5 2" />
        <path d="M18 12a2 2 0 0 1 2 2v1a1 1 0 0 0 1 1 2 2 0 0 1 0 4h-1a1 1 0 0 0-1 1 2 2 0 0 1-4 0v-1a1 1 0 0 0-1-1 2 2 0 0 1 0-4h1a1 1 0 0 0 1-1 2 2 0 0 1 2-2" />
      </svg>
    ),
  },
  "first-nations": {
    label: "First Nations cultural permission",
    tooltip: "Used with First Nations cultural permission",
    icon: (
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a7 7 0 0 0 0 20" />
        <path d="M12 2a7 7 0 0 1 0 20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
} as const;

type MediaBadgeVariant = keyof typeof BADGE_CONFIG;

/** Props for the MediaBadge atom */
interface MediaBadgeProps extends Omit<VariantProps<typeof mediaBadgeVariants>, "variant"> {
  /** The badge classification variant */
  variant: MediaBadgeVariant;
  className?: string;
}

/**
 * MediaBadge atom — small badge for media classification.
 *
 * Variants: ai-assisted, ai-generated, first-nations.
 * Accessible: keyboard-focusable tooltip, aria-label for screen readers.
 */
function MediaBadge({ variant, size, className }: MediaBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();
  const config = BADGE_CONFIG[variant];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setShowTooltip(false);
  }, []);

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex cursor-default border-0 bg-transparent p-0",
        mediaBadgeVariants({ variant, size }),
        className,
      )}
      aria-label={config.label}
      aria-describedby={showTooltip ? tooltipId : undefined}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onKeyDown={handleKeyDown}
    >
      {config.icon}
      {showTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-sm px-2.5 py-1.5 text-xs bg-foreground text-background border border-border shadow-sm whitespace-nowrap pointer-events-none"
        >
          {config.tooltip}
        </span>
      )}
    </button>
  );
}

export { MediaBadge, mediaBadgeVariants };
export type { MediaBadgeProps, MediaBadgeVariant };
