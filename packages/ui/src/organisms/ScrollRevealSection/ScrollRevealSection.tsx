import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the ScrollRevealSection organism */
interface ScrollRevealSectionProps {
  children: ReactNode;
  /** Stagger delay in ms */
  delay?: number;
  /** Reveal animation type */
  direction?: "up" | "fade";
  className?: string;
}

/**
 * ScrollRevealSection — fades content in when scrolling into view.
 *
 * Finding #7: Uses opacity only — never display:none or visibility:hidden.
 * Focusable children remain keyboard-reachable before intersection fires.
 * Finding #37: Content is visible (opacity: 1) when JS is disabled —
 * starts visible on server, JS hides it then reveals on intersection.
 */
function ScrollRevealSection({
  children,
  delay = 0,
  direction = "up",
  className,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Start true — SSR renders visible content (no-JS safe).
  // Client useEffect sets false, then IntersectionObserver reveals.
  const [isRevealed, setIsRevealed] = useState(true);
  const [jsReady, setJsReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      // Keep revealed, mark JS as ready so transitions apply
      setJsReady(true);
      return;
    }

    // JS is running — hide so IntersectionObserver can reveal
    setIsRevealed(false);
    setJsReady(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        // Only apply transition after JS has taken over to avoid FOUC
        jsReady && "transition-all duration-[600ms] ease-out",
        "motion-reduce:opacity-100 motion-reduce:transform-none",
        className,
      )}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform:
          isRevealed || direction === "fade"
            ? "translateY(0)"
            : "translateY(20px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export { ScrollRevealSection };
export type { ScrollRevealSectionProps };
