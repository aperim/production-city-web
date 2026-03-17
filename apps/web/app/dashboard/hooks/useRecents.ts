"use client";

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pc-recents';
const MAX_RECENTS = 5;

export interface RecentEntry {
  /** Navigation path */
  path: string;
  /** Display label (e.g., "Tab — Workspace") */
  label: string;
  /** ISO 8601 timestamp */
  timestamp: string;
}

export interface UseRecentsOptions {
  /** Visible workspace IDs for filtering */
  visibleWorkspaceIds?: string[];
  /** Visible tabs for filtering */
  visibleTabs?: Array<{ workspace: string; tab: string }>;
}

function loadRecents(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveRecents(entries: RecentEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage errors
  }
}

/** Extract workspace and tab from a dashboard path */
function parsePathSegments(path: string): { workspace: string; tab: string } | null {
  const match = path.match(/^\/dashboard\/([^/]+)(?:\/([^/]+))?/);
  if (!match?.[1]) return null;
  return { workspace: match[1], tab: match[2] ?? '' };
}

function filterByVisibility(
  entries: RecentEntry[],
  visibleWorkspaceIds?: string[],
  visibleTabs?: Array<{ workspace: string; tab: string }>,
): RecentEntry[] {
  if (!visibleWorkspaceIds && !visibleTabs) return entries;

  return entries.filter((entry) => {
    const segments = parsePathSegments(entry.path);
    if (!segments) return false;

    if (visibleWorkspaceIds && !visibleWorkspaceIds.includes(segments.workspace)) {
      return false;
    }

    if (visibleTabs && segments.tab) {
      const tabVisible = visibleTabs.some(
        (vt) => vt.workspace === segments.workspace && vt.tab === segments.tab,
      );
      if (!tabVisible) return false;
    }

    return true;
  });
}

/**
 * Hook for managing recently visited workspace/tab items.
 * Persists to localStorage under key 'pc-recents'.
 * Supports visibility filtering by workspace and tab.
 */
export function useRecents(options: UseRecentsOptions = {}) {
  const { visibleWorkspaceIds, visibleTabs } = options;

  const [recents, setRecents] = useState<RecentEntry[]>(() => {
    const all = loadRecents();
    return filterByVisibility(all, visibleWorkspaceIds, visibleTabs);
  });

  // Re-filter when visibility changes
  useEffect(() => {
    const all = loadRecents();
    const filtered = filterByVisibility(all, visibleWorkspaceIds, visibleTabs);
    setRecents(filtered);
  }, [visibleWorkspaceIds, visibleTabs]);

  const addRecent = useCallback(
    (entry: Omit<RecentEntry, 'timestamp'>) => {
      const all = loadRecents();
      const timestamp = new Date().toISOString();

      // Remove existing entry with same path
      const filtered = all.filter((e) => e.path !== entry.path);

      // Add to front
      const updated = [{ ...entry, timestamp }, ...filtered].slice(0, MAX_RECENTS);

      saveRecents(updated);
      setRecents(filterByVisibility(updated, visibleWorkspaceIds, visibleTabs));
    },
    [visibleWorkspaceIds, visibleTabs],
  );

  return { recents, addRecent };
}
