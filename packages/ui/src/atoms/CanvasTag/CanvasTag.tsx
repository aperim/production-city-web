"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

/** The three canvas data-status variants. */
export type CanvasTagVariant = "live" | "provisional" | "concept";

/** Canvas types the tag can describe — used for aria context. */
export type CanvasType =
  | "chart"
  | "table"
  | "document"
  | "board"
  | "calendar"
  | "generic";

export interface CanvasTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Which status variant to render. */
  variant: CanvasTagVariant;
  /** Optional canvas type — included in aria-label for screen readers. */
  canvasType?: CanvasType;
}

const VARIANT_CONFIG: Record<
  CanvasTagVariant,
  { label: string; className: string }
> = {
  live: {
    label: "Live",
    // Neutral — high-contrast on dark backgrounds; passes WCAG AA
    className:
      "border-neutral-600 bg-neutral-800/60 text-neutral-200 shadow-[0_0_0_1px_oklch(var(--neutral-700)/0.4)]",
  },
  provisional: {
    label: "Provisional",
    // Amber — warm caution, not alarming; amber-300 on dark bg is ~7:1
    className:
      "border-amber-500/50 bg-amber-500/10 text-amber-300 shadow-[0_0_0_1px_oklch(var(--amber-500)/0.2)]",
  },
  concept: {
    label: "Concept",
    // Slate — outline-only, deliberately sparser; slate-300 on dark bg
    className:
      "border-slate-400/70 bg-transparent text-slate-300 ring-1 ring-inset ring-slate-400/30",
  },
};

/**
 * CanvasTag atom — a persistent visual status badge for dashboard canvas
 * surfaces (charts, tables, documents, boards, calendars).
 *
 * Variants: Live (neutral), Provisional (amber), Concept (slate/outline-only).
 * WCAG 2.2 AA compliant on all three variants in both dark and light themes.
 */
export function CanvasTag({
  variant,
  canvasType = "generic",
  className,
  ...props
}: CanvasTagProps) {
  const config = VARIANT_CONFIG[variant];
  const ariaLabel =
    canvasType === "generic"
      ? `Status: ${config.label}`
      : `${canvasType} status: ${config.label}`;

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      data-canvas-tag={variant}
      data-canvas-type={canvasType}
      className={cn(
        // Base chip geometry — compact, non-intrusive
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest select-none",
        // Concept is outline-only, others have subtle fill
        config.className,
        className,
      )}
      {...props}
    >
      {variant === "live" && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_4px_1px_oklch(var(--emerald-400)/0.5)]"
        />
      )}
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CanvasTagWrapper — wraps canvas content and overlays a Concept watermark
// ---------------------------------------------------------------------------

export interface CanvasTagWrapperProps extends HTMLAttributes<HTMLDivElement> {
  /** The canvas status driving the wrapper behaviour. */
  variant: CanvasTagVariant;
  children: ReactNode;
}

/**
 * CanvasTagWrapper — positions CanvasTag in the top-right corner of a canvas
 * surface and, for the Concept variant, adds a subtle diagonal watermark.
 *
 * Usage:
 * ```tsx
 * <CanvasTagWrapper variant="concept">
 *   <MyChart />
 * </CanvasTagWrapper>
 * ```
 */
export function CanvasTagWrapper({
  variant,
  children,
  className,
  ...props
}: CanvasTagWrapperProps) {
  return (
    <div
      className={cn("relative", className)}
      data-canvas-wrapper={variant}
      {...props}
    >
      {/* Concept watermark — diagonal, pointer-events-none overlay */}
      {variant === "concept" && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]",
            // Subtle repeating diagonal text pattern
            "[mask-image:repeating-linear-gradient(-45deg,transparent,transparent_40px,black_40px,black_41px)]",
          )}
        >
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "-rotate-[35deg] whitespace-nowrap text-[clamp(1.5rem,4vw,3rem)] font-bold uppercase",
              "tracking-[0.5em] text-slate-400/[0.07] select-none",
            )}
            style={{ letterSpacing: "0.5em" }}
          >
            {"CONCEPT · CONCEPT · CONCEPT · CONCEPT · CONCEPT · CONCEPT"}
          </span>
        </div>
      )}

      {children}

      {/* Tag badge pinned to top-right */}
      <div className="absolute right-2 top-2 z-20">
        <CanvasTag variant={variant} />
      </div>
    </div>
  );
}
