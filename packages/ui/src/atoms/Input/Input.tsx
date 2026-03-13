import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

const inputWrapperVariants = cva("relative flex items-center w-full", {
  variants: {
    size: {
      sm: "h-8",
      md: "h-9",
      lg: "h-10",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const inputVariants = cva(
  [
    "w-full rounded-sm border bg-background text-foreground",
    "transition-colors duration-150",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "read-only:bg-muted read-only:cursor-default",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "px-2.5 text-xs h-8",
        md: "px-3 text-sm h-9",
        lg: "px-3.5 text-base h-10",
      },
      error: {
        true: "border-destructive focus-visible:ring-destructive",
        false: "border-border",
      },
      hasLeftIcon: {
        true: "ps-8",
        false: "",
      },
      hasRightIcon: {
        true: "pe-8",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
      hasLeftIcon: false,
      hasRightIcon: false,
    },
  },
);

/** Props for the Input atom */
interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /**
   * Visible label text. Required for accessibility unless aria-label is
   * provided directly (e.g. icon-only search inputs).
   */
  label?: ReactNode;
  /**
   * Helper text displayed below the input. Rendered as ReactNode only.
   */
  helperText?: ReactNode;
  /**
   * Error message replaces helperText when the field is in error state.
   * Sets aria-invalid on the input.
   */
  errorMessage?: ReactNode;
  /** Icon rendered on the left inside the input. */
  leftIcon?: ReactNode;
  /** Icon rendered on the right inside the input. */
  rightIcon?: ReactNode;
  /** Input type - text, email, password, number, or search. */
  type?: "text" | "email" | "password" | "number" | "search";
  /** Explicit ID for the input element; auto-generated if omitted. */
  id?: string;
}

/**
 * Input atom - styled text field with label, helper text, error, and icon slots.
 *
 * Supports five types (text, email, password, number, search),
 * three sizes (sm, md, lg), and states: default, focused, disabled, error, readonly.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    size,
    error,
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    id: idProp,
    type = "text",
    disabled,
    readOnly,
    "aria-describedby": ariaDescribedby,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = id + "-helper";
  const errorId = id + "-error";

  const isError = Boolean(error ?? errorMessage);
  const hasLeft = Boolean(leftIcon);
  const hasRight = Boolean(rightIcon);

  const describedByParts = [
    isError && errorMessage ? errorId : null,
    helperText ? helperId : null,
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
      <div className={cn(inputWrapperVariants({ size }))}>
        {hasLeft && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 start-0 flex items-center ps-2.5 text-muted-foreground pointer-events-none"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={isError ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            inputVariants({
              size,
              error: isError,
              hasLeftIcon: hasLeft,
              hasRightIcon: hasRight,
            }),
            className,
          )}
          {...props}
        />
        {hasRight && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 end-0 flex items-center pe-2.5 text-muted-foreground pointer-events-none"
          >
            {rightIcon}
          </span>
        )}
      </div>
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
  );
});

export { Input, inputVariants };
export type { InputProps };
