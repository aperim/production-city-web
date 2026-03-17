'use client';

import { useId, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';

/** A single sub-view tab definition. */
export interface SubViewTab {
  /** Unique identifier for the sub-view. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional badge (e.g. count). */
  badge?: string;
}

/** Props for the SubViewTabs molecule. */
export interface SubViewTabsProps {
  /** Available tabs (permission-filtered by the parent). */
  tabs: SubViewTab[];
  /** Currently active tab ID. */
  activeTab: string;
  /** Called when the user selects a different tab. */
  onTabChange: (tabId: string) => void;
  /** Accessible label for the tablist. */
  'aria-label'?: string;
  /** Additional class names. */
  className?: string;
}

/**
 * SubViewTabs molecule — horizontal tab bar for switching between sub-views
 * within a canvas organism.
 *
 * Implements the ARIA tabs pattern with keyboard navigation (arrow keys, Home, End).
 * Hidden when there are fewer than 2 tabs.
 *
 * Parent components are responsible for permission-filtering the tabs array
 * before passing it in.
 */
export function SubViewTabs({
  tabs,
  activeTab,
  onTabChange,
  'aria-label': ariaLabel = 'Sub-views',
  className,
}: SubViewTabsProps) {
  const instanceId = useId();

  // Don't render if fewer than 2 tabs
  if (tabs.length < 2) return null;

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== undefined) {
      e.preventDefault();
      const target = tabs[nextIndex];
      if (target) {
        onTabChange(target.id);
        document.getElementById(`svtab-${instanceId}-${target.id}`)?.focus();
      }
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={cn(
        'flex border-b border-border gap-0 overflow-x-auto shrink-0',
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={`svtab-${instanceId}-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium px-4 py-2 border-b-2 -mb-px transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {tab.badge != null && (
              <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-xs">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
