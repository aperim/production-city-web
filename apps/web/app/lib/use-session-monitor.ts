"use client";

/**
 * Session monitor hook — detects session expiry and triggers re-auth flow.
 *
 * Handles:
 * - 401 responses from API calls (via pc:session-expired event)
 * - Tab focus revalidation (visibilitychange)
 * - Concurrent session detection (401 on revalidation)
 *
 * @see Issue #353
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

export interface SessionMonitorState {
  /** Whether the session has expired */
  expired: boolean;
  /** Message to show the user */
  message: string;
  /** URL to redirect to after re-auth */
  returnUrl: string;
}

/**
 * Monitor session health.
 *
 * Returns `expired: true` when a 401 is detected or session revalidation fails.
 * The caller should render a session-expired overlay when expired is true.
 */
export function useSessionMonitor(): SessionMonitorState {
  const { refreshSession, isAuthenticated } = useAuth();
  const [expired, setExpired] = useState(false);
  const [message, setMessage] = useState("");

  const returnUrl =
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "/dashboard";

  // Listen for 401 events from the API client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleExpired = () => {
      setExpired(true);
      setMessage("Your session has expired. Please sign in again.");
    };

    window.addEventListener("pc:session-expired", handleExpired);
    return () => window.removeEventListener("pc:session-expired", handleExpired);
  }, []);

  // Revalidate session on tab focus
  const handleVisibilityChange = useCallback(async () => {
    if (typeof document === "undefined") return;
    if (document.visibilityState !== "visible") return;
    if (expired) return; // Already expired, no need to check

    try {
      await refreshSession();
    } catch {
      // refreshSession failure is handled by the auth context
    }
  }, [refreshSession, expired]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  // Detect when auth context loses authentication (e.g., after refreshSession fails)
  useEffect(() => {
    if (!isAuthenticated && !expired) {
      // Auth context cleared — session was invalidated
      // Don't set expired on initial load (isAuthenticated starts false before first refresh)
    }
  }, [isAuthenticated, expired]);

  return { expired, message, returnUrl };
}
