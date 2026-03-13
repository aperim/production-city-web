"use client";

/**
 * Hook for polling delivery status with exponential backoff.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { getDeliveryStatus } from "./api-client";

export type DeliveryStatus = "sending" | "sent" | "delivered" | "bounced" | "failed";

const INITIAL_INTERVAL_MS = 1000;
const MAX_INTERVAL_MS = 5000;
const MAX_POLL_DURATION_MS = 60_000;
const SENDING_FALLBACK_MS = 10_000;

export interface UseDeliveryPollingOptions {
  requestId: string | null;
  onTimeout?: () => void;
}

export interface UseDeliveryPollingResult {
  status: DeliveryStatus | null;
  timedOut: boolean;
  sendingTooLong: boolean;
}

/**
 * Polls delivery status with exponential backoff (1s -> 2s -> 4s -> 5s cap).
 * Stops on terminal state or after 60s.
 */
export function useDeliveryPolling({
  requestId,
  onTimeout,
}: UseDeliveryPollingOptions): UseDeliveryPollingResult {
  const [status, setStatus] = useState<DeliveryStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [sendingTooLong, setSendingTooLong] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentIntervalRef = useRef(INITIAL_INTERVAL_MS);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const isTerminal = useCallback((s: DeliveryStatus) => {
    return s === "delivered" || s === "bounced" || s === "failed";
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!requestId) return;

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
        const newStatus = result.data.status;
        setStatus(newStatus);

        if (isTerminal(newStatus)) {
          stopPolling();
          return;
        }
      }
    } catch {
      // Network error — keep polling
    }

    // Check if sending too long
    const elapsedNow = Date.now() - startTimeRef.current;
    if (elapsedNow >= SENDING_FALLBACK_MS) {
      setSendingTooLong(true);
    }

    // Schedule next poll with exponential backoff
    currentIntervalRef.current = Math.min(
      currentIntervalRef.current * 2,
      MAX_INTERVAL_MS,
    );
    intervalRef.current = setTimeout(poll, currentIntervalRef.current);
  }, [requestId, isTerminal, stopPolling]);

  useEffect(() => {
    if (!requestId) {
      stopPolling();
      setStatus(null);
      setTimedOut(false);
      setSendingTooLong(false);
      return;
    }

    // Reset state
    setStatus("sending");
    setTimedOut(false);
    setSendingTooLong(false);
    startTimeRef.current = Date.now();
    currentIntervalRef.current = INITIAL_INTERVAL_MS;

    // Start polling after initial interval
    intervalRef.current = setTimeout(poll, INITIAL_INTERVAL_MS);

    return () => {
      stopPolling();
    };
  }, [requestId, poll, stopPolling]);

  return { status, timedOut, sendingTooLong };
}
