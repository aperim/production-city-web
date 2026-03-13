import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ServiceCard } from "../../molecules/ServiceCard/ServiceCard";

/** A service item for the grid. */
export interface ServiceGridItem {
  /** Service name (i18n). */
  name: string;
  /** Brief description (i18n). */
  description: string;
  /** Optional icon. */
  icon?: ReactNode;
}

/** Props for the ServiceGrid organism */
export interface ServiceGridProps {
  /** Section heading (i18n). */
  heading: string;
  /** Services to display. */
  services: ServiceGridItem[];
  /** Loading state. */
  loading?: boolean;
  /** Empty state message (i18n). */
  emptyMessage?: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * ServiceGrid organism — grid of ServiceCard molecules.
 *
 * Responsive grid layout. Clean, no decorative elements.
 */
export function ServiceGrid({
  heading,
  services,
  loading = false,
  emptyMessage,
  className,
}: ServiceGridProps) {
  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-24 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      ) : services.length === 0 && emptyMessage ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.name}
              name={service.name}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>
      )}
    </section>
  );
}
