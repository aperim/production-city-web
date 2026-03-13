import {
  useRef,
  useId,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { cn } from "../../lib/utils";

/** Drawer position / type */
export type DrawerPosition = "left" | "right" | "bottom";

/** Props for the Drawer molecule */
export interface DrawerProps {
  /**
   * Whether the drawer is open.
   */
  open: boolean;
  /**
   * Called when the drawer should close.
   */
  onClose: () => void;
  /**
   * Drawer content. ReactNode only.
   */
  children: ReactNode;
  /**
   * Position of the drawer.
   * @default "right"
   */
  position?: DrawerPosition;
  /**
   * Optional title rendered in the drawer header.
   */
  title?: ReactNode;
  /**
   * Whether to show a close button in the header.
   * @default true
   */
  showClose?: boolean;
  /**
   * Accessible label for the dialog (used when title is not a string).
   */
  "aria-label"?: string;
  /**
   * Additional class names for the panel.
   */
  className?: string;
}

const panelPositionClasses: Record<DrawerPosition, string> = {
  left: "inset-y-0 start-0 h-full w-80 max-w-full translate-x-0 data-[closed]:-translate-x-full",
  right: "inset-y-0 end-0 h-full w-80 max-w-full translate-x-0 data-[closed]:translate-x-full",
  bottom:
    "inset-x-0 bottom-0 h-auto max-h-[85vh] w-full translate-y-0 data-[closed]:translate-y-full rounded-t-md",
};

/**
 * Drawer / BottomSheet molecule — side panel or mobile bottom sheet.
 *
 * Implements role="dialog" with aria-modal.
 * Focus is trapped inside when open; returns to trigger on close.
 * Escape key closes. Backdrop click closes.
 * Animations respect prefers-reduced-motion.
 */
export function Drawer({
  open,
  onClose,
  children,
  position = "right",
  title,
  showClose = true,
  "aria-label": ariaLabel,
  className,
}: DrawerProps) {
  const instanceId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = `drawer-title-${instanceId}`;

  // Capture opener and focus first element when drawer opens
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement;
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        // Restore focus to opener
        const opener = openerRef.current;
        if (opener && typeof opener.focus === "function") {
          setTimeout(() => opener.focus(), 0);
        }
        return;
      }
      if (e.key !== "Tab") return;

      const focusableElements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      // If no focusable elements, prevent Tab from leaving
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 motion-safe:animate-[fadeIn_150ms_ease]"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute flex flex-col bg-background border-border shadow-sm",
          "motion-safe:transition-transform motion-safe:duration-200",
          position === "left" && "border-e",
          position === "right" && "border-s",
          position === "bottom" && "border-t",
          panelPositionClasses[position],
          className,
        )}
      >
        {(title != null || showClose) && (
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            {title != null ? (
              <p id={titleId} className="text-sm font-medium text-foreground">
                {title}
              </p>
            ) : (
              <span />
            )}
            {showClose && (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="rounded-sm p-0.5 text-muted-foreground opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
