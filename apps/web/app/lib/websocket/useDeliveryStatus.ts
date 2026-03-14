"use client";

/**
 * Hook for tracking delivery status via WebSocket push with polling fallback.
 *
 * Strategy:
 * 1. Starts polling immediately (instant responsiveness, no WebSocket wait)
 * 2. Connects to /v1/ws/delivery?token={deliveryToken} in parallel
 * 3. On WebSocket connect, receives initial state immediately
 * 4. Stops polling once WebSocket is delivering updates
 * 5. If WebSocket fails, polling continues (transparent fallback)
 *
 * Does NOT use the main WebSocketProvider — uses its own connection.
 */

import { useEffect, useRef, useState } from "react";
import { usePollingFallback } from "./usePollingFallback";
import type { DeliveryStatus, DeliveryStatusPayload, WSEnvelope } from "./types";
import { isTerminalStatus } from "./types";

export interface UseDeliveryStatusResult {
  status: DeliveryStatus | null;
  isConnected: boolean;
  timedOut: boolean;
  sendingTooLong: boolean;
}

export function useDeliveryStatus(
  magicLinkId: string | null,
  deliveryToken: string | null,
): UseDeliveryStatusResult {
  const [wsStatus, setWsStatus] = useState<DeliveryStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  // Start polling immediately as the default
  const {
    status: pollingStatus,
    timedOut,
    sendingTooLong,
    pause: pausePolling,
    resume: resumePolling,
  } = usePollingFallback({
    requestId: magicLinkId,
    enabled: !!magicLinkId,
    onStatusChange: (newStatus) => {
      // If we get a terminal status from polling, stop everything
      if (isTerminalStatus(newStatus)) {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      }
    },
  });

  // Connect WebSocket in parallel
  useEffect(() => {
    mountedRef.current = true;

    if (!magicLinkId || !deliveryToken) return;

    // Feature detection
    if (typeof WebSocket === "undefined") return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/v1/ws/delivery?token=${encodeURIComponent(deliveryToken)}`;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      setIsConnected(true);
      // Stop polling since WS is now active
      pausePolling();
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;

      try {
        const envelope = JSON.parse(event.data) as WSEnvelope;

        if (envelope.type === "delivery_status") {
          const payload = envelope.payload as DeliveryStatusPayload;
          setWsStatus(payload.status);
        } else if (envelope.type === "connection_ack") {
          // Initial state comes via a delivery_status message sent immediately after ack
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setIsConnected(false);
      wsRef.current = null;
      // Resume polling as fallback — the WS connection may have dropped
      // before a terminal status was received
      resumePolling();
    };

    ws.onerror = () => {
      // onclose will handle cleanup
    };

    wsRef.current = ws;

    return () => {
      mountedRef.current = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [magicLinkId, deliveryToken, pausePolling, resumePolling]);

  // Prefer WS status over polling status
  const status = wsStatus ?? pollingStatus;

  return {
    status,
    isConnected,
    timedOut,
    sendingTooLong,
  };
}
