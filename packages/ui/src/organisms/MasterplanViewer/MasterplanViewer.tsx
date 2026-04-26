"use client";

import { useEffect, useRef, useState } from "react";
import {
  createMasterplanViewer,
  type Facility,
  type MasterplanViewerInstance,
  type MasterplanQuality,
} from "@productioncity/masterplan-viewer";
import { cn } from "../../lib/utils";

export type { Facility, MasterplanQuality };

export interface MasterplanViewerProps {
  /** Fires when the user clicks a facility. Null clears the selection. */
  onFacilitySelect?: (id: string | null, facility: Facility | null) => void;
  /**
   * Show building and campus labels.
   * Defaults to true on desktop, false on viewports narrower than 768px.
   */
  showLabels?: boolean;
  /** Show access route overlays. Defaults to false. */
  showRoutes?: boolean;
  /** Enable orbit controls. Defaults to true. */
  enableRotate?: boolean;
  /** Enable zoom. Defaults to true. */
  enableZoom?: boolean;
  /** Enable pan. Defaults to false. */
  enablePan?: boolean;
  /**
   * Auto-rotate the camera.
   * Overridden to false when the OS prefers-reduced-motion: reduce.
   */
  autoRotate?: boolean;
  /**
   * Render quality.
   * Defaults to 'lite' on viewports narrower than 768px, 'balanced' otherwise.
   */
  quality?: MasterplanQuality;
  /** Accessible label for the canvas region. */
  ariaLabel?: string;
  /** Additional CSS classes on the container. */
  className?: string;
  /**
   * Poster image shown as a static fallback when WebGL is unavailable.
   * Should be a dark-background image matching the golden-hour campus aesthetic.
   */
  posterSrc?: string;
  /** Descriptive alt text for the fallback poster. Falls back to ariaLabel. */
  posterAlt?: string;
}

/** Detects WebGL support without throwing. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** True when the OS has prefers-reduced-motion: reduce. */
function getReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** True when the viewport is narrower than 768px (mobile breakpoint). */
function getIsMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

/**
 * MasterplanViewer — organism that wraps the vanilla Three.js campus viewer.
 *
 * Lifecycle: createMasterplanViewer on mount, dispose() on unmount.
 * ResizeObserver keeps the canvas matched to the container.
 *
 * Accessibility:
 * - Respects prefers-reduced-motion: disables auto-rotate and responds to
 *   runtime changes via matchMedia.
 * - Falls back to a poster image (or descriptive text) when WebGL is unavailable.
 *
 * Mobile optimisation:
 * - quality defaults to 'lite' on viewports < 768px.
 * - showLabels defaults to false on viewports < 768px.
 */
export function MasterplanViewer({
  onFacilitySelect,
  showLabels,
  showRoutes = false,
  enableRotate = true,
  enableZoom = true,
  enablePan = false,
  autoRotate = true,
  quality,
  ariaLabel = "Production City masterplan — interactive 3D campus viewer",
  className,
  posterSrc,
  posterAlt,
}: MasterplanViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<MasterplanViewerInstance | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!hasWebGL()) {
      setWebglUnavailable(true);
      setLoading(false);
      return;
    }

    const isMobile = getIsMobile();
    const reducedMotion = getReducedMotion();

    const resolvedQuality: MasterplanQuality = quality ?? (isMobile ? "lite" : "balanced");
    const resolvedShowLabels = showLabels ?? !isMobile;
    const resolvedAutoRotate = reducedMotion ? false : autoRotate;

    const viewer = createMasterplanViewer(container, {
      mode: "embed",
      showLabels: resolvedShowLabels,
      showRoutes,
      enableRotate,
      enableZoom,
      enablePan,
      autoRotate: resolvedAutoRotate,
      pauseAutoRotateOnInteraction: true,
      resumeAutoRotateAfterMs: 3000,
      quality: resolvedQuality,
      onFacilitySelect: onFacilitySelect ?? null,
    });
    viewerRef.current = viewer;
    setLoading(false);

    // Update auto-rotate when the user changes their OS motion preference at runtime.
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => {
      viewerRef.current?.setAutoRotate(e.matches ? false : autoRotate);
    };
    motionQuery.addEventListener("change", handleMotionChange);

    const observer = new ResizeObserver(() => {
      viewer.resize();
    });
    observer.observe(container);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      observer.disconnect();
      viewer.dispose();
      viewerRef.current = null;
    };
    // Intentionally empty deps: viewer is created once on mount and
    // disposed on unmount. Options (showLabels, quality, etc.) are
    // passed at construction time; callers must remount to change them.
  }, []);

  if (webglUnavailable) {
    if (posterSrc) {
      return (
        <div
          role="img"
          aria-label={posterAlt ?? ariaLabel}
          className={cn("overflow-hidden bg-neutral-950", className)}
        >
          <img
            src={posterSrc}
            alt={posterAlt ?? ariaLabel}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }
    return (
      <div
        role="img"
        aria-label={ariaLabel}
        className={cn(
          "flex items-center justify-center bg-neutral-950 text-muted-foreground text-sm",
          className,
        )}
      >
        3D viewer requires WebGL, which is not available in this browser.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("relative bg-neutral-950", className)}
    >
      {loading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden bg-neutral-950"
        >
          {/* Cinematic shimmer — golden-hour radial pulse matching editorial dark theme */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                "radial-gradient(ellipse 90% 60% at 50% 55%, rgba(120,90,40,0.12) 0%, rgba(60,40,20,0.06) 50%, transparent 80%)",
            }}
          />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
