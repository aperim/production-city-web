import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/**
 * Canvas surface variants supported by the dashboard. Mirrors the generated
 * `CanvasType` union in `apps/web/app/dashboard/_generated/workspace-config.ts`.
 * Defined locally so the design system has no inbound dependency on the
 * generated app config.
 */
export type CanvasEmptyStateVariant =
  | "table"
  | "chart"
  | "charts"
  | "board"
  | "calendar"
  | "documents"
  | "timeline"
  | "catalog"
  | "communications";

export interface CanvasEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * The canvas surface this empty state stands in for. Drives the
   * iconography. Required so every empty state visually identifies the
   * surface a viewer is looking at.
   */
  canvasType: CanvasEmptyStateVariant;
  /**
   * Activation timeline string. Required and never hardcoded inside the
   * component so feature owners can supply the precise wording (e.g.
   * "Activates Q3 2026" or "Activates September 2026"). Rendered as a
   * caption-style chip evoking a film slate.
   */
  activationLabel: string;
  /**
   * The "what it does" sentence — what this surface will deliver when
   * activated. The CMO bar: dignified, specific, never "Coming soon".
   */
  description: ReactNode;
  /**
   * Optional second-line note for additional context (provenance,
   * dependency, owner). Kept short.
   */
  note?: ReactNode;
  /**
   * Optional inline tag slot — typically a CanvasTag rendered above the
   * icon to declare Live / Provisional / Concept status.
   */
  tag?: ReactNode;
  /**
   * Optional CTA — link, button, or grouped controls.
   */
  action?: ReactNode;
  /**
   * Visual size variant.
   * - `page` (default) — full-canvas placeholder.
   * - `inline` — compact rendering for in-card or inline use.
   */
  variant?: "page" | "inline";
  /**
   * Polite live-region announcement. When true the wrapper is given
   * role="status" so screen readers announce the activation message
   * without interrupting the user. Defaults to true.
   */
  announce?: boolean;
}

/**
 * CanvasEmptyState — dignified empty state for dashboard canvas surfaces.
 *
 * Replaces "Coming soon" copy with an activation timeline + a specific
 * description of what the surface will deliver. Cinematic dark-leaning
 * treatment: mono uppercase activation chip, minimal canvas glyph,
 * neutral palette only.
 */
export function CanvasEmptyState({
  canvasType,
  activationLabel,
  description,
  note,
  tag,
  action,
  variant = "page",
  announce = true,
  className,
  ...props
}: CanvasEmptyStateProps) {
  const isPage = variant === "page";
  return (
    <div
      role={announce ? "status" : undefined}
      aria-live={announce ? "polite" : undefined}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        // Cinematic frame: subtle border, gentle gradient toward background.
        "rounded-md border border-border/60 bg-gradient-to-b from-muted/20 to-background/0",
        isPage ? "py-16 px-6 min-h-[280px]" : "py-8 px-4 min-h-[140px]",
        className,
      )}
      {...props}
    >
      {tag != null && (
        <div className={cn("mb-4 flex items-center justify-center")}>{tag}</div>
      )}

      <CanvasGlyph
        canvasType={canvasType}
        className={cn(
          "text-muted-foreground/80",
          isPage ? "h-10 w-10" : "h-7 w-7",
        )}
      />

      <p
        className={cn(
          // Mono uppercase tracking — cinematic film-slate cue. Kept at
          // foreground/70 → ≥ 4.5:1 against neutral-950 background.
          "mt-5 font-mono uppercase tracking-[0.18em] text-foreground/80",
          isPage ? "text-xs" : "text-[10px] mt-3",
        )}
      >
        {activationLabel}
      </p>

      <p
        className={cn(
          "mt-2 font-medium text-foreground",
          isPage ? "text-base max-w-md" : "text-sm max-w-xs",
        )}
      >
        {description}
      </p>

      {note != null && (
        <p
          className={cn(
            "mt-2 text-muted-foreground",
            isPage ? "text-sm max-w-sm" : "text-xs max-w-xs",
          )}
        >
          {note}
        </p>
      )}

      {action != null && (
        <div className={cn(isPage ? "mt-6" : "mt-4")}>{action}</div>
      )}
    </div>
  );
}

interface CanvasGlyphProps {
  canvasType: CanvasEmptyStateVariant;
  className?: string;
}

/**
 * CanvasGlyph — minimal 1.5px stroke iconography per canvas surface.
 * Decorative; uses `aria-hidden` because the surface name is announced
 * via the activation label and description text.
 */
function CanvasGlyph({ canvasType, className }: CanvasGlyphProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  switch (canvasType) {
    case "table":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M3 9h18" />
          <path d="M3 14h18" />
          <path d="M9 4v16" />
        </svg>
      );
    case "chart":
    case "charts":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M3 20h18" />
          <path d="M6 17V11" />
          <path d="M11 17V7" />
          <path d="M16 17v-4" />
          <path d="M21 17V9" />
        </svg>
      );
    case "board":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="5" height="16" rx="1" />
          <rect x="9.5" y="4" width="5" height="11" rx="1" />
          <rect x="16" y="4" width="5" height="14" rx="1" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="16" rx="1.5" />
          <path d="M3 10h18" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <rect x="7" y="13" width="3.5" height="3" rx="0.5" />
        </svg>
      );
    case "documents":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      );
    case "timeline":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h18" />
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
          <path d="M6 12V7" />
          <path d="M12 12v7" />
          <path d="M18 12v-3" />
        </svg>
      );
    case "catalog":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "communications":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
          <path d="M22 11v6a2 2 0 0 1-2 2h-1v3l-3-3" />
        </svg>
      );
    default: {
      const _exhaustive: never = canvasType;
      void _exhaustive;
      return null;
    }
  }
}
