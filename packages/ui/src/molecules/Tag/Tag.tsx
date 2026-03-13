import { type ReactNode, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border font-medium transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        primary: "border-primary/30 bg-primary/10 text-primary",
        success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
        warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
        error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-0.5 text-sm",
      },
      selectable: {
        true: "cursor-pointer select-none hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      selectable: false,
    },
  },
);

/** Props for the Tag (Chip) molecule */
export interface TagProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof tagVariants> {
  /**
   * Tag label. ReactNode only.
   */
  label: ReactNode;
  /**
   * Optional icon rendered before the label.
   */
  icon?: ReactNode;
  /**
   * When provided, renders a remove button with this handler.
   */
  onRemove?: () => void;
  /**
   * Whether the tag is in a selected state (for selectable variant).
   */
  selected?: boolean;
  /**
   * Called when a selectable tag is clicked.
   */
  onSelect?: () => void;
}

/**
 * Tag / Chip molecule — compact label with optional icon and remove button.
 *
 * Variants: default, primary, success, warning, error.
 * Supports removable and selectable modes.
 * Remove button is labelled with tag content for screen readers.
 */
export function Tag({
  label,
  icon,
  onRemove,
  selected,
  onSelect,
  variant,
  size,
  selectable: selectableProp,
  className,
  ...props
}: TagProps) {
  const isSelectable = Boolean(onSelect) || selectableProp;
  const labelString = typeof label === "string" ? label : "item";

  if (isSelectable) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(tagVariants({ variant, size, selectable: true }), className)}
      >
        {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <span
      className={cn(tagVariants({ variant, size, selectable: false }), className)}
      {...props}
    >
      {icon && <span aria-hidden="true" className="shrink-0">{icon}</span>}
      <span className="max-w-32 truncate">{label}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${labelString}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "ml-0.5 shrink-0 rounded-sm opacity-60 hover:opacity-100",
            "focus-visible:outline-2 focus-visible:outline-ring",
            "min-h-[1.25rem] min-w-[1.25rem] flex items-center justify-center",
          )}
        >
          <span aria-hidden="true" className="text-xs leading-none">✕</span>
        </button>
      )}
    </span>
  );
}
