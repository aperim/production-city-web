'use client';

/**
 * Data fetching layer for the Communications canvas.
 *
 * Provides hooks for loading announcements within the workspace context.
 * Categories, tags, and subscriptions are Provisional (not yet implemented).
 *
 * @see Issue #PRO-3881
 */

import { useState, useCallback, useEffect } from 'react';
import type { CommunicationsView } from '@productioncity/holding-ui';
import {
  listAdminAnnouncements,
  type AdminAnnouncementItem,
} from '../../../lib/api-client';

/** Communications data state for the announcements sub-view. */
export interface CommunicationsDataState {
  announcements: AdminAnnouncementItem[];
  announcementsPagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

/** Hook providing communications data and actions. */
export function useCommunicationsData() {
  const [state, setState] = useState<CommunicationsDataState>({
    announcements: [],
    announcementsPagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 },
    loading: false,
    error: null,
  });

  const [activeView, setActiveView] = useState<CommunicationsView>(() => {
    if (typeof window === 'undefined') return 'announcements';
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const validViews: CommunicationsView[] = ['announcements', 'categories', 'tags', 'subscriptions'];
    if (view && validViews.includes(view as CommunicationsView)) {
      return view as CommunicationsView;
    }
    // Invalid view — replaceState to default
    if (view && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
    }
    return 'announcements';
  });

  const fetchAnnouncements = useCallback(async (page = 1) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await listAdminAnnouncements({ page, pageSize: 25 });
      if (!result.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error.message ?? 'Failed to load announcements.',
        }));
        return;
      }
      setState({
        announcements: result.data.announcements,
        announcementsPagination: result.data.pagination,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load announcements.',
      }));
    }
  }, []);

  // Fetch announcements when the view is announcements
  useEffect(() => {
    if (activeView === 'announcements') {
      void fetchAnnouncements(1);
    }
  }, [activeView, fetchAnnouncements]);

  const handleTabChange = useCallback((view: CommunicationsView) => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({}, '', url.toString());
    }
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
    activeView,
    handleTabChange,
    fetchAnnouncements,
    handleEdit,
    handleView,
    handleCreate,
  };
}
