import {
  useState,
  useRef,
  useId,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

/** Popover positioning */
export type PopoverPosition = "top" | "bottom" | "left" | "right";

/** Props for the Popover molecule */
export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "content"> {
  /**
   * The element that triggers the popover.
   */
  trigger: ReactNode;
  /**
   * Popover panel content. ReactNode only.
   */
  content: ReactNode;
  /**
   * Preferred position relative to trigger.
   * @default "bottom"
   */
  position?: PopoverPosition;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Called when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * When true, the popover has a close button.
   * @default false
   */
  showClose?: boolean;
  /**
   * Accessible label for the dialog.
   */
  "aria-label"?: string;
}

/**
 * Popover molecule — trigger + floating content panel with focus management.
 *
 * Focus is trapped inside the panel when open.
 * Escape closes the panel and returns focus to trigger.
 * Implements role="dialog" with aria-modal.
 */
export function Popover({
  trigger,
  content,
  position = "bottom",
  open: openProp,
  onOpenChange,
  showClose = false,
  "aria-label": ariaLabel,
  className,
  ...props
}: PopoverProps) {
  const instanceId = useId();
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerId = `popover-trigger-${instanceId}`;
  const panelId = `popover-panel-${instanceId}`;

  function setOpen(value: boolean) {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Close on outside click — use close() to restore focus to trigger
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Focus first focusable element in panel when it opens
  useEffect(() => {
    if (open) {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, [open]);

  // Focus trap inside panel
  const handlePanelKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const focusableElements = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusableElements.length === 0) return;

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
    [close],
  );

  const positionClasses: Record<PopoverPosition, string> = {
    bottom: "top-full mt-2 start-0",
    top: "bottom-full mb-2 start-0",
    left: "end-full me-2 top-0",
    right: "start-full ms-2 top-0",
  };

  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
        className="inline-flex cursor-pointer bg-transparent border-none p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : triggerId}
          onKeyDown={handlePanelKeyDown}
          className={cn(
            "absolute z-50 min-w-48 rounded-sm border border-border bg-popover p-4 shadow-sm",
            positionClasses[position],
          )}
        >
          {showClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute end-2 top-2 rounded-sm p-0.5 text-muted-foreground opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
          {content}
        </div>
      )}
    </div>
  );
}
