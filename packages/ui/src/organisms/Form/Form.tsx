'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/utils';

/** Field validation error map */
export type FormErrors = Record<string, string | undefined>;

/** Form submission result */
export interface FormSubmitResult {
  /** Whether submission succeeded */
  success: boolean;
  /** Optional form-level error message */
  error?: string;
}

/** Form context value */
interface FormContextValue {
  errors: FormErrors;
  isDirty: boolean;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue>({
  errors: {},
  isDirty: false,
  isSubmitting: false,
});

/** Access form state from child components */
export function useFormContext(): FormContextValue {
  return useContext(FormContext);
}

/**
 * Validator: receives values, returns errors map.
 * Schema MUST be statically defined — never pass user-supplied schema strings.
 */
export type FormValidator<T extends Record<string, unknown>> = (
  values: T,
) => FormErrors | Promise<FormErrors>;

/**
 * Props for the Form organism.
 */
export interface FormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Initial values */
  initialValues?: T;
  /**
   * Validator function. Receives current form data, returns errors map.
   * Schema MUST be statically defined; never accept schema from user input.
   */
  validate?: FormValidator<T>;
  /** Submission handler */
  onSubmit?: (data: FormData, values: T) => Promise<FormSubmitResult> | FormSubmitResult;
  /** Form content — ReactNode or render function */
  children: ReactNode | ((ctx: FormContextValue) => ReactNode);
  /**
   * Layout variant.
   * @default "single"
   */
  layout?: 'single' | 'two-column';
  /**
   * Show form-level error summary.
   * @default true
   */
  showErrorSummary?: boolean;
  /**
   * Submit button label.
   * @default "Submit"
   */
  submitLabel?: ReactNode;
  /**
   * Whether to show a Reset button.
   * @default false
   */
  showReset?: boolean;
  /**
   * Reset button label.
   * @default "Reset"
   */
  resetLabel?: ReactNode;
  /** Additional class names */
  className?: string;
  /** Form accessible name */
  'aria-label'?: string;
}

/**
 * Form organism.
 *
 * Composes FormField molecules with validation, dirty tracking,
 * submission handling, error summary, and accessible live regions.
 * ReactNode only throughout.
 *
 * Security: validation schemas MUST be statically defined at call site.
 * This component never constructs or evaluates schema strings.
 */
export function Form<T extends Record<string, unknown> = Record<string, unknown>>({
  initialValues,
  validate,
  onSubmit,
  children,
  layout = 'single',
  showErrorSummary = true,
  submitLabel = 'Submit',
  showReset = false,
  resetLabel = 'Reset',
  className,
  'aria-label': ariaLabel,
}: FormProps<T>) {
  const instanceId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const getFormValues = useCallback((): T => {
    if (!formRef.current) return (initialValues ?? {}) as T;
    const fd = new FormData(formRef.current);
    const values: Record<string, unknown> = { ...(initialValues ?? {}) };
    fd.forEach((val, key) => {
      values[key] = val;
    });
    return values as T;
  }, [initialValues]);

  const handleChange = useCallback(() => {
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      const formData = new FormData(e.currentTarget);
      const values = getFormValues();

      if (validate) {
        const validationErrors = await validate(values);
        const hasErrors = Object.values(validationErrors).some(Boolean);
        if (hasErrors) {
          setErrors(validationErrors);
          setTimeout(() => errorSummaryRef.current?.focus(), 50);
          return;
        }
      }

      setErrors({});
      setFormError(undefined);
      setIsSubmitting(true);

      try {
        // IMPORTANT: This component enforces client-side validation only.
        // Server-side validation MUST be performed in the onSubmit handler
        // independently of the client-side validate() result.
        // Never treat the client-side validated `values` as trusted input.
        const result = await onSubmit?.(formData, values);
        if (result && !result.success) {
          setFormError(result.error ?? 'An error occurred. Please try again.');
          setTimeout(() => errorSummaryRef.current?.focus(), 50);
        } else {
          setIsDirty(false);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validate, onSubmit, getFormValues],
  );

  const handleReset = useCallback(() => {
    formRef.current?.reset();
    setErrors({});
    setFormError(undefined);
    setIsDirty(false);
  }, []);

  const errorEntries = Object.entries(errors).filter(([, v]) => Boolean(v));
  const hasErrors = errorEntries.length > 0 || Boolean(formError);
  const summaryId = `form-error-summary-${instanceId}`;
  const ctx: FormContextValue = { errors, isDirty, isSubmitting };

  return (
    <FormContext.Provider value={ctx}>
      <form
        ref={formRef}
        aria-label={ariaLabel}
        aria-describedby={hasErrors && showErrorSummary ? summaryId : undefined}
        noValidate
        onSubmit={handleSubmit}
        onChange={handleChange}
        className={cn(className)}
      >
        {showErrorSummary && hasErrors && (
          <div
            id={summaryId}
            ref={errorSummaryRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
            className="mb-4 rounded-md border border-destructive bg-background px-4 py-3 text-sm text-destructive outline-none"
          >
            {formError && <p className="font-medium mb-1">{formError}</p>}
            {errorEntries.length > 0 && (
              <>
                <p className="font-medium">Please fix the following errors:</p>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {errorEntries.map(([field, msg]) => (
                    <li key={field}>{msg}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div
          className={cn(
            layout === 'two-column' && 'grid grid-cols-1 sm:grid-cols-2 gap-4',
            layout === 'single' && 'flex flex-col gap-4',
          )}
        >
          {typeof children === 'function' ? children(ctx) : children}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[44px]"
          >
            {isSubmitting ? 'Submitting…' : submitLabel}
          </button>
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[44px]"
            >
              {resetLabel}
            </button>
          )}
        </div>
      </form>
    </FormContext.Provider>
  );
}
