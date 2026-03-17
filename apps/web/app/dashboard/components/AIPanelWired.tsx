"use client";

/**
 * AIPanelWired — connects the AIPanel organism to the backend POST /v1/ai/chat.
 *
 * Manages:
 * - Message state (user + assistant messages)
 * - Session persistence (sessionId from API)
 * - Loading/error states
 * - Keyboard shortcut (Cmd+J / Ctrl+J) to toggle
 * - Context from useAIContext hook
 *
 * @see Issue #412
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { AIPanel, type AIPanelMessage } from "@productioncity/holding-ui";
import { useAIContext } from "../hooks/useAIContext";
import { sendAIChat } from "../../lib/api-client";

export interface AIPanelWiredProps {
  /** Start the panel open (for testing) */
  defaultOpen?: boolean;
}

/**
 * Wired AI panel: connects AIPanel to POST /v1/ai/chat with context.
 */
export function AIPanelWired({ defaultOpen = false }: AIPanelWiredProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<AIPanelMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const aiContext = useAIContext();

  // Keyboard shortcut: Cmd+J or Ctrl+J
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSend = useCallback(
    async (message: string) => {
      // Add user message immediately
      const userMsg: AIPanelMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const result = await sendAIChat({
          message,
          context: aiContext.toAPIContext(),
          sessionId: sessionIdRef.current,
        });

        if (result.ok) {
          sessionIdRef.current = result.data.sessionId;

          const assistantMsg: AIPanelMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: result.data.response,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          // Show error as assistant message
          const errorMsg: AIPanelMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, the request failed. Please try again.",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } catch {
        const errorMsg: AIPanelMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, the request failed. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [aiContext],
  );

  return (
    <AIPanel
      open={open}
      onToggle={handleToggle}
      messages={messages}
      onSend={handleSend}
      loading={loading}
    />
  );
}
