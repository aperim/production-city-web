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
  /** Show building and campus labels. Defaults to true. */
  showLabels?: boolean;
  /** Show access route overlays. Defaults to false. */
  showRoutes?: boolean;
  /** Enable orbit controls. Defaults to true. */
  enableRotate?: boolean;
  /** Enable zoom. Defaults to true. */
  enableZoom?: boolean;
  /** Enable pan. Defaults to false. */
  enablePan?: boolean;
  /** Auto-rotate the camera. Defaults to true. */
  autoRotate?: boolean;
  /** Render quality. Defaults to 'balanced'. */
  quality?: MasterplanQuality;
  /** Accessible label for the canvas region. */
  ariaLabel?: string;
  /** Additional CSS classes on the container. */
  className?: string;
}

/** Detects WebGL support without throwing. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl")
    );
  } catch {
    return false;
  }
}

/**
 * MasterplanViewer — organism that wraps the vanilla Three.js campus viewer.
 *
 * Lifecycle: createMasterplanViewer on mount, dispose() on unmount.
 * ResizeObserver keeps the canvas matched to the container.
 * Falls back to a plain message when WebGL is unavailable.
 */
export function MasterplanViewer({
  onFacilitySelect,
  showLabels = true,
  showRoutes = false,
  enableRotate = true,
  enableZoom = true,
  enablePan = false,
  autoRotate = true,
  quality = "balanced",
  ariaLabel = "Production City masterplan — interactive 3D campus viewer",
  className,
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

    const viewer = createMasterplanViewer(container, {
      mode: "embed",
      showLabels,
      showRoutes,
      enableRotate,
      enableZoom,
      enablePan,
      autoRotate,
      pauseAutoRotateOnInteraction: true,
      resumeAutoRotateAfterMs: 3000,
      quality,
      onFacilitySelect: onFacilitySelect ?? null,
    });
    viewerRef.current = viewer;
    setLoading(false);

    const observer = new ResizeObserver(() => {
      viewer.resize();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      viewer.dispose();
      viewerRef.current = null;
    };
    // Intentionally empty deps: viewer is created once on mount and
    // disposed on unmount. Options (showLabels, quality, etc.) are
    // passed at construction time; callers must remount to change them.
  }, []);  

  if (webglUnavailable) {
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
          className="absolute inset-0 flex items-center justify-center bg-neutral-950"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
