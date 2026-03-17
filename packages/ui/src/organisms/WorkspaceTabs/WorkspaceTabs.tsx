"use client";

import { cn } from '../../lib/utils';
import { TabItem } from '../../atoms/TabItem/TabItem';
import type { FeatureDotStatus } from '../../atoms/FeatureStatusDot/FeatureStatusDot';

export interface WorkspaceTab {
  /** Unique tab ID */
  id: string;
  /** Display label */
  label: string;
  /** Tab path for navigation */
  path: string;
  /** Feature status */
  status?: FeatureDotStatus;
}

export interface WorkspaceTabsProps {
  /** Available tabs for the current workspace */
  tabs: WorkspaceTab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Called when a tab is selected */
  onTabChange?: (tabId: string, path: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Horizontal tab bar for workspace content areas.
 * Displays tabs with optional feature status dots.
 * Scrollable when tabs overflow.
 */
export function WorkspaceTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: WorkspaceTabsProps) {
  return (
    <div
      className={cn(
        'flex items-end border-b border-border overflow-x-auto px-4',
        'scrollbar-none',
        className,
      )}
      role="tablist"
      aria-label="Workspace tabs"
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          label={tab.label}
          active={activeTab === tab.id}
          status={tab.status}
          onClick={() => onTabChange?.(tab.id, tab.path)}
        />
      ))}
    </div>
  );
}
