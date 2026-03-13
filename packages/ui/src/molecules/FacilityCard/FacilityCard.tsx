import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** A key specification for a facility. */
export interface FacilitySpec {
  /** Spec label (e.g., "Dimensions"). */
  label: string;
  /** Spec value (e.g., "30m x 20m"). */
  value: string;
}

/** Props for the FacilityCard molecule */
export interface FacilityCardProps {
  /** Facility name. */
  name: string;
  /** Brief description. */
  description: string;
  /** Optional key specifications. */
  specs?: FacilitySpec[];
  /** Optional link target for facility detail. */
  href?: string;
  /** Optional media content (use MediaDisplay from Epic #155). */
  media?: ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * FacilityCard molecule — displays a facility with name, description, and specs.
 *
 * Clean card layout with subtle border, no shadows over 8px blur.
 * Supports optional specs grid and link to detail section.
 */
export function FacilityCard({
  name,
  description,
  specs,
  href,
  media,
  className,
}: FacilityCardProps) {
  const content = (
    <>
      {media && <div className="mb-3">{media}</div>}
      <h3 className="text-base font-semibold text-foreground">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {specs && specs.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs text-muted-foreground">{spec.label}</dt>
              <dd className="text-sm font-medium text-foreground">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );

  const cardClasses = cn(
    "block border border-border rounded-md p-4",
    "transition-colors duration-150",
    href && "hover:bg-accent",
    className,
  );

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
