"use client";

import { type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SubViewTabs, type SubViewTab } from "../../molecules/SubViewTabs/SubViewTabs";

/** Valid sub-view identifiers for the communications canvas. */
export type CommunicationsView = "announcements" | "categories" | "tags" | "subscriptions";

/** Props for the CommunicationsCanvas organism. */
export interface CommunicationsCanvasProps {
  /** Currently active sub-view. Defaults to "announcements". */
  activeView?: CommunicationsView;
  /** Called when the active sub-view changes. */
  onTabChange: (view: CommunicationsView) => void;
  /** Permission check function. */
  hasPermission: (permission: string) => boolean;
  /** Content for announcements sub-view. */
  announcementsContent: ReactNode;
  /** Content for categories sub-view. */
  categoriesContent: ReactNode;
  /** Content for tags sub-view. */
  tagsContent: ReactNode;
  /** Content for subscriptions sub-view. */
  subscriptionsContent: ReactNode;
  /** Loading state — shows skeleton. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Empty state flag. */
  empty?: boolean;
  /** Access denied flag for current sub-view. */
  accessDenied?: boolean;
  /** Custom className. */
  className?: string;
}

const SUB_VIEW_TABS: SubViewTab[] = [
  { id: "announcements", label: "Announcements", permission: "announcement:read_admin" },
  { id: "categories", label: "Categories", permission: "category:manage" },
  { id: "tags", label: "Tags", permission: "tag:manage" },
  { id: "subscriptions", label: "Subscriptions", permission: "subscription:manage" },
];

const EMPTY_MESSAGES: Record<CommunicationsView, string> = {
  announcements: "No announcements yet.",
  categories: "No categories yet.",
  tags: "No tags yet.",
  subscriptions: "No subscriptions yet.",
};

/**
 * Communications canvas for the Administration workspace.
 *
 * Contains 4 sub-views: Announcements, Categories, Tags, Subscriptions.
 * Each sub-view has per-feature permission gating.
 * Handles loading, empty, error, and access-denied states.
 *
 * @see Issue #442
 */
export function CommunicationsCanvas({
  activeView = "announcements",
  onTabChange,
  hasPermission,
  announcementsContent,
  categoriesContent,
  tagsContent,
  subscriptionsContent,
  loading = false,
  error,
  empty = false,
  accessDenied = false,
  className,
}: CommunicationsCanvasProps) {
  const contentMap: Record<CommunicationsView, ReactNode> = {
    announcements: announcementsContent,
    categories: categoriesContent,
    tags: tagsContent,
    subscriptions: subscriptionsContent,
  };

  function renderContent() {
    if (loading) {
      return (
        <div role="status" className="flex flex-col gap-3 p-4">
          <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          <span className="sr-only">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-sm text-destructive" role="alert">
          {error}
        </div>
      );
    }

    if (accessDenied) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Access denied. You do not have permission to view this content.
        </div>
      );
    }

    if (empty) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          {EMPTY_MESSAGES[activeView]}
        </div>
      );
    }

    return contentMap[activeView];
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <SubViewTabs
        tabs={SUB_VIEW_TABS}
        activeTab={activeView}
        onTabChange={(id) => onTabChange(id as CommunicationsView)}
        hasPermission={hasPermission}
      />
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
