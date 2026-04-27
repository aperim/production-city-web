import { cn } from "../../lib/utils";

/**
 * Validates a URL string for safe use in href attributes.
 * Allows relative URLs and https: scheme only. Rejects javascript:, data:, vbscript: etc.
 */
function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  // Relative URLs (starting with / or # or ?) are safe
  if (/^[/#?]/.test(trimmed)) return true;
  // Only allow https: absolute URLs
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:";
  } catch {
    // Not a valid absolute URL — treat as relative path (safe)
    return !trimmed.includes(":");
  }
}

/** CTA button definition for CinematicHero */
interface CinematicHeroCTA {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

/** Attribution info for hero image */
interface CinematicHeroAttribution {
  photographer: string;
  source: string;
}

/** Props for the CinematicHero organism */
interface CinematicHeroProps {
  /** Background image path */
  imageSrc: string;
  /** Accessibility description for the image */
  imageAlt: string;
  /** Primary heading (rendered as h1) */
  title: string;
  /** Secondary text below the title */
  subtitle?: string;
  /** Call-to-action buttons */
  ctas?: CinematicHeroCTA[];
  /** Overlay treatment for text readability */
  overlay?: "dark" | "light" | "none";
  /** Hero height: full (100dvh), tall (80dvh), medium (60dvh) */
  height?: "full" | "tall" | "medium";
  /** Image credit */
  attribution?: CinematicHeroAttribution;
  /** Parallax offset in pixels (applied via CSS transform). Use useParallax hook. */
  parallaxOffset?: number;
  className?: string;
}

const heightMap = {
  full: "100dvh",
  tall: "80dvh",
  medium: "60dvh",
} as const;

/**
 * CinematicHero — full-viewport hero section with cinematic presence.
 *
 * Uses semantic `<img>` (Finding #3), `100dvh` (Finding #18),
 * and a bottom-heavy overlay gradient for WCAG AA text contrast (Finding #8).
 */
function CinematicHero({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  ctas,
  overlay = "dark",
  height = "full",
  attribution,
  parallaxOffset = 0,
  className,
}: CinematicHeroProps) {
  const dvh = heightMap[height];

  return (
    <section
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height: dvh }}
    >
      {/* Semantic image — Finding #3: must be <img>, not background-image */}
      {/* Finding #6: parallax via CSS transform: translateY(), NEVER background-attachment: fixed */}
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover pc-parallax-img"
        style={parallaxOffset !== 0 ? { transform: `translateY(${parallaxOffset}px)` } : undefined}
      />

      {/* Overlay gradient for text readability — Finding #8 */}
      {overlay !== "none" && (
        <div
          data-testid="cinematic-overlay"
          className={cn(
            "absolute inset-0 z-10",
            overlay === "dark" &&
              "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
            overlay === "light" &&
              "bg-gradient-to-t from-white/80 via-white/30 to-transparent",
          )}
        />
      )}

      {/* Content — lower-third positioning */}
      <div className="relative z-20 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-12">
        <div className="max-w-3xl" style={{ paddingBottom: "var(--section-padding, 5rem)" }}>
          <h1
            className={cn(
              "font-bold tracking-tighter",
              overlay === "light" ? "text-neutral-950" : "text-white",
            )}
            style={{
              fontSize: "var(--font-size-display, clamp(3rem, 5vw, 4.5rem))",
              ...(overlay === "none" && { textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)" }),
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "mt-4",
                overlay === "light" ? "text-neutral-950/80" : "text-white/80",
              )}
              style={{
                fontSize: "var(--font-size-heading, clamp(1.5rem, 2.5vw, 2.25rem))",
                ...(overlay === "none" && { textShadow: "0 2px 6px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)" }),
              }}
            >
              {subtitle}
            </p>
          )}
          {ctas && ctas.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {ctas.map((cta) => {
                const safeHref = isSafeHref(cta.href) ? cta.href : "#";
                return (
                  <a
                    key={cta.href}
                    href={safeHref}
                    className={cn(
                      "inline-flex items-center rounded-sm px-6 py-3 font-medium pc-btn-hover",
                      cta.variant === "primary" &&
                        "bg-[var(--color-primary)] text-white",
                      cta.variant === "secondary" && overlay === "light"
                        ? "border border-neutral-950/40 text-neutral-950"
                        : cta.variant === "secondary" &&
                          "border border-white/40 text-white",
                    )}
                  >
                    {cta.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Attribution — bottom-right corner */}
      {attribution && (
        <div
          className={cn(
            "absolute bottom-2 end-3 z-20 text-xs",
            overlay === "light" ? "text-neutral-950/70" : "text-white/80",
          )}
          style={overlay === "none" ? { textShadow: "0 1px 3px rgba(0,0,0,0.9)" } : undefined}
        >
          Photo by {attribution.photographer} / {attribution.source}
        </div>
      )}
    </section>
  );
}

export { CinematicHero, isSafeHref };
export type { CinematicHeroProps, CinematicHeroCTA, CinematicHeroAttribution };
