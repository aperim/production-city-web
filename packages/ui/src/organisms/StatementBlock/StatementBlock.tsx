import { cn } from "../../lib/utils";

/** Props for the StatementBlock organism */
interface StatementBlockProps {
  /** The statement text */
  text: string;
  /** Source or context attribution */
  attribution?: string;
  /** Accent color for border decoration */
  accent?: "primary" | "secondary";
  className?: string;
}

/**
 * StatementBlock — large pull-quote or brand statement with dramatic typography.
 *
 * Display-tier typography (48px+), centered, with generous vertical padding.
 */
function StatementBlock({
  text,
  attribution,
  accent,
  className,
}: StatementBlockProps) {
  return (
    <section
      className={cn(
        "w-full text-center",
        accent === "primary" && "border-t border-b border-[var(--color-primary)]",
        accent === "secondary" && "border-t border-b border-[var(--color-secondary)]",
        className,
      )}
      style={{ padding: "var(--section-padding, 5rem) 1.5rem" }}
    >
      <blockquote
        data-testid="statement-text"
        className={cn(
          "mx-auto max-w-4xl font-bold tracking-tighter",
          accent === "primary" && "text-[var(--color-primary)]",
          accent === "secondary" && "text-[var(--color-secondary)]",
        )}
        style={{ fontSize: "var(--font-size-display, clamp(3rem, 5vw, 4.5rem))" }}
      >
        {text}
      </blockquote>
      {attribution && (
        <p
          className="mt-6 text-[var(--color-muted-foreground)]"
          style={{ fontSize: "var(--font-size-caption, 0.875rem)" }}
        >
          {attribution}
        </p>
      )}
    </section>
  );
}

export { StatementBlock };
export type { StatementBlockProps };
