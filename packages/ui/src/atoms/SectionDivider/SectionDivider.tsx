import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const sectionDividerVariants = cva("w-full my-8", {
  variants: {
    variant: {
      line: "border-t border-border",
      "spacing-only": "border-0",
      "with-accent": "border-0 h-0.5 bg-primary",
    },
  },
  defaultVariants: {
    variant: "line",
  },
});

/** Props for the SectionDivider atom */
interface SectionDividerProps extends VariantProps<typeof sectionDividerVariants> {
  /** Additional CSS classes. */
  className?: string;
}

/**
 * SectionDivider atom — subtle visual separator between landing page sections.
 *
 * Variants: line (default), spacing-only, with-accent.
 * Functional hierarchy marker, not decorative.
 */
function SectionDivider({ variant = "line", className }: SectionDividerProps) {
  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={cn(sectionDividerVariants({ variant }), className)}
    />
  );
}

export { SectionDivider, sectionDividerVariants };
export type { SectionDividerProps };
