import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CaseStudyQuote {
  text: string;
  attribution: string;
}

interface CaseStudyStat {
  value: string;
  label: string;
}

/** Props for the CaseStudyCard molecule */
interface CaseStudyCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card heading. */
  title: string;
  /** Optional image URL for the left panel. */
  imageSrc?: string;
  /** Alt text for the image. */
  imageAlt?: string;
  /** Optional headline stat displayed over the image. */
  stat?: CaseStudyStat;
  /** Narrative body content. */
  children: ReactNode;
  /** Optional pull quote shown at the bottom of the content. */
  quote?: CaseStudyQuote;
}

/**
 * CaseStudyCard molecule — horizontal layout on desktop (image left, content right),
 * stacked on mobile. Uses serif headings, mono labels, and muted body text.
 */
function CaseStudyCard({
  title,
  imageSrc,
  imageAlt = "",
  stat,
  children,
  quote,
  className,
  ...props
}: CaseStudyCardProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-md overflow-hidden",
        "flex flex-col md:flex-row",
        className,
      )}
      {...props}
    >
      {imageSrc && (
        <div className="relative shrink-0 w-full md:w-2/5 overflow-hidden bg-muted min-h-48 md:min-h-0 pc-img-hover">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {stat && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p
                className="text-white font-[--mono] leading-none"
                style={{ fontSize: "var(--font-size-h1, clamp(1.75rem, 4vw, 3rem))" }}
              >
                {stat.value}
              </p>
              <p className="text-white/80 font-[--mono] text-xs uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 p-6 flex-1">
        <h3
          className="font-[--serif] text-foreground leading-tight"
          style={{ fontSize: "var(--font-size-h3, clamp(1.25rem, 2.5vw, 1.75rem))" }}
        >
          {title}
        </h3>

        <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>

        {quote && (
          <blockquote className="border-l-2 border-accent pl-4 mt-2">
            <p className="text-foreground text-sm italic">"{quote.text}"</p>
            <footer className="mt-2 font-[--mono] text-xs text-muted-foreground uppercase tracking-widest">
              — {quote.attribution}
            </footer>
          </blockquote>
        )}
      </div>
    </div>
  );
}

export { CaseStudyCard };
export type { CaseStudyCardProps, CaseStudyQuote, CaseStudyStat };
