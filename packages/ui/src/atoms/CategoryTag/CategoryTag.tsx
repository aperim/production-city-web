"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Props for the CategoryTag atom. */
export interface CategoryTagProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** Category display name. */
  name: string;
  /** Category slug (for identification/links). */
  slug: string;
  /** Whether this category is currently active/filtered. */
  active?: boolean;
  /** Click handler — called with no arguments. */
  onClick?: () => void;
}

/**
 * Clickable tag/chip for announcement categories.
 *
 * Renders as a button element for keyboard accessibility.
 * Active state uses a more prominent background.
 */
function CategoryTag({
  name,
  slug,
  active = false,
  onClick,
  className,
  ...props
}: CategoryTagProps) {
  return (
    <button
      type="button"
      data-slug={slug}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors duration-150",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-pressed={active}
      {...props}
    >
      {name}
    </button>
  );
}

export { CategoryTag };
