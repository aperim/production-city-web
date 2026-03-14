'use client';

import { useState, useRef, useEffect, useCallback, useId, type ReactNode } from "react";
import { NotificationBadge } from "../../atoms/NotificationBadge/NotificationBadge";
import { cn } from "../../lib/utils";

/** Props for the NotificationBell organism */
interface NotificationBellProps {
  /** Number of unread notifications */
  count?: number;
  /** Panel content rendered when open */
  panel?: ReactNode;
  /** Called when the bell is clicked */
  onToggle?: (open: boolean) => void;
  className?: string;
}

/**
 * NotificationBell organism -- bell icon with badge and panel trigger.
 *
 * Click toggles a notification panel. Click-outside or Escape closes it.
 */
function NotificationBell({
  count,
  panel,
  onToggle,
  className,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const toggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
  }, [open, onToggle]);

  const close = useCallback(() => {
    setOpen(false);
    onToggle?.(false);
  }, [onToggle]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count != null && count > 0 && (
          <NotificationBadge
            count={count}
            className="absolute -top-0.5 -end-0.5"
          />
        )}
      </button>
      {open && panel && (
        <div id={panelId} className="absolute end-0 top-full mt-1 z-50">
          {panel}
        </div>
      )}
    </div>
  );
}

export { NotificationBell };
export type { NotificationBellProps };
