'use client';

import { useCallback, useId, useState, type FormEvent } from 'react';
import { cn } from '../../lib/utils';
import { DeliveryStatusIndicator, type DeliveryStatus } from '../../molecules/DeliveryStatusIndicator/DeliveryStatusIndicator';

/** Props for the LoginForm organism */
export interface LoginFormProps {
  /**
   * Called when the form is submitted with a valid email.
   */
  onSubmit: (email: string) => Promise<void> | void;
  /**
   * Current delivery status after submission.
   */
  deliveryStatus?: DeliveryStatus;
  /**
   * Error message to display.
   */
  error?: string;
  /**
   * Whether the form is rate limited.
   */
  rateLimited?: boolean;
  /**
   * Rate limit message.
   * @default "Too many attempts. Please try again later."
   */
  rateLimitMessage?: string;
  /**
   * Email input label.
   * @default "Email address"
   */
  emailLabel?: string;
  /**
   * Submit button label.
   * @default "Send magic link"
   */
  submitLabel?: string;
  /**
   * Submitting button label.
   * @default "Sending..."
   */
  submittingLabel?: string;
  /**
   * Form aria-label for accessibility.
   * @default "Login"
   */
  ariaLabel?: string;
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * LoginForm organism — email input + submit for requesting magic link.
 *
 * Composes native form elements with DeliveryStatusIndicator.
 * All user-facing text is via props for i18n.
 */
export function LoginForm({
  onSubmit,
  deliveryStatus,
  error,
  rateLimited = false,
  rateLimitMessage = 'Too many attempts. Please try again later.',
  emailLabel = 'Email address',
  submitLabel = 'Send magic link',
  submittingLabel = 'Sending...',
  ariaLabel = 'Login',
  className,
}: LoginFormProps) {
  const instanceId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const errorId = `${instanceId}-error`;

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting || rateLimited) return;
      const trimmed = email.trim();
      if (!trimmed) return;
      setIsSubmitting(true);
      try {
        await onSubmit(trimmed);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, rateLimited, onSubmit],
  );

  const showStatus = deliveryStatus && !error && !rateLimited;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={ariaLabel}
      className={cn('flex flex-col gap-4', className)}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${instanceId}-email`} className="text-sm font-medium text-foreground leading-none">
          {emailLabel}
        </label>
        <input
          id={`${instanceId}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          autoComplete="email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-sm border bg-background text-foreground px-3 text-sm h-9',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'placeholder:text-muted-foreground',
            error ? 'border-destructive focus-visible:ring-destructive' : 'border-border',
          )}
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {rateLimited && (
        <p role="alert" className="text-xs text-destructive">
          {rateLimitMessage}
        </p>
      )}

      {showStatus && (
        <DeliveryStatusIndicator status={deliveryStatus} />
      )}

      <button
        type="submit"
        disabled={isSubmitting || rateLimited}
        aria-busy={isSubmitting}
        className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[44px]"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
