'use client';

/**
 * Data fetching layer for the Communications canvas.
 *
 * Provides hooks for loading announcements, categories, tags, and subscriptions
 * within the workspace context. All API calls use existing api-client functions.
 *
 * @see Issue #444
 */

import { useState, useCallback } from 'react';
import type {
  AdminAnnouncement,
  Category,
  CommunicationsView,
} from '@productioncity/holding-ui';
import type { Tag } from '../../../../../../packages/ui/src/types/announcements';

/** Communications data state for each sub-view. */
export interface CommunicationsDataState {
  announcements: AdminAnnouncement[];
  categories: Category[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
}

/** Hook providing communications data and actions. */
export function useCommunicationsData() {
  const [state, setState] = useState<CommunicationsDataState>({
    announcements: [],
    categories: [],
    tags: [],
    loading: false,
    error: null,
  });

  const [activeView, setActiveView] = useState<CommunicationsView>('announcements');

  const handleTabChange = useCallback((view: CommunicationsView) => {
    setActiveView(view);
    // Update URL query param via replaceState for invalid, pushState for valid changes
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  // Read initial view from URL
  const getInitialView = useCallback((): CommunicationsView => {
    if (typeof window === 'undefined') return 'announcements';
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const validViews: CommunicationsView[] = ['announcements', 'categories', 'tags', 'subscriptions'];
    if (view && validViews.includes(view as CommunicationsView)) {
      return view as CommunicationsView;
    }
    // Invalid view — replaceState to default
    if (view) {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
    }
    return 'announcements';
  }, []);

  const handleEdit = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    const base = window.location.pathname;
    window.location.href = `${base}/${id}/edit`;
  }, []);

  const handleView = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    const base = window.location.pathname;
    window.location.href = `${base}/${id}`;
  }, []);

  const handleCreate = useCallback(() => {
    if (typeof window === 'undefined') return;
    const base = window.location.pathname;
    window.location.href = `${base}/new`;
  }, []);

  return {
    ...state,
    setState,
    activeView,
    setActiveView,
    handleTabChange,
    getInitialView,
    handleEdit,
    handleView,
    handleCreate,
  };
}
