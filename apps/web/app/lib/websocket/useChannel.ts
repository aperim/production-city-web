"use client";

/**
 * Hook to subscribe to a WebSocket channel with typed messages.
 * Reference-counted: multiple components subscribing to the same channel share one subscription.
 */

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import type { MessageHandler, WSEnvelope } from "./types";

const MAX_MESSAGES = 50;

export interface UseChannelOptions<T> {
  onMessage?: (payload: T) => void;
  enabled?: boolean;
}

export interface UseChannelResult<T> {
  lastMessage: T | null;
  messages: T[];
  isSubscribed: boolean;
}

export function useChannel<T = unknown>(
  channel: string,
  options: UseChannelOptions<T> = {},
): UseChannelResult<T> {
  const { enabled = true } = options;
  const { subscribe, state } = useContext(WebSocketContext);
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  const [messages, setMessages] = useState<T[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const onMessageRef = useRef(options.onMessage);
  onMessageRef.current = options.onMessage;

  const handler: MessageHandler = useCallback((payload: unknown, _envelope: WSEnvelope) => {
    const typed = payload as T;
    setLastMessage(typed);
    setMessages((prev) => {
      const next = [...prev, typed];
      if (next.length > MAX_MESSAGES) {
        return next.slice(next.length - MAX_MESSAGES);
      }
      return next;
    });
    onMessageRef.current?.(typed);
  }, []);

  useEffect(() => {
    if (!enabled || !channel) {
      setIsSubscribed(false);
      return;
    }

    const unsubscribe = subscribe(channel, handler);
    setIsSubscribed(true);

    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [channel, enabled, subscribe, handler]);

  // Update subscribed state based on connection
  useEffect(() => {
    if (state !== "connected" && state !== "connecting") {
      setIsSubscribed(false);
    }
  }, [state]);

  return { lastMessage, messages, isSubscribed };
}
