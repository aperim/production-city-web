import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { FAQItem } from "../../molecules/FAQItem/FAQItem";

/** A FAQ item for the section. */
export interface FAQSectionItem {
  /** Question text (i18n). */
  question: ReactNode;
  /** Answer content (i18n). */
  answer: ReactNode;
}

/** Props for the FAQSection organism */
export interface FAQSectionProps {
  /** Section heading (i18n). */
  heading: string;
  /** FAQ items. */
  items: FAQSectionItem[];
  /** Search input placeholder (i18n). Shows search when provided. */
  searchPlaceholder?: string;
  /** Empty results message (i18n). */
  emptyMessage?: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * FAQSection organism — list of FAQItem molecules with optional search.
 */
export function FAQSection({
  heading,
  items,
  searchPlaceholder,
  emptyMessage,
  className,
}: FAQSectionProps) {
  const [filter, setFilter] = useState("");

  const filteredItems = filter
    ? items.filter((item) => {
        const q = typeof item.question === "string" ? item.question : "";
        const a = typeof item.answer === "string" ? item.answer : "";
        const search = filter.toLowerCase();
        return q.toLowerCase().includes(search) || a.toLowerCase().includes(search);
      })
    : items;

  return (
    <section className={cn("py-8", className)}>
      {heading && <h2 className="text-xl font-semibold text-foreground">{heading}</h2>}

      {searchPlaceholder && (
        <div className="mt-4">
          <input
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={cn(
              "w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-2 focus:outline-offset-2 focus:outline-ring",
            )}
          />
        </div>
      )}

      <div className="mt-6">
        {filteredItems.length === 0 && emptyMessage ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          filteredItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))
        )}
      </div>
    </section>
  );
}
