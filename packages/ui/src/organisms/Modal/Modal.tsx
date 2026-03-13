'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/** Modal size variant */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Props for the Modal organism.
 */
export interface ModalProps {
  /**
   * Whether the modal is open.
   */
  open: boolean;
  /**
   * Called when the modal should close (Escape, backdrop click, close button).
   */
  onClose: () => void;
  /**
   * Modal content rendered as ReactNode only.
   */
  children: ReactNode;
  /**
   * Modal size.
   * @default "md"
   */
  size?: ModalSize;
  /**
   * Optional title rendered in the modal header.
   */
  title?: ReactNode;
  /**
   * Optional description for aria-describedby.
   */
  description?: ReactNode;
  /**
   * Whether clicking the backdrop closes the modal.
   * @default true
   */
  closeOnBackdrop?: boolean;
  /**
   * Whether pressing Escape closes the modal.
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Whether to show a close button in the header.
   * @default true
   */
  showClose?: boolean;
  /**
   * Optional footer content.
   */
  footer?: ReactNode;
  /**
   * Additional class names for the dialog panel.
   */
  className?: string;
  /**
   * Accessible label for the dialog when title is not a plain string.
   */
  'aria-label'?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-xl',
  full: 'w-screen h-screen max-w-none m-0 rounded-none',
};

/** Focusable selector for focus trap */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal organism.
 *
 * Focus trap: Tab/Shift+Tab cycles within the dialog.
 * Escape closes (configurable). Backdrop click closes (configurable).
 * Portal rendering for z-index. Animations respect prefers-reduced-motion.
 * WCAG 2.2 AA: role="dialog", aria-modal, aria-labelledby, aria-describedby.
 * ReactNode only.
 */
export function Modal({
  open,
  onClose,
  children,
  size = 'md',
  title,
  description,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showClose = true,
  footer,
  className,
  'aria-label': ariaLabel,
}: ModalProps) {
  const instanceId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${instanceId}`;
  const descId = `modal-desc-${instanceId}`;

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const firstFocusable = panelRef.current.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? panelRef.current).focus();
  }, [open]);

  useEffect(() => {
    if (!open && openerRef.current) {
      openerRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [closeOnEscape, onClose],
  );

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  if (!open) return null;

  const isFull = size === 'full';

  const dialog = (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-foreground/40"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex flex-col bg-background border border-border shadow-md outline-none',
          isFull ? 'rounded-none' : 'rounded-md',
          isFull ? 'max-h-screen overflow-hidden' : 'max-h-[90vh]',
          sizeClasses[size],
          className,
        )}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 shrink-0">
            {title && (
              <div className="flex flex-col gap-1 min-w-0">
                <div
                  id={titleId}
                  className="text-base font-semibold text-foreground"
                >
                  {title}
                </div>
                {description && (
                  <div id={descId} className="text-sm text-muted-foreground">
                    {description}
                  </div>
                )}
              </div>
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="ml-auto shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer && (
          <div className="border-t border-border px-6 py-4 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(dialog, document.body) : null;
}
