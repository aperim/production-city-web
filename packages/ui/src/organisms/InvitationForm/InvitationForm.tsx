'use client';

import { useCallback, useId, useState, type FormEvent } from 'react';
import { cn } from '../../lib/utils';

/** Props for the InvitationForm organism */
export interface InvitationFormProps {
  /**
   * Available roles to select from.
   */
  roles: string[];
  /**
   * Called when the form is submitted.
   */
  onSubmit: (data: { email: string; role: string; message: string }) => Promise<void> | void;
  /**
   * Error message to display.
   */
  error?: string;
  /**
   * Field-level validation errors.
   */
  fieldErrors?: Record<string, string>;
  /**
   * Labels for i18n.
   */
  labels?: {
    email?: string;
    role?: string;
    message?: string;
    submit?: string;
    emailPlaceholder?: string;
    messagePlaceholder?: string;
    rolePlaceholder?: string;
  };
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * InvitationForm organism — form for creating a new invitation.
 *
 * Composes native form elements. All labels via props for i18n.
 * All user-supplied text rendered via JSX.
 */
export function InvitationForm({
  roles,
  onSubmit,
  error,
  fieldErrors = {},
  labels = {},
  className,
}: InvitationFormProps) {
  const instanceId = useId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  const emailLabel = labels.email ?? 'Email address';
  const roleLabel = labels.role ?? 'Role';
  const messageLabel = labels.message ?? 'Message (optional)';
  const submitLabel = labels.submit ?? 'Send invitation';
  const emailPlaceholder = labels.emailPlaceholder ?? 'user@example.com';
  const messagePlaceholder = labels.messagePlaceholder ?? 'Add a personal message...';
  const rolePlaceholder = labels.rolePlaceholder ?? 'Select a role';

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        await onSubmit({ email: email.trim(), role, message: message.trim() });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, role, message, isSubmitting, onSubmit],
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Invitation"
      className={cn('flex flex-col gap-4', className)}
    >
      {error && (
        <p role="alert" className="text-xs text-destructive rounded-md border border-destructive bg-background px-3 py-2">
          {error}
        </p>
      )}

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
          placeholder={emailPlaceholder}
          autoComplete="email"
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? `${instanceId}-email-error` : undefined}
          className={cn(
            'w-full rounded-sm border bg-background text-foreground px-3 text-sm h-9',
            'transition-colors duration-150 placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            fieldErrors.email ? 'border-destructive' : 'border-border',
          )}
        />
        {fieldErrors.email && (
          <p id={`${instanceId}-email-error`} role="alert" className="text-xs text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${instanceId}-role`} className="text-sm font-medium text-foreground leading-none">
          {roleLabel}
        </label>
        <select
          id={`${instanceId}-role`}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={fieldErrors.role ? true : undefined}
          aria-describedby={fieldErrors.role ? `${instanceId}-role-error` : undefined}
          className={cn(
            'w-full rounded-sm border bg-background text-foreground px-3 text-sm h-9 appearance-none pe-8',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            fieldErrors.role ? 'border-destructive' : 'border-border',
          )}
        >
          <option value="" disabled>{rolePlaceholder}</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {fieldErrors.role && (
          <p id={`${instanceId}-role-error`} role="alert" className="text-xs text-destructive">{fieldErrors.role}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${instanceId}-message`} className="text-sm font-medium text-foreground leading-none">
          {messageLabel}
        </label>
        <textarea
          id={`${instanceId}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
          placeholder={messagePlaceholder}
          rows={3}
          className={cn(
            'w-full rounded-sm border border-border bg-background text-foreground px-3 py-2 text-sm',
            'transition-colors duration-150 placeholder:text-muted-foreground resize-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[44px]"
      >
        {isSubmitting ? 'Sending...' : submitLabel}
      </button>
    </form>
  );
}
