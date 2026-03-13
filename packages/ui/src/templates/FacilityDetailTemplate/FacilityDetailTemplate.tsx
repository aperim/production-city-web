import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** A facility specification. */
export interface FacilityDetailSpec {
  /** Spec label (i18n). */
  label: string;
  /** Spec value. */
  value: string;
}

/** Props for the FacilityDetailTemplate */
export interface FacilityDetailTemplateProps {
  /** Facility name (i18n). */
  name: string;
  /** Facility description (i18n). */
  description: string;
  /** Key specifications. */
  specs?: FacilityDetailSpec[];
  /** Use cases list (i18n). */
  useCases?: string[];
  /** Optional media content. */
  media?: ReactNode;
  /** Children slot for CTA or additional content. */
  children?: ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * FacilityDetailTemplate — template for facility deep-dive sections.
 *
 * Header with name and specs, description area, use cases list,
 * and related CTA slot. Clean layout per Uncodixify.
 */
export function FacilityDetailTemplate({
  name,
  description,
  specs,
  useCases,
  media,
  children,
  className,
}: FacilityDetailTemplateProps) {
  return (
    <section className={cn("py-8", className)}>
      {media && <div className="mb-6">{media}</div>}

      <h2 className="text-xl font-semibold text-foreground">{name}</h2>

      {specs && specs.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs text-muted-foreground">{spec.label}</dt>
              <dd className="text-sm font-medium text-foreground">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-4 text-sm text-muted-foreground">{description}</p>

      {useCases && useCases.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">Use Cases</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {useCases.map((useCase) => (
              <li key={useCase} className="text-sm text-muted-foreground">
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
