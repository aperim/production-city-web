"use client";

/**
 * WebSocket context provider for authenticated connections.
 *
 * Only connects when the user is authenticated (reads from AuthContext).
 * Integrates TabCoordinator for multi-tab support.
 * Handles reconnection with exponential backoff + jitter.
 */

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../auth-context";
import { TabCoordinator } from "./TabCoordinator";
import { MessageDeduplicator } from "./MessageDeduplicator";
import type { ConnectionState, WSEnvelope, MessageHandler, Unsubscribe } from "./types";
import { WS_PROTOCOL_VERSION } from "./types";

export interface WebSocketContextValue {
  state: ConnectionState;
  subscribe: (channel: string, handler: MessageHandler) => Unsubscribe;
  send: (message: unknown) => void;
  reconnect: () => void;
  isLeaderTab: boolean;
}

const defaultContextValue: WebSocketContextValue = {
  state: "disconnected",
  subscribe: () => () => {},
  send: () => {},
  reconnect: () => {},
  isLeaderTab: false,
};

export const WebSocketContext = createContext<WebSocketContextValue>(defaultContextValue);

/** Reconnection backoff constants */
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const BACKOFF_JITTER = 0.2;
const DEPLOY_BACKOFF_MS = 1000;
const DEPLOY_JITTER = 0.5;
const MAX_RETRIES = 10;
const PING_INTERVAL_MS = 30_000;

