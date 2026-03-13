import { useId, type ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the FormField molecule */
export interface FormFieldProps {
  /**
   * Label text for the form field. Required for accessibility.
   */
  label: ReactNode;
  /**
   * The form control(s) to wrap. Receives id and aria props automatically
   * via context when using controlled children.
   */
  children: ReactNode;
  /**
   * Additional hint text shown below the control.
   */
  helperText?: ReactNode;
  /**
   * Error message. When provided, marks the field as invalid.
   */
  errorMessage?: ReactNode;
  /**
   * When true, shows a required indicator (*) after the label.
   * @default false
   */
  required?: boolean;
  /**
   * When true, shows an "(optional)" indicator after the label.
   * @default false
   */
  optional?: boolean;
  /**
   * Renders the label inline (side-by-side) instead of above.
   * @default false
   */
  inline?: boolean;
  /**
   * Explicit ID for the inner control; auto-generated if omitted.
   */
  id?: string;
  /**
   * Additional class names for the root wrapper.
   */
  className?: string;
  /**
   * Character count to display (e.g. "120 / 200").
   */
  characterCount?: ReactNode;
}

/**
 * FormField molecule — wraps any form control with a label, helper text,
 * error message, and optional/required indicators.
 *
 * The `id` is forwarded via `data-field-id` so child primitives can pick it up.
 * For direct use with Input/Textarea/Select atoms, pass `id` as a prop to both
 * FormField and the inner control, or rely on each atom's own built-in label.
 */
export function FormField({
  label,
  children,
  helperText,
  errorMessage,
  required = false,
  optional = false,
  inline = false,
  id: idProp,
  className,
  characterCount,
}: FormFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const isError = Boolean(errorMessage);

  return (
    <div
      className={cn(
        "flex w-full gap-1.5",
        inline ? "flex-row items-center" : "flex-col",
        className,
      )}
      data-field-id={id}
    >
      <div className={cn("flex items-center justify-between", inline && "shrink-0 min-w-24")}>
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground leading-none"
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className="ml-0.5 text-destructive"
            >
              *
            </span>
          )}
          {optional && !required && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          )}
        </label>
        {characterCount != null && (
          <span className="text-xs text-muted-foreground">{characterCount}</span>
        )}
      </div>

      <div className={cn("flex flex-col gap-1", inline && "flex-1")}>
        {children}

        {isError && errorMessage != null && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {errorMessage}
          </p>
        )}
        {!isError && helperText != null && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
}
