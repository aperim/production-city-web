import {
  useState,
  useId,
  type ReactNode,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

/** A single accordion item */
export interface AccordionItem {
  /** Unique identifier for this item. */
  id: string;
  /** Header label or content. */
  heading: ReactNode;
  /** Expanded panel content. */
  content: ReactNode;
  /** When true, this item cannot be toggled. */
  disabled?: boolean;
  /**
   * Whether this item is expanded by default (uncontrolled mode).
   * @default false
   */
  defaultOpen?: boolean;
}

/** Props for the Accordion molecule */
export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Accordion items. */
  items: AccordionItem[];
  /**
   * Allow multiple items to be open simultaneously.
   * @default false
   */
  multiple?: boolean;
  /**
   * Controlled open item IDs. When provided, component is controlled.
   */
  openItems?: string[];
  /**
   * Called when expanded items change.
   */
  onOpenChange?: (openIds: string[]) => void;
}

/**
 * Accordion molecule — collapsible sections with keyboard navigation.
 *
 * Implements the disclosure pattern with proper aria-expanded, aria-controls.
 * Supports single-open and multi-open modes.
 * Animations respect prefers-reduced-motion.
 */
export function Accordion({
  items,
  multiple = false,
  openItems: openItemsProp,
  onOpenChange,
  className,
  ...props
}: AccordionProps) {
  const instanceId = useId();
  const isControlled = openItemsProp !== undefined;

  const defaultOpen = items
    .filter((i) => i.defaultOpen && !i.disabled)
    .map((i) => i.id);

  const [internalOpen, setInternalOpen] = useState<string[]>(
    multiple ? defaultOpen : defaultOpen.slice(0, 1),
  );

  const openItems = isControlled ? openItemsProp : internalOpen;

  function toggle(id: string) {
    let next: string[];
    if (openItems.includes(id)) {
      next = openItems.filter((i) => i !== id);
    } else {
      next = multiple ? [...openItems, id] : [id];
    }
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabledItems = items.filter((i) => !i.disabled);
    const enabledIndices = enabledItems.map((i) => items.findIndex((t) => t.id === i.id));
    const currentEnabledIndex = enabledIndices.indexOf(index);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
      const nextItem = enabledItems[nextIndex];
      if (nextItem) document.getElementById(triggerId(instanceId, nextItem.id))?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
      const prevItem = enabledItems[prevIndex];
      if (prevItem) document.getElementById(triggerId(instanceId, prevItem.id))?.focus();
    }
    if (e.key === "Home") {
      e.preventDefault();
      const firstItem = enabledItems[0];
      if (firstItem) document.getElementById(triggerId(instanceId, firstItem.id))?.focus();
    }
    if (e.key === "End") {
      e.preventDefault();
      const lastItem = enabledItems[enabledItems.length - 1];
      if (lastItem) document.getElementById(triggerId(instanceId, lastItem.id))?.focus();
    }
  }

  return (
    <div className={cn("flex flex-col divide-y divide-border border border-border rounded-sm", className)} {...props}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const tId = triggerId(instanceId, item.id);
        const pId = panelId(instanceId, item.id);

        return (
          <div key={item.id} className="flex flex-col">
            <h3 className="flex m-0">
              <button
                id={tId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={pId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-start",
                  "transition-colors duration-150 hover:bg-accent",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <span>{item.heading}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                >
                  ▾
                </span>
              </button>
            </h3>

            <div
              id={pId}
              role="region"
              aria-labelledby={tId}
              hidden={!isOpen}
              className={cn(
                "overflow-hidden text-sm",
                isOpen ? "border-t border-border" : "",
              )}
            >
              <div className="px-4 py-3">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function triggerId(instanceId: string, itemId: string) {
  return `accordion-trigger-${instanceId}-${itemId}`;
}

function panelId(instanceId: string, itemId: string) {
  return `accordion-panel-${instanceId}-${itemId}`;
}
