"use client";

/**
 * Hook for dashboard pages to declare their breadcrumbs.
 * Calls useSetBreadcrumbs on mount and clears on unmount.
 */

import { useEffect } from "react";
import type { BreadcrumbItem } from "@productioncity/holding-ui";
import { useSetBreadcrumbs } from "./breadcrumb-context";

export function useBreadcrumbs(items: BreadcrumbItem[]): void {
  const setBreadcrumbs = useSetBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs(items);
    return () => setBreadcrumbs([]);
    // JSON.stringify serializes items to avoid infinite re-renders from new array references
  }, [setBreadcrumbs, JSON.stringify(items)]);
}
