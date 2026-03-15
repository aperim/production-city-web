"use client";

/**
 * Breadcrumb context for dashboard pages.
 * Pages set their breadcrumbs via useBreadcrumbs() and the layout reads them.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { BreadcrumbItem } from "@productioncity/holding-ui";

interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
});

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([]);

  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbsState(items);
  }, []);

  return (
    <BreadcrumbContext value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext>
  );
}

/** Read current breadcrumbs (used by the layout) */
export function useBreadcrumbState(): BreadcrumbItem[] {
  return useContext(BreadcrumbContext).breadcrumbs;
}

/** Set breadcrumbs from a page (used by individual pages) */
export function useSetBreadcrumbs(): (items: BreadcrumbItem[]) => void {
  return useContext(BreadcrumbContext).setBreadcrumbs;
}
