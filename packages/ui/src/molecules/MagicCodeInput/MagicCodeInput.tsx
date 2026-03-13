'use client';

import { useCallback, useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';

/** Props for the MagicCodeInput molecule */
export interface MagicCodeInputProps {
  /**
   * Number of digits in the code.
   * @default 6
   */
  length?: number;
  /**
   * Called when all digits are filled. Code is always a string
   * to preserve leading zeros.
   */
  onComplete: (code: string) => void;
  /**
   * Whether the input is disabled.
   */
  disabled?: boolean;
  /**
   * Error message to display below the input.
   */
  error?: string;
  /**
   * Whether to auto-focus the first input on mount.
   * @default true
   */
  autoFocus?: boolean;
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * MagicCodeInput molecule — multi-digit code input with auto-advance.
 *
 * Codes are treated as strings, never parsed as numbers. Leading zeros
 * are preserved. Only numeric digits (0-9) are accepted.
 *
 * Behavior:
 * - Auto-advances to next input on digit entry
 * - Backspace goes back to previous input
 * - Paste fills all fields at once
 * - Only numeric input accepted
 */
export function MagicCodeInput({
  length = 6,
  onComplete,
  disabled = false,
  error,
  autoFocus = true,
  className,
}: MagicCodeInputProps) {
  const instanceId = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const errorId = `${instanceId}-error`;

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }, []);

  const getCode = useCallback((): string => {
    return inputRefs.current.map((el) => el?.value ?? '').join('');
  }, []);

  const checkComplete = useCallback(() => {
    const code = getCode();
    if (code.length === length && /^\d+$/.test(code)) {
      onComplete(code);
    }
  }, [getCode, length, onComplete]);

  const handleInput = useCallback(
    (index: number, value: string) => {
      // Only accept single digit
      const digit = value.replace(/\D/g, '').slice(-1);
      const el = inputRefs.current[index];
      if (el) {
        el.value = digit;
      }
      if (digit && index < length - 1) {
        focusInput(index + 1);
      }
      checkComplete();
    },
    [length, focusInput, checkComplete],
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        const el = inputRefs.current[index];
        if (el && el.value === '' && index > 0) {
          e.preventDefault();
          const prev = inputRefs.current[index - 1];
          if (prev) {
            prev.value = '';
            focusInput(index - 1);
          }
        } else if (el) {
          el.value = '';
        }
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      }
      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    },
    [focusInput, length],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      for (let i = 0; i < length; i++) {
        const el = inputRefs.current[i];
        if (el) {
          el.value = pasted[i] ?? '';
        }
      }
      // Focus last filled or last input
      const focusIndex = Math.min(pasted.length, length) - 1;
      if (focusIndex >= 0) {
        focusInput(focusIndex);
      }
      checkComplete();
    },
    [length, focusInput, checkComplete],
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        className="flex gap-2"
        role="group"
        aria-label="Verification code"
        aria-describedby={error ? errorId : undefined}
      >
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            autoComplete="one-time-code"
            autoFocus={autoFocus && i === 0}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            onInput={(e) => handleInput(i, (e.target as HTMLInputElement).value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'w-10 h-12 text-center text-lg font-mono rounded-sm border bg-background text-foreground',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-destructive focus-visible:ring-destructive'
                : 'border-border',
            )}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
