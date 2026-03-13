import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the ServiceCard molecule */
export interface ServiceCardProps {
  /** Service name (e.g., "Motion Capture"). */
  name: string;
  /** Brief description of the service. */
  description: string;
  /** Optional icon element (16-20px, monochrome per Uncodixify). */
  icon?: ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * ServiceCard molecule — displays a creative service area.
 *
 * Icon + name + brief description. Clean, minimal styling.
 * No decorative icon backgrounds per Uncodixify.
 */
export function ServiceCard({
  name,
  description,
  icon,
  className,
}: ServiceCardProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-md p-4",
        "transition-colors duration-150 hover:bg-accent",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
