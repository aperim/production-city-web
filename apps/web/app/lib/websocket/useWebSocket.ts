"use client";

/**
 * Low-level hook to access the WebSocket context.
 */

import { useContext } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import type { ConnectionState } from "./types";

export interface UseWebSocketResult {
  state: ConnectionState;
  send: (message: unknown) => void;
  reconnect: () => void;
  isLeaderTab: boolean;
}

export function useWebSocket(): UseWebSocketResult {
  const ctx = useContext(WebSocketContext);
  return {
    state: ctx.state,
    send: ctx.send,
    reconnect: ctx.reconnect,
    isLeaderTab: ctx.isLeaderTab,
  };
}
