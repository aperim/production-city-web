import { cn } from "../../lib/utils";
import { sanitizeHref } from "../../atoms/Link/Link";

/** A CTA button in the PageHero. */
export interface PageHeroCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

/** Props for the PageHero organism */
export interface PageHeroProps {
  /**
   * Eyebrow text above the heading (e.g., "Facilities — 01/04").
   * Rendered in monospace uppercase, muted.
   */
  eyebrow?: string;
  /** Page heading (h1). */
  heading: string;
  /** Lead paragraph below the heading. Serif font, constrained width. */
  lead?: string;
  /** Optional ghost number displayed as large background text (e.g., "01"). */
  ghost?: string;
  /** Optional CTA buttons. */
  ctas?: PageHeroCTA[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * PageHero organism — inner-page hero used on facility, service, network,
 * and company sub-pages. Dark background, constrained lead text.
 *
 * Maps to reference `.page-hero` pattern.
 */
export function PageHero({
  eyebrow,
  heading,
  lead,
  ghost,
  ctas,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-[var(--rule)]",
        "bg-[var(--black)] text-[var(--paper)]",
        "px-[var(--gutter)] pb-[clamp(56px,8vw,112px)] pt-[clamp(96px,14vw,200px)]",
        className,
      )}
    >
      {/* Ghost number — large decorative background text */}
      {ghost && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex select-none items-start justify-start"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(200px, 30vw, 400px)",
            lineHeight: 0.85,
            color: "rgba(247,245,240,0.03)",
            paddingLeft: "var(--gutter)",
            paddingTop: "clamp(40px,6vw,80px)",
          }}
        >
          {ghost}
        </div>
      )}

      <div className="relative wrap-wide" style={{ maxWidth: "var(--wrap-wide, 1440px)", margin: "0 auto" }}>
        {eyebrow && (
          <p
            className="mb-[clamp(16px,2vw,28px)]"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(247,245,240,0.6)",
            }}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className="mb-[clamp(20px,2vw,32px)]"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(40px,5.5vw,88px)",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            fontWeight: 300,
          }}
        >
          {heading}
        </h1>

        {lead && (
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(18px,1.6vw,24px)",
              lineHeight: 1.45,
              maxWidth: "44ch",
              color: "rgba(247,245,240,0.82)",
            }}
          >
            {lead}
          </p>
        )}

        {ctas && ctas.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {ctas.map((cta) => {
              const href = sanitizeHref(cta.href);
              return (
                <a
                  key={cta.href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 text-sm transition-opacity hover:opacity-80",
                    "border",
                    cta.variant === "primary"
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--paper)]"
                      : "border-[var(--paper)] text-[var(--paper)]",
                  )}
                  style={{ fontFamily: "var(--mono)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  {cta.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
