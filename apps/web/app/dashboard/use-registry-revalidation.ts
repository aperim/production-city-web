"use client";

/**
 * Registry revalidation hook — refetches visible features on tab focus.
 *
 * Phase 1: Revalidates when tab becomes visible after being hidden for > 5 minutes.
 * If the registry version changes, triggers a page refresh (with loop protection).
 *
 * Phase 2+: Will be replaced by WebSocket/SSE push updates.
 *
 * @see Issue #354
 */

import { useCallback, useEffect, useRef } from "react";
import { getRegistryVisible } from "../lib/api-client";

/** Stale threshold in milliseconds (5 minutes) */
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

/** Minimum time between revalidations to prevent loops */
const MIN_REVALIDATION_INTERVAL_MS = 30 * 1000;

/** localStorage key for last known registry version */
const VERSION_KEY = "pc-registry-version";

/** localStorage key for last refresh timestamp (loop protection) */
const REFRESH_GUARD_KEY = "pc-registry-refresh-at";

export interface RegistryRevalidationOptions {
  /** Called when visible feature IDs change */
  onFeaturesChanged?: (featureIds: string[]) => void;
  /** Whether revalidation is enabled */
  enabled?: boolean;
}

/**
 * Hook that revalidates registry data on tab focus.
 */
export function useRegistryRevalidation(
  options: RegistryRevalidationOptions = {},
) {
  const { onFeaturesChanged, enabled = true } = options;
  const lastHiddenAt = useRef<number>(0);
  const lastRevalidatedAt = useRef<number>(0);

  const revalidate = useCallback(async () => {
    if (typeof window === "undefined") return;

    const now = Date.now();

    // Throttle: don't revalidate if we did so recently
    if (now - lastRevalidatedAt.current < MIN_REVALIDATION_INTERVAL_MS) return;

    // Only revalidate if tab was hidden for > 5 minutes
    if (lastHiddenAt.current > 0 && now - lastHiddenAt.current < STALE_THRESHOLD_MS) return;

    lastRevalidatedAt.current = now;

    try {
      const result = await getRegistryVisible();
      if (!result.ok) return;

      const { registry_version, visible_feature_ids } = result.data;

      // Check if version changed
      const storedVersion = localStorage.getItem(VERSION_KEY);
      if (storedVersion && storedVersion !== registry_version) {
        // Version changed — check loop protection before refreshing
        const lastRefresh = localStorage.getItem(REFRESH_GUARD_KEY);
        const lastRefreshTime = lastRefresh ? parseInt(lastRefresh, 10) : 0;

        if (now - lastRefreshTime > MIN_REVALIDATION_INTERVAL_MS) {
          localStorage.setItem(REFRESH_GUARD_KEY, String(now));
          localStorage.setItem(VERSION_KEY, registry_version);
          window.location.reload();
          return;
        }
      }

      // Store current version
      localStorage.setItem(VERSION_KEY, registry_version);

      // Notify caller of updated features
      onFeaturesChanged?.(visible_feature_ids);
    } catch {
      // Network error — skip silently
    }
  }, [onFeaturesChanged]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenAt.current = Date.now();
      } else if (document.visibilityState === "visible") {
        revalidate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled, revalidate]);
}
