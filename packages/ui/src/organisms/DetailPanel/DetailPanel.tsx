'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function DetailPanel({ open, onClose, title, children, className }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        data-detail-panel
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col border-l bg-card',
          'animate-in slide-in-from-right duration-200',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent/50"
          >
            &times;
          </button>
        </div>
        <div data-detail-body className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}
