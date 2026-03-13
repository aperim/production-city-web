'use client';

import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

/** Delivery status type */
export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'bounced' | 'failed';

/** Props for the DeliveryStatusIndicator molecule */
export interface DeliveryStatusIndicatorProps {
  /**
   * Current delivery status.
   */
  status: DeliveryStatus;
  /**
   * Additional class names.
   */
  className?: string;
  /**
   * Fallback timeout in milliseconds. After this duration, auto-transitions
   * to a "check your email" state regardless of actual status.
   * @default 30000
   */
  fallbackTimeout?: number;
}

const statusConfig: Record<DeliveryStatus, { icon: string; label: string; colorClass: string }> = {
  sending: {
    icon: '⏳',
    label: 'Sending...',
    colorClass: 'text-muted-foreground',
  },
  sent: {
    icon: '✓',
    label: 'Sent',
    colorClass: 'text-foreground',
  },
  delivered: {
    icon: '✓✓',
    label: 'Delivered — check your email',
    colorClass: 'text-green-700 dark:text-green-400',
  },
  bounced: {
    icon: '⚠',
    label: 'Delivery failed — check email address',
    colorClass: 'text-amber-700 dark:text-amber-400',
  },
  failed: {
    icon: '✕',
    label: 'Something went wrong',
    colorClass: 'text-destructive',
  },
};

/**
 * DeliveryStatusIndicator molecule — displays email delivery tracking status.
 *
 * Shows icon + label for each status. Supports a fallbackTimeout that
 * auto-transitions to "check your email" after the specified duration
 * if status is still "sending" or "sent".
 */
export function DeliveryStatusIndicator({
  status,
  className,
  fallbackTimeout = 30000,
}: DeliveryStatusIndicatorProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
    if (status !== 'sending' && status !== 'sent') return;

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, fallbackTimeout);

    return () => clearTimeout(timer);
  }, [status, fallbackTimeout]);

  const effectiveStatus: DeliveryStatus = timedOut && (status === 'sending' || status === 'sent')
    ? 'delivered'
    : status;

  const config = statusConfig[effectiveStatus];

  return (
    <div
      className={cn('inline-flex items-center gap-2 text-sm', config.colorClass, className)}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" className={cn('shrink-0', status === 'sending' && !timedOut && 'animate-pulse')}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </div>
  );
}
