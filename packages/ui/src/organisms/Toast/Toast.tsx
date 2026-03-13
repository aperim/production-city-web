'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/** Toast variant */
export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

/** Toast position on screen */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

/** Single toast item */
export interface ToastItem {
  /** Unique id (auto-generated if not provided) */
  id: string;
  /** Toast message — ReactNode only */
  message: ReactNode;
  /** Variant controls colour and icon. @default "info" */
  variant?: ToastVariant;
  /** Duration in ms before auto-dismiss. 0 = no auto-dismiss. @default 5000 */
  duration?: number;
  /** Optional action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
}

/** Options for adding a toast */
export type ToastOptions = Omit<ToastItem, 'id'> & { id?: string };

/** Toast context value */
interface ToastContextValue {
  /** Add a toast to the queue */
  addToast: (options: ToastOptions) => string;
  /** Remove a toast by id */
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Hook to access toast context */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const MAX_VISIBLE = 5;

const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
};

const variantClasses: Record<ToastVariant, string> = {
  info: 'border-border bg-background text-foreground',
  success: 'border-green-600 bg-background text-foreground',
  warning: 'border-amber-500 bg-background text-foreground',
  error: 'border-destructive bg-background text-foreground',
};

const variantIconColor: Record<ToastVariant, string> = {
  info: 'text-primary',
  success: 'text-green-600',
  warning: 'text-amber-500',
  error: 'text-destructive',
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const cls = cn('shrink-0 w-4 h-4', variantIconColor[variant]);
  if (variant === 'success') {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm3.53 4.97a.75.75 0 0 0-1.06 0L7 9.44 5.53 7.97a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4a.75.75 0 0 0 0-1.06z" />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 3.75a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4.75zm0 7.5a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75z" />
      </svg>
    );
  }
  if (variant === 'warning') {
    return (
      <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8.22 1.754a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368L8.22 1.754zm-.22 5.496a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75zm.5 5.25a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
      </svg>
    );
  }
  // info
  return (
    <svg className={cls} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 6.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 7.5zm0-3a.875.875 0 1 0 0 1.75A.875.875 0 0 0 8 4.5z" />
    </svg>
  );
}

function ToastEntry({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const { id, message, variant = 'info', duration = 5000, actionLabel, onAction } = toast;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => onRemove(id), duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, id, onRemove]);

  const isError = variant === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] rounded-md border px-4 py-3 shadow-sm text-sm',
        variantClasses[variant],
      )}
    >
      <ToastIcon variant={variant} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground">{message}</div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={() => {
              onAction();
              onRemove(id);
            }}
            className="mt-1 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-1"
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </div>
  );
}

/** Props for the ToastProvider */
export interface ToastProviderProps {
  children: ReactNode;
  /**
   * Position for all toasts.
   * @default "bottom-right"
   */
  position?: ToastPosition;
}

/**
 * ToastProvider — wraps your app to enable the useToast hook.
 *
 * Renders toasts in a portal. Toasts are accessible via role="status" (polite)
 * or role="alert" (assertive) for error variants.
 * Animations respect prefers-reduced-motion.
 * ReactNode only — no string injection risk.
 */
export function ToastProvider({ children, position = 'bottom-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = options.id ?? `toast-${++counter.current}`;
    setToasts((prev) => {
      const next = [...prev, { ...options, id }];
      return next.slice(-MAX_VISIBLE);
    });
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const container =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            aria-label="Notifications"
            className={cn(
              'fixed z-50 flex flex-col gap-2 pointer-events-none',
              positionClasses[position],
            )}
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto motion-safe:animate-[fadeIn_150ms_ease]">
                <ToastEntry toast={toast} onRemove={removeToast} />
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {container}
    </ToastContext.Provider>
  );
}
