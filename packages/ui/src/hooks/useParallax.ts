import { useEffect, useRef, useState } from "react";

/** Options for the useParallax hook. */
interface UseParallaxOptions {
  /** Maximum pixel offset for the parallax effect. Default: 15 */
  maxOffset?: number;
  /** Minimum viewport width in px to enable parallax. Default: 768 */
  mobileBreakpoint?: number;
}

/**
 * useParallax — returns a translateY offset for subtle parallax on scroll.
 *
 * Finding #6: Uses CSS transform: translateY() only. NEVER background-attachment: fixed.
 * Disabled on mobile (performance) and when prefers-reduced-motion is active.
 *
 * @returns ref to attach to the parallax container, and the current offset in px.
 */
function useParallax<T extends HTMLElement = HTMLElement>(options: UseParallaxOptions = {}) {
  const { maxOffset = 15, mobileBreakpoint = 768 } = options;
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Disable on mobile
    if (window.innerWidth < mobileBreakpoint) return;

    // Disable when reduced motion is preferred
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    let rafId: number | null = null;
    let lastValue = 0;

    function computeOffset() {
      const rect = el!.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Calculate how far through the viewport the element is
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      // Map to offset range [-maxOffset, maxOffset], clamped
      const raw = (progress - 0.5) * 2 * maxOffset;
      const clamped = Math.max(-maxOffset, Math.min(maxOffset, raw));
      // Only update state when the rounded value actually changes
      const rounded = Math.round(clamped * 10) / 10;
      if (rounded !== lastValue) {
        lastValue = rounded;
        setOffset(rounded);
      }
      rafId = null;
    }

    function onScroll() {
      if (rafId === null) {
        rafId = requestAnimationFrame(computeOffset);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    computeOffset(); // Initial calculation
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [maxOffset, mobileBreakpoint]);

  return { ref, offset };
}

export { useParallax };
export type { UseParallaxOptions };
