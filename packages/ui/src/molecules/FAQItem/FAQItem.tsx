import { useState, useId, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the FAQItem molecule */
export interface FAQItemProps {
  /** The question text. */
  question: ReactNode;
  /** The answer content. */
  answer: ReactNode;
  /** Whether the item is expanded by default. */
  defaultOpen?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * FAQItem molecule — question + expandable answer.
 *
 * Smooth expand/collapse with 200ms ease transition.
 * No bouncy animations per Uncodixify.
 */
export function FAQItem({
  question,
  answer,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  const instanceId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const triggerId = `faq-trigger-${instanceId}`;
  const panelId = `faq-panel-${instanceId}`;

  return (
    <div className={cn("border-b border-border", className)}>
      <h3 className="flex m-0">
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between py-4 text-sm font-medium text-start",
            "transition-colors duration-150 hover:text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            isOpen ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <span>{question}</span>
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 ms-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="overflow-hidden text-sm"
      >
        <div className="pb-4 text-muted-foreground">{answer}</div>
      </div>
    </div>
  );
}
