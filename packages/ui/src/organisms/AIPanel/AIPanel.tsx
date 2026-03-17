"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { WorkspaceIcon } from '../../atoms/WorkspaceIcon/WorkspaceIcon';

export interface AIPanelMessage {
  /** Unique message ID */
  id: string;
  /** Message role */
  role: 'user' | 'assistant';
  /** Message content */
  content: string;
  /** ISO timestamp */
  timestamp: string;
}

export interface AIPanelProps {
  /** Whether the panel is open */
  open?: boolean;
  /** Toggle open/close */
  onToggle?: () => void;
  /** Current messages */
  messages?: AIPanelMessage[];
  /** Called when user sends a message */
  onSend?: (message: string) => void;
  /** Whether the assistant is currently responding */
  loading?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Chat-style AI assistant panel.
 * UI shell only — no backend integration.
 * Renders a message list, input, and toggle button.
 */
export function AIPanel({
  open = false,
  onToggle,
  messages = [],
  onSend,
  loading = false,
  className,
}: AIPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend?.(trimmed);
    setInput('');
  }, [input, loading, onSend]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open AI assistant"
        className={cn(
          'fixed bottom-4 right-4 z-40 inline-flex items-center justify-center',
          'h-10 w-10 rounded-sm bg-accent text-foreground',
          'hover:bg-accent/80 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <WorkspaceIcon icon="sparkles" size={18} decorative />
      </button>
    );
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full w-80 border-l border-border bg-background',
        className,
      )}
      aria-label="AI assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border min-h-[48px]">
        <span className="text-sm font-medium text-foreground">Assistant</span>
        <button
          type="button"
          onClick={onToggle}
          aria-label="Close AI assistant"
          className={cn(
            'inline-flex items-center justify-center h-7 w-7 rounded-sm',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-colors duration-150',
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <WorkspaceIcon icon="sparkles" size={24} className="text-muted-foreground/40 mb-2" decorative />
            <p className="text-sm text-muted-foreground">Ask a question about your workspace</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'mb-3 text-sm',
              msg.role === 'user' ? 'text-right' : 'text-left',
            )}
          >
            <div
              className={cn(
                'inline-block rounded-sm px-3 py-2 max-w-[85%]',
                msg.role === 'user'
                  ? 'bg-accent text-foreground'
                  : 'bg-muted text-foreground',
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-3 text-left">
            <div className="inline-block rounded-sm px-3 py-2 bg-muted">
              <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            disabled={loading}
            aria-label="Message input"
            className={cn(
              'flex-1 h-8 rounded-sm border border-border bg-transparent px-2 text-sm',
              'placeholder:text-muted-foreground/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50',
            )}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className={cn(
              'inline-flex items-center justify-center h-8 w-8 rounded-sm',
              'bg-foreground text-background',
              'hover:bg-foreground/90 transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
    </aside>
  );
}
