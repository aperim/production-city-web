import {
  useState,
  useRef,
  useId,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

/** A single dropdown menu item */
export interface DropdownMenuItem {
  /** Unique item identifier. */
  id: string;
  /** Display label. */
  label: ReactNode;
  /** Click handler. */
  onSelect?: () => void;
  /** When true, item is visually separated from previous items. */
  separator?: boolean;
  /** When true, item cannot be selected. */
  disabled?: boolean;
  /** Optional icon rendered before the label. */
  icon?: ReactNode;
  /** When true, a checkmark is shown next to the label. */
  checked?: boolean;
}

/** Props for the Dropdown molecule */
export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * The trigger element (button, icon button, etc.).
   */
  trigger: ReactNode;
  /**
   * Menu items.
   */
  items: DropdownMenuItem[];
  /**
   * Accessible label for the menu.
   */
  "aria-label"?: string;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Called when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Menu alignment relative to trigger.
   * @default "start"
   */
  align?: "start" | "end";
}

/**
 * Dropdown molecule — trigger + floating menu with keyboard navigation.
 *
 * Implements the ARIA menu pattern: role="menu", role="menuitem".
 * Arrow key navigation, Escape to close, focus management.
 */
export function Dropdown({
  trigger,
  items,
  "aria-label": ariaLabel,
  open: openProp,
  onOpenChange,
  align = "start",
  className,
  ...props
}: DropdownProps) {
  const instanceId = useId();
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerId = `dropdown-trigger-${instanceId}`;
  const menuId = `dropdown-menu-${instanceId}`;

  function setOpen(value: boolean) {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  }

  function toggle() {
    setOpen(!open);
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
        !menuRef.current?.contains(target)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Focus first item when menu opens
  useEffect(() => {
    if (open) {
      const firstItem = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"])',
      );
      firstItem?.focus();
    }
  }, [open]);

  function handleMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const menuItems = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"])') ?? [],
    );
    const current = document.activeElement;
    const currentIndex = menuItems.indexOf(current as HTMLElement);

    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = menuItems[(currentIndex + 1) % menuItems.length];
      next?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = menuItems[(currentIndex - 1 + menuItems.length) % menuItems.length];
      prev?.focus();
    }
    if (e.key === "Home") {
      e.preventDefault();
      menuItems[0]?.focus();
    }
    if (e.key === "End") {
      e.preventDefault();
      menuItems[menuItems.length - 1]?.focus();
    }
    if (e.key === "Tab") {
      close();
    }
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  }

  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      {/* Trigger wrapper */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex cursor-pointer bg-transparent border-none p-0 focus:outline-none"
        aria-label={typeof trigger === "string" ? trigger : undefined}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : triggerId}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            "absolute top-full z-50 mt-1 min-w-40 rounded-sm border border-border bg-popover py-1 shadow-sm",
            align === "end" ? "end-0" : "start-0",
          )}
        >
          {items.map((item) => {
            const isCheckable = item.checked != null;
            return (
              <div key={item.id}>
                {item.separator && <div role="separator" className="my-1 h-px bg-border mx-1" />}
                <button
                  type="button"
                  role={isCheckable ? "menuitemcheckbox" : "menuitem"}
                  aria-checked={isCheckable ? item.checked : undefined}
                  aria-disabled={item.disabled}
                  disabled={item.disabled}
                  tabIndex={-1}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onSelect?.();
                      close();
                    }
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-start",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  {isCheckable && (
                    <span aria-hidden="true" className="w-4 shrink-0">
                      {item.checked ? "✓" : ""}
                    </span>
                  )}
                  {item.icon && (
                    <span aria-hidden="true" className="shrink-0 text-muted-foreground">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
