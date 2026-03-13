import {
  useState,
  useId,
  type ReactNode,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

/** A single tab item configuration */
export interface TabItem {
  /** Unique identifier for this tab. */
  id: string;
  /** Label displayed on the tab. */
  label: ReactNode;
  /** Content rendered when this tab is active. */
  content: ReactNode;
  /** When true, the tab cannot be selected. */
  disabled?: boolean;
  /** Optional badge rendered after the label. */
  badge?: ReactNode;
}

/** Props for the Tabs molecule */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Tab items with id, label, and content. */
  items: TabItem[];
  /**
   * Controlled active tab ID. When provided, component is controlled.
   */
  activeTab?: string;
  /**
   * Default tab ID for uncontrolled mode.
   */
  defaultTab?: string;
  /**
   * Called when the active tab changes.
   */
  onChange?: (tabId: string) => void;
  /**
   * Tab orientation.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Accessible label for the tablist.
   */
  "aria-label"?: string;
}

/**
 * Tabs molecule — keyboard-navigable tabbed interface.
 *
 * Implements the ARIA tabs pattern: role="tablist", role="tab", role="tabpanel".
 * Arrow key navigation with Home/End support.
 * Controlled and uncontrolled modes.
 */
export function Tabs({
  items,
  activeTab: activeTabProp,
  defaultTab,
  onChange,
  orientation = "horizontal",
  "aria-label": ariaLabel,
  className,
  ...props
}: TabsProps) {
  const instanceId = useId();
  const isControlled = activeTabProp !== undefined;

  const firstEnabled = items.find((t) => !t.disabled)?.id ?? items[0]?.id ?? "";
  const [internalTab, setInternalTab] = useState(defaultTab ?? firstEnabled);

  const activeTab = isControlled ? activeTabProp : internalTab;

  function activate(id: string) {
    if (!isControlled) setInternalTab(id);
    onChange?.(id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabledItems = items.filter((t) => !t.disabled);
    const enabledIndices = enabledItems.map((t) => items.findIndex((i) => i.id === t.id));
    const currentEnabledIndex = enabledIndices.indexOf(index);

    let nextIndex: number | undefined;

    if (orientation === "horizontal") {
      if (e.key === "ArrowRight") nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
      if (e.key === "ArrowLeft")
        nextIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
    } else {
      if (e.key === "ArrowDown") nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
      if (e.key === "ArrowUp")
        nextIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
    }
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = enabledItems.length - 1;

    if (nextIndex !== undefined) {
      e.preventDefault();
      const targetItem = enabledItems[nextIndex];
      if (targetItem) {
        activate(targetItem.id);
        document.getElementById(tabId(instanceId, targetItem.id))?.focus();
      }
    }
  }

  const activeItem = items.find((t) => t.id === activeTab) ?? items[0];

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-row gap-4" : "flex-col",
        className,
      )}
      {...props}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={cn(
          "flex shrink-0",
          orientation === "horizontal"
            ? "flex-row border-b border-border gap-0 overflow-x-auto"
            : "flex-col border-e border-border gap-0",
        )}
      >
        {items.map((item, index) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              id={tabId(instanceId, item.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(instanceId, item.id)}
              aria-disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => activate(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "disabled:pointer-events-none disabled:opacity-50",
                orientation === "horizontal"
                  ? [
                      "px-4 py-2 border-b-2 -mb-px",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    ]
                  : [
                      "px-3 py-2 text-start border-e-2 -me-px",
                      isActive
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    ],
              )}
            >
              {item.label}
              {item.badge != null && (
                <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-xs">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          id={panelId(instanceId, activeItem.id)}
          role="tabpanel"
          aria-labelledby={tabId(instanceId, activeItem.id)}
          tabIndex={0}
          className="flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring pt-3"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}

function tabId(instanceId: string, tabId: string) {
  return `tab-${instanceId}-${tabId}`;
}

function panelId(instanceId: string, tabId: string) {
  return `panel-${instanceId}-${tabId}`;
}
