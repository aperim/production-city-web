"use client";

/**
 * Polling fallback hook for delivery status.
 * Starts polling immediately and can be paused/resumed.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getDeliveryStatus } from "../api-client";
import type { DeliveryStatus } from "./types";
import { isTerminalStatus } from "./types";

const INITIAL_INTERVAL_MS = 1000;
const MAX_INTERVAL_MS = 5000;
const MAX_POLL_DURATION_MS = 60_000;
const SENDING_FALLBACK_MS = 10_000;

export interface UsePollingFallbackOptions {
  requestId: string | null;
  enabled?: boolean;
  onStatusChange?: (status: DeliveryStatus) => void;
  onTimeout?: () => void;
}

export interface UsePollingFallbackResult {
  status: DeliveryStatus | null;
  timedOut: boolean;
  sendingTooLong: boolean;
  pause: () => void;
  resume: () => void;
}

export function usePollingFallback({
  requestId,
  enabled = true,
  onStatusChange,
  onTimeout,
}: UsePollingFallbackOptions): UsePollingFallbackResult {
  const [status, setStatus] = useState<DeliveryStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [sendingTooLong, setSendingTooLong] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentIntervalRef = useRef(INITIAL_INTERVAL_MS);
  const pausedRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  const onStatusChangeRef = useRef(onStatusChange);
  onTimeoutRef.current = onTimeout;
  onStatusChangeRef.current = onStatusChange;

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
    stopPolling();
  }, [stopPolling]);

  const poll = useCallback(async () => {
    if (!requestId || pausedRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed >= MAX_POLL_DURATION_MS) {
      stopPolling();
      setTimedOut(true);
      onTimeoutRef.current?.();
      return;
    }

    try {
      const result = await getDeliveryStatus(requestId);
      if (result.ok) {
        const newStatus = result.data.status as DeliveryStatus;
        setStatus(newStatus);
        onStatusChangeRef.current?.(newStatus);

        if (isTerminalStatus(newStatus)) {
          stopPolling();
          return;
        }
      }
    } catch {
      // Network error — keep polling
    }

    const elapsedNow = Date.now() - startTimeRef.current;
    if (elapsedNow >= SENDING_FALLBACK_MS) {
      setSendingTooLong(true);
    }

    currentIntervalRef.current = Math.min(
      currentIntervalRef.current * 2,
      MAX_INTERVAL_MS,
    );
    intervalRef.current = setTimeout(poll, currentIntervalRef.current);
  }, [requestId, stopPolling]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    if (requestId && !intervalRef.current) {
      intervalRef.current = setTimeout(poll, currentIntervalRef.current);
    }
  }, [requestId, poll]);

  useEffect(() => {
    if (!requestId || !enabled) {
      stopPolling();
      setStatus(null);
      setTimedOut(false);
      setSendingTooLong(false);
      return;
    }

    setStatus("sending");
    setTimedOut(false);
    setSendingTooLong(false);
    startTimeRef.current = Date.now();
    currentIntervalRef.current = INITIAL_INTERVAL_MS;
    pausedRef.current = false;

    intervalRef.current = setTimeout(poll, INITIAL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [requestId, enabled, poll, stopPolling]);

  return { status, timedOut, sendingTooLong, pause, resume };
}
