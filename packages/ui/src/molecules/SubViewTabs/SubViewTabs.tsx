"use client";

import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";

/** Single sub-view tab definition. */
export interface SubViewTab {
  /** Unique tab identifier. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional numeric badge. */
  badge?: number;
  /** Permission string — tab hidden if user lacks this permission. */
  permission?: string;
}

/** Props for the SubViewTabs molecule. */
export interface SubViewTabsProps {
  /** Available sub-view tabs. */
  tabs: SubViewTab[];
  /** Currently active tab ID. */
  activeTab: string;
  /** Called when user selects a tab. */
  onTabChange: (tabId: string) => void;
  /** Permission check function. Tabs with a permission are hidden when this returns false. */
  hasPermission?: (permission: string) => boolean;
  /** Custom className. */
  className?: string;
}

/**
 * Secondary tab bar for sub-views within a workspace canvas.
 *
 * Visually distinct from WorkspaceTabs: uses pill/chip styling, smaller sizing.
 * ARIA: role="tablist" with aria-label="Sub-view navigation".
 * Keyboard: arrow navigation with Home/End support.
 *
 * @see Issue #442
 */
export function SubViewTabs({
  tabs,
  activeTab,
  onTabChange,
  hasPermission,
  className,
}: SubViewTabsProps) {
  const instanceId = useId();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Filter tabs by permission
  const visibleTabs = tabs.filter((tab) => {
    if (!tab.permission) return true;
    if (!hasPermission) return true;
    return hasPermission(tab.permission);
  });

  // If active tab is not in visible tabs, default to first visible
  const activeIsVisible = visibleTabs.some((t) => t.id === activeTab);
  const defaultTab = visibleTabs[0]?.id;

  useEffect(() => {
    if (!activeIsVisible && defaultTab) {
      onTabChange(defaultTab);
    }
  }, [activeIsVisible, defaultTab, onTabChange]);

  // Hide tablist when there's only one (or zero) visible tabs
  if (visibleTabs.length <= 1) {
    return null;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % visibleTabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + visibleTabs.length) % visibleTabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = visibleTabs.length - 1;
    }

    if (nextIndex !== undefined) {
      e.preventDefault();
      const target = visibleTabs[nextIndex];
      if (target) {
        tabRefs.current.get(target.id)?.focus();
      }
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Sub-view navigation"
      className={cn(
        "flex items-center gap-1 overflow-x-auto px-4 py-2",
        "scrollbar-none",
        className,
      )}
    >
      {visibleTabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={`subview-tab-${instanceId}-${tab.id}`}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-sm",
              "transition-colors duration-100",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className="inline-flex items-center rounded-sm bg-muted-foreground/20 px-1 py-0.5 text-[10px] leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
