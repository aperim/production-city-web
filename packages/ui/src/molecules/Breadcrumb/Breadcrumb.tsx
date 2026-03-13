import { type ReactNode, Fragment } from "react";
import { cn } from "../../lib/utils";

/** A single breadcrumb item */
export interface BreadcrumbItem {
  /** Display label. ReactNode for flexibility. */
  label: ReactNode;
  /** URL for the breadcrumb link. Omit for the current (last) item. */
  href?: string;
  /** Explicit key for list rendering. */
  key?: string;
}

/** Props for the Breadcrumb molecule */
export interface BreadcrumbProps {
  /** Array of breadcrumb items in order from root to current. */
  items: BreadcrumbItem[];
  /**
   * Separator rendered between items.
   * @default "/"
   */
  separator?: ReactNode;
  /**
   * Accessible label for the nav landmark.
   * @default "Breadcrumb"
   */
  "aria-label"?: string;
  /**
   * Additional class names for the nav element.
   */
  className?: string;
}

/**
 * Breadcrumb molecule — navigational landmark showing hierarchical path.
 *
 * The last item is marked as current page (aria-current="page").
 * Screen readers announce the full path via the structured list.
 */
export function Breadcrumb({
  items,
  separator = "/",
  "aria-label": ariaLabel = "Breadcrumb",
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("flex", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = item.key ?? index;

          return (
            <Fragment key={key}>
              <li className={cn("flex items-center", isLast && "text-foreground font-medium")}>
                {isLast || !item.href ? (
                  <span aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className="hover:text-foreground transition-colors duration-150 underline-offset-2 hover:underline"
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-muted-foreground/60 select-none">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
