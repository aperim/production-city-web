import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  useId,
  useEffect,
  useRef,
  useCallback,
  type TextareaHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { cn } from "../../lib/utils";

const textareaVariants = cva(
  [
    "w-full rounded-sm border bg-background text-foreground",
    "transition-colors duration-150",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "read-only:bg-muted read-only:cursor-default",
    "resize-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "px-2.5 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-3.5 py-2.5 text-base",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "border-border",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  },
);

/** Props for the Textarea atom */
interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  /**
   * Visible label text. Required for accessibility.
   */
  label?: ReactNode;
  /**
   * Helper text displayed below the textarea. Rendered as ReactNode only.
   */
  helperText?: ReactNode;
  /**
   * Error message when the field is in error state. Sets aria-invalid.
   */
  errorMessage?: ReactNode;
  /**
   * When true, the textarea automatically resizes to fit its content.
   * Controlled via JavaScript; does not use CSS resize.
   */
  autoResize?: boolean;
  /**
   * Maximum character count to enforce. Shows a counter below.
   */
  maxLength?: number;
  /**
   * Minimum number of visible rows.
   */
  minRows?: number;
  /**
   * Maximum number of visible rows when autoResize is enabled.
   */
  maxRows?: number;
  /** Explicit ID; auto-generated if omitted. */
  id?: string;
}

/**
 * Textarea atom - multi-line text field with label, helper text, error,
 * auto-resize, and character count support.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    size,
    error,
    label,
    helperText,
    errorMessage,
    autoResize = false,
    maxLength,
    minRows = 3,
    maxRows,
    id: idProp,
    disabled,
    readOnly,
    onChange,
    value,
    defaultValue,
    "aria-describedby": ariaDescribedby,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = id + "-helper";
  const errorId = id + "-error";
  const counterId = id + "-counter";

  const isError = Boolean(error ?? errorMessage);

  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    },
    [ref],
  );

  const currentLength =
    value != null
      ? String(value).length
      : defaultValue != null
        ? String(defaultValue).length
        : 0;

  const adjustHeight = useCallback(() => {
    const el = internalRef.current;
    if (!el || !autoResize) return;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10) || 20;
    const padding =
      parseInt(getComputedStyle(el).paddingTop, 10) +
      parseInt(getComputedStyle(el).paddingBottom, 10);
    const minH = lineHeight * minRows + padding;
    const maxH = maxRows ? lineHeight * maxRows + padding : Infinity;
    el.style.height = Math.min(Math.max(el.scrollHeight, minH), maxH) + "px";
  }, [autoResize, minRows, maxRows]);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight, value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    onChange?.(e);
  };

  const describedByParts = [
    isError && errorMessage ? errorId : null,
    helperText ? helperId : null,
    maxLength != null ? counterId : null,
  ]
    .filter(Boolean)
    .join(" ");
  const describedBy = ariaDescribedby ?? (describedByParts || undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label != null && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground leading-none"
        >
          {label}
        </label>
      )}
      <textarea
        ref={setRef}
        id={id}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        rows={minRows}
        aria-invalid={isError ? true : undefined}
        aria-describedby={describedBy}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(textareaVariants({ size, error: isError }), className)}
        {...props}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {isError && errorMessage != null && (
            <p id={errorId} className="text-xs text-destructive">
              {errorMessage}
            </p>
          )}
          {!isError && helperText != null && (
            <p id={helperId} className="text-xs text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
        {maxLength != null && (
          <p
            id={counterId}
            className={cn(
              "text-xs shrink-0",
              currentLength > maxLength * 0.9
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

export { Textarea, textareaVariants };
export type { TextareaProps };