function addJitter(base: number, jitter: number): number {
  const range = base * jitter;
  return base + (Math.random() * 2 - 1) * range;
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<ConnectionState>("disconnected");
  const [isLeaderTab, setIsLeaderTab] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const tabCoordinatorRef = useRef<TabCoordinator | null>(null);
  const deduplicatorRef = useRef(new MessageDeduplicator());
  const retriesRef = useRef(0);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMessageTsRef = useRef(0);
  const mountedRef = useRef(true);
  const deployReconnectRef = useRef(false);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Channel subscription handlers: channel -> Set<handler>
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const handleIncomingMessage = useCallback((data: unknown) => {
    if (!mountedRef.current) return;

    const envelope = data as WSEnvelope;
    if (!envelope?.id || !envelope?.type) return;

    // Handle server_shutdown — set flag so onclose uses short backoff
    if (envelope.type === "server_shutdown") {
      deployReconnectRef.current = true;
      return;
    }

    // Deduplicate
    if (!deduplicatorRef.current.check(envelope.id)) return;

    // Track last message timestamp for replay
    if (envelope.ts > lastMessageTsRef.current) {
      lastMessageTsRef.current = envelope.ts;
    }

    // Dispatch to channel handlers
    if (envelope.channel) {
      const channelHandlers = handlersRef.current.get(envelope.channel);
      if (channelHandlers) {
        for (const handler of channelHandlers) {
          handler(envelope.payload, envelope);
        }
      }
    }

    // Also dispatch to wildcard handlers (type-based)
    const typeHandlers = handlersRef.current.get(`__type:${envelope.type}`);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(envelope.payload, envelope);
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current || !isAuthenticated) return;

    // Feature detection
    if (typeof WebSocket === "undefined") {
      setState("unavailable");
      return;
    }

    // Only leader tab connects
    if (tabCoordinatorRef.current && !tabCoordinatorRef.current.isLeader) return;

    setState("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsHost = window.location.hostname === "production.city"
      ? "api.production.city"
      : window.location.host;
    const ws = new WebSocket(`${protocol}//${wsHost}/v1/ws`);

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      setState("connected");
      retriesRef.current = 0;
      backoffRef.current = INITIAL_BACKOFF_MS;

      // Start periodic ping (keeps DO auto-response timestamp fresh for zombie detection)
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('{"v":1,"type":"ping","payload":null,"ts":0,"id":"auto"}');
        }
      }, PING_INTERVAL_MS);

      // Re-subscribe to all active channels
      for (const channel of handlersRef.current.keys()) {
        if (!channel.startsWith("__type:")) {
          ws.send(JSON.stringify({
            v: WS_PROTOCOL_VERSION,
            type: "subscribe",
            payload: { channel },
            ts: Date.now(),
            id: crypto.randomUUID(),
          }));
        }
      }

      // Request replay of missed events
      if (lastMessageTsRef.current > 0) {
        ws.send(JSON.stringify({
          v: WS_PROTOCOL_VERSION,
          type: "replay",
          payload: { lastMessageTs: lastMessageTsRef.current },
          ts: Date.now(),
          id: crypto.randomUUID(),
        }));
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);

        // Relay to other tabs
        if (tabCoordinatorRef.current?.isLeader) {
          tabCoordinatorRef.current.relayMessage(data);
        }
      } catch {
        // Ignore unparseable messages
      }
    };

    ws.onclose = (event: CloseEvent) => {
      wsRef.current = null;
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      if (!mountedRef.current) return;

      // Determine if this was a deployment disconnect:
      // - 1012 "Service Restart" from Cloudflare
      // - deploymentReconnect flag set by server_shutdown message
      const isDeployDisconnect = event.code === 1012 || deployReconnectRef.current;
      deployReconnectRef.current = false;

      setState("disconnected");

      if (retriesRef.current >= MAX_RETRIES) {
        setState("failed");
        return;
      }

      // Schedule reconnection with backoff
      const delay = isDeployDisconnect
        ? addJitter(DEPLOY_BACKOFF_MS, DEPLOY_JITTER)
        : addJitter(backoffRef.current, BACKOFF_JITTER);

      if (!isDeployDisconnect) {
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
      }
      retriesRef.current++;

      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };

    wsRef.current = ws;
  }, [isAuthenticated, handleIncomingMessage, clearReconnectTimer]);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const reconnect = useCallback(() => {
    clearReconnectTimer();
    retriesRef.current = 0;
    backoffRef.current = INITIAL_BACKOFF_MS;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    connect();
  }, [connect, clearReconnectTimer]);

  const subscribe = useCallback((channel: string, handler: MessageHandler): Unsubscribe => {
    let handlers = handlersRef.current.get(channel);
    if (!handlers) {
      handlers = new Set();
      handlersRef.current.set(channel, handlers);
    }
    handlers.add(handler);

    // Send subscribe message to server if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        v: WS_PROTOCOL_VERSION,
        type: "subscribe",
        payload: { channel },
        ts: Date.now(),
        id: crypto.randomUUID(),
      }));
    }

    return () => {
      const h = handlersRef.current.get(channel);
      if (h) {
        h.delete(handler);
        if (h.size === 0) {
          handlersRef.current.delete(channel);
          // Unsubscribe on server
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              v: WS_PROTOCOL_VERSION,
              type: "unsubscribe",
              payload: { channel },
              ts: Date.now(),
              id: crypto.randomUUID(),
            }));
          }
        }
      }
    };
  }, []);

  // Initialize TabCoordinator and manage connection lifecycle
  useEffect(() => {
    mountedRef.current = true;

    if (!isAuthenticated) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearReconnectTimer();
      setState("disconnected");
      return;
    }

    const coordinator = new TabCoordinator();
    tabCoordinatorRef.current = coordinator;
    setIsLeaderTab(coordinator.isLeader);

    coordinator.onLeaderChange((leader) => {
      if (!mountedRef.current) return;
      setIsLeaderTab(leader);
      if (leader) {
        connect();
      } else if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    });

    // Non-leader tabs receive relayed messages
    coordinator.onMessage((data) => {
      handleIncomingMessage(data);
    });

    if (coordinator.isLeader) {
      connect();
    }

    // Reconnect on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && coordinator.isLeader && !wsRef.current) {
        connect();
      }
    };

    // Reconnect on network online
    const handleOnline = () => {
      if (coordinator.isLeader && !wsRef.current) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      mountedRef.current = false;
      clearReconnectTimer();
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      coordinator.destroy();
      tabCoordinatorRef.current = null;

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
    };
  }, [isAuthenticated, connect, handleIncomingMessage, clearReconnectTimer]);

  return (
    <WebSocketContext value={{ state, subscribe, send, reconnect, isLeaderTab }}>
      {children}
    </WebSocketContext>
  );
}
