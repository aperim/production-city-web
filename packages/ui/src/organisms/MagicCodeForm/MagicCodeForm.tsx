'use client';

import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { MagicCodeInput } from '../../molecules/MagicCodeInput/MagicCodeInput';
import { DeliveryStatusIndicator, type DeliveryStatus } from '../../molecules/DeliveryStatusIndicator/DeliveryStatusIndicator';

/** Props for the MagicCodeForm organism */
export interface MagicCodeFormProps {
  /**
   * Called when the code is submitted.
   */
  onSubmit: (code: string) => Promise<void> | void;
  /**
   * Called when the user requests a new code.
   */
  onResend?: () => void;
  /**
   * Current delivery status.
   */
  deliveryStatus?: DeliveryStatus;
  /**
   * Error message (e.g. wrong code).
   */
  error?: string;
  /**
   * Whether the form is locked after max attempts.
   */
  locked?: boolean;
  /**
   * Locked message.
   * @default "Too many failed attempts. Please request a new code."
   */
  lockedMessage?: string;
  /**
   * Code length.
   * @default 6
   */
  codeLength?: number;
  /**
   * Heading text.
   * @default "Check your email"
   */
  heading?: string;
  /**
   * Description text.
   * @default "Enter the verification code we sent to your email."
   */
  description?: string;
  /**
   * Resend button label.
   * @default "Resend code"
   */
  resendLabel?: string;
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * MagicCodeForm organism — code verification form with delivery status.
 *
 * Composes MagicCodeInput + DeliveryStatusIndicator.
 * All user-facing text is via props for i18n.
 */
export function MagicCodeForm({
  onSubmit,
  onResend,
  deliveryStatus,
  error,
  locked = false,
  lockedMessage = 'Too many failed attempts. Please request a new code.',
  codeLength = 6,
  heading = 'Check your email',
  description = 'Enter the verification code we sent to your email.',
  resendLabel = 'Resend code',
  className,
}: MagicCodeFormProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleComplete = useCallback(
    async (code: string) => {
      if (isVerifying || locked) return;
      setIsVerifying(true);
      try {
        await onSubmit(code);
      } finally {
        setIsVerifying(false);
      }
    },
    [isVerifying, locked, onSubmit],
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {deliveryStatus && (
        <DeliveryStatusIndicator status={deliveryStatus} />
      )}

      {locked ? (
        <p role="alert" className="text-xs text-destructive">
          {lockedMessage}
        </p>
      ) : (
        <MagicCodeInput
          length={codeLength}
          onComplete={handleComplete}
          disabled={isVerifying}
          error={error}
        />
      )}

      {isVerifying && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Verifying...
        </p>
      )}

      {onResend && !locked && (
        <button
          type="button"
          onClick={onResend}
          disabled={isVerifying}
          className="self-start text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ring transition-colors duration-150"
        >
          {resendLabel}
        </button>
      )}
    </div>
  );
}
