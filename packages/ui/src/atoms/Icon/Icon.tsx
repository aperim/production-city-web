import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const iconVariants = cva("inline-flex items-center justify-center shrink-0", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/** Props for the Icon atom */
interface IconProps extends VariantProps<typeof iconVariants> {
  /**
   * The icon content (SVG or icon component).
   */
  children: ReactNode;
  /**
   * When provided, the icon is announced by screen readers with this label.
   * When omitted, the icon is treated as decorative (aria-hidden="true").
   */
  label?: string;
  className?: string;
}

/**
 * Icon atom - consistent sizing wrapper for SVG icons.
 *
 * Decorative icons (no label): aria-hidden="true" applied automatically.
 * Meaningful icons (with label): role="img" and aria-label applied.
 *
 * Sizes: sm (16px), md (20px), lg (24px), xl (32px).
 */
function Icon({ children, label, size, className }: IconProps) {
  if (label) {
    return (
      <span
        role="img"
        aria-label={label}
        className={cn(iconVariants({ size }), className)}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(iconVariants({ size }), className)}
    >
      {children}
    </span>
  );
}

export { Icon, iconVariants };
export type { IconProps };
