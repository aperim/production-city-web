import { cn } from "../../lib/utils";
import { EOIForm, type EOIFormLabels, type EOICategoryOption, type EOIFormData } from "../../molecules/EOIForm/EOIForm";

/** Props for the EOISection organism */
export interface EOISectionProps {
  /** Section heading (i18n). */
  heading: string;
  /** Optional context text (i18n). */
  contextText?: string;
  /** Form labels (i18n). */
  formLabels: EOIFormLabels;
  /** Categories for EOI form. */
  categories: EOICategoryOption[];
  /** Pre-selected category based on page context. */
  defaultCategory?: string;
  /** Form submission handler. */
  onSubmit: (data: EOIFormData) => Promise<void>;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * EOISection organism — complete expression of interest section.
 *
 * Heading + context text + EOIForm molecule.
 */
export function EOISection({
  heading,
  contextText,
  formLabels,
  categories,
  defaultCategory,
  onSubmit,
  className,
}: EOISectionProps) {
  return (
    <section className={cn("py-8", className)}>
      <div className="mx-auto max-w-lg">
        <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
        {contextText && (
          <p className="mt-2 text-sm text-muted-foreground">{contextText}</p>
        )}
        <div className="mt-6">
          <EOIForm
            labels={formLabels}
            categories={categories}
            defaultCategory={defaultCategory}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </section>
  );
}
