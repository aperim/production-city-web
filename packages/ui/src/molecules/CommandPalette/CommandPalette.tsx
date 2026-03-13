import {
  useState,
  useRef,
  useId,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { cn } from "../../lib/utils";

/** A single command item */
export interface CommandItem {
  /** Unique identifier. */
  id: string;
  /** Display label (used for search matching). */
  label: string;
  /** Optional description shown below the label. */
  description?: string;
  /** Optional icon or ReactNode shown before the label. */
  icon?: ReactNode;
  /** Keyboard shortcut hint. */
  shortcut?: string;
  /** Group name this item belongs to. */
  group?: string;
  /** Click handler. */
  onSelect?: () => void;
  /** When true, item cannot be selected. */
  disabled?: boolean;
}

/** Props for the CommandPalette molecule */
export interface CommandPaletteProps {
  /** All available command items. */
  items: CommandItem[];
  /**
   * Whether the palette is open (controlled).
   */
  open: boolean;
  /**
   * Called when the palette should close.
   */
  onClose: () => void;
  /**
   * Accessible label.
   */
  "aria-label"?: string;
  /**
   * Input placeholder.
   * @default "Search commands..."
   */
  placeholder?: string;
  /**
   * Empty state message when no results.
   */
  emptyMessage?: ReactNode;
}

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/**
 * CommandPalette molecule — Cmd+K style search and command interface.
 *
 * Keyboard navigation: arrow keys, Escape to close, Enter to select.
 * Fuzzy search across label and description.
 * Implements combobox pattern with aria-activedescendant.
 * Focus trapped while open. All content is ReactNode.
 */
export function CommandPalette({
  items,
  open,
  onClose,
  "aria-label": ariaLabel = "Command palette",
  placeholder = "Search commands...",
  emptyMessage = "No matching commands.",
}: CommandPaletteProps) {
  const instanceId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Track the element that opened the palette so focus can be restored on close
  const openerRef = useRef<HTMLElement | null>(null);
  const inputId = `cmd-input-${instanceId}`;
  const listboxId = `cmd-listbox-${instanceId}`;

  // Filter items
  const filtered = useMemo(() => {
    const matched = items.filter(
      (item) => !item.disabled && (fuzzyMatch(query, item.label) || (item.description && fuzzyMatch(query, item.description))),
    );
    return matched;
  }, [items, query]);

  // Group results
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      const g = item.group ?? "";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    }
    return groups;
  }, [filtered]);

  // Flat ordered list for keyboard navigation
  const flatFiltered = useMemo(() => filtered, [filtered]);

  // Capture opener and focus input when palette opens
  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement;
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view (scrollIntoView may not be available in all environments)
  useEffect(() => {
    const activeItem = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (activeItem && typeof activeItem.scrollIntoView === "function") {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const close = useCallback(() => {
    onClose();
    setQuery("");
    // Restore focus to the element that opened the palette
    const opener = openerRef.current;
    if (opener && typeof opener.focus === "function") {
      // Use setTimeout to allow React to finish rendering before restoring focus
      setTimeout(() => opener.focus(), 0);
    }
  }, [onClose]);

  // Close on backdrop click
  useEffect(() => {
    if (!open) return;
    function handleBackdrop(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleBackdrop);
    return () => document.removeEventListener("mousedown", handleBackdrop);
  }, [open, close]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    // Focus trap: cycle Tab within the panel
    if (e.key === "Tab") {
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
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
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const active = flatFiltered[activeIndex];
      if (active) {
        active.onSelect?.();
        close();
      }
    }
  }

  const activeItemId = flatFiltered[activeIndex]
    ? `cmd-item-${instanceId}-${flatFiltered[activeIndex].id}`
    : undefined;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20"
        aria-hidden="true"
        onClick={close}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-lg rounded-sm border border-border bg-popover shadow-sm overflow-hidden"
      >
        {/* Search input — combobox pattern */}
        <div className="flex items-center gap-2 border-b border-border px-3">
          <span aria-hidden="true" className="shrink-0 text-muted-foreground text-sm">
            ⌘
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={flatFiltered.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeItemId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="shrink-0 rounded-sm px-1 py-0.5 text-xs text-muted-foreground border border-border hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            esc
          </button>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Commands"
          className="max-h-72 overflow-y-auto py-1"
        >
          {flatFiltered.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground" aria-live="polite">
              {emptyMessage}
            </li>
          ) : (
            Object.entries(grouped).map(([group, groupItems]) => (
              <li key={group || "__ungrouped"}>
                {group && (
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {group}
                  </p>
                )}
                <ul role="group" aria-label={group || undefined}>
                  {groupItems.map((item) => {
                    const itemIndex = flatFiltered.indexOf(item);
                    const isActive = itemIndex === activeIndex;
                    const itemId = `cmd-item-${instanceId}-${item.id}`;

                    return (
                      <li
                        key={item.id}
                        id={itemId}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          item.onSelect?.();
                          close();
                        }}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        className={cn(
                          "flex cursor-default items-center gap-2.5 px-3 py-2 text-sm",
                          isActive && "bg-accent text-accent-foreground",
                        )}
                      >
                        {item.icon && (
                          <span aria-hidden="true" className="shrink-0 text-muted-foreground">
                            {item.icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{item.label}</p>
                          {item.description && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.shortcut && (
                          <kbd className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-xs text-muted-foreground font-mono">
                            {item.shortcut}
                          </kbd>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
