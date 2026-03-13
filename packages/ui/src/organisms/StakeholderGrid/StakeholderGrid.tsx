import { cn } from "../../lib/utils";

/** A stakeholder type. */
export interface StakeholderItem {
  /** Stakeholder type name (i18n). */
  type: string;
  /** Description (i18n). */
  description: string;
  /** List of benefits (i18n). */
  benefits: string[];
}

/** Props for the StakeholderGrid organism */
export interface StakeholderGridProps {
  /** Section heading (i18n). */
  heading: string;
  /** Stakeholder types. */
  stakeholders: StakeholderItem[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * StakeholderGrid organism — grid showing stakeholder types and their benefits.
 *
 * Clean card layout per stakeholder type. No decorative elements.
 */
export function StakeholderGrid({
  heading,
  stakeholders,
  className,
}: StakeholderGridProps) {
  return (
    <section className={cn("py-8", className)}>
      <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stakeholders.map((stakeholder) => (
          <div
            key={stakeholder.type}
            className="border border-border rounded-md p-4"
          >
            <h3 className="text-sm font-semibold text-foreground">{stakeholder.type}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{stakeholder.description}</p>
            {stakeholder.benefits.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1">
                {stakeholder.benefits.map((benefit) => (
                  <li key={benefit} className="text-sm text-muted-foreground">
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
