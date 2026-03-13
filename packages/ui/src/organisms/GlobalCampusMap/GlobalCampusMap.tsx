import { cn } from "../../lib/utils";

/** A campus location. */
export interface CampusLocation {
  /** Location name (i18n). */
  name: string;
  /** Status (e.g., "Primary", "Planned") (i18n). */
  status: string;
  /** Brief description (i18n). */
  description: string;
}

/** Props for the GlobalCampusMap organism */
export interface GlobalCampusMapProps {
  /** Section heading (i18n). */
  heading: string;
  /** Campus locations. */
  locations: CampusLocation[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * GlobalCampusMap organism — visual representation of planned campus locations.
 *
 * NOT a real map embed — styled list with location details.
 * Clean, functional layout per Uncodixify.
 */
export function GlobalCampusMap({
  heading,
  locations,
  className,
}: GlobalCampusMapProps) {
  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <div
            key={location.name}
            className="border border-border rounded-md p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{location.name}</h3>
              <span className="text-xs text-muted-foreground">{location.status}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{location.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
