import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { FacilityCard, type FacilitySpec } from "../../molecules/FacilityCard/FacilityCard";

/** A facility item for the showcase. */
export interface FacilityShowcaseItem {
  /** Facility name. */
  name: string;
  /** Brief description. */
  description: string;
  /** Optional specs. */
  specs?: FacilitySpec[];
  /** Optional link. */
  href?: string;
  /** Optional media content. */
  media?: ReactNode;
}

/** Props for the FacilityShowcase organism */
export interface FacilityShowcaseProps {
  /** Section heading (i18n). */
  heading: string;
  /** Optional intro text (i18n). */
  intro?: string;
  /** Facilities to display. */
  facilities: FacilityShowcaseItem[];
  /** Loading state. */
  loading?: boolean;
  /** Empty state message (i18n). */
  emptyMessage?: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * FacilityShowcase organism — grid of FacilityCard molecules.
 *
 * Responsive: 3-col desktop, 2-col tablet, 1-col mobile.
 */
export function FacilityShowcase({
  heading,
  intro,
  facilities,
  loading = false,
  emptyMessage,
  className,
}: FacilityShowcaseProps) {
  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      {intro && <p className="mt-2 text-sm text-muted-foreground">{intro}</p>}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              aria-hidden="true"
              className="h-32 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      ) : facilities.length === 0 && emptyMessage ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.name}
              name={facility.name}
              description={facility.description}
              specs={facility.specs}
              href={facility.href}
              media={facility.media}
            />
          ))}
        </div>
      )}
    </section>
  );
}
