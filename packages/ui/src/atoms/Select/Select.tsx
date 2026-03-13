import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
  type OptionHTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

const selectVariants = cva(
  [
    "w-full rounded-sm border bg-background text-foreground appearance-none",
    "bg-no-repeat bg-[right_0.625rem_center] [dir=rtl]:bg-[left_0.625rem_center] bg-[length:1rem_1rem]",
    "pe-8",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "ps-2.5 text-xs h-8",
        md: "ps-3 text-sm h-9",
        lg: "ps-3.5 text-base h-10",
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

/** A single option within a Select */
interface SelectOptionProps extends OptionHTMLAttributes<HTMLOptionElement> {
  label: string;
}

/** A group of options within a Select */
interface SelectOptionGroupProps {
  label: string;
  options: SelectOptionProps[];
}

/** Props for the Select atom */
interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  /**
   * Visible label text. Required for accessibility.
   */
  label?: ReactNode;
  /**
   * Helper text displayed below the select. Rendered as ReactNode only.
   */
  helperText?: ReactNode;
  /**
   * Error message when in error state. Sets aria-invalid.
   */
  errorMessage?: ReactNode;
  /**
   * Flat list of options, or grouped options array.
   */
  options?: (SelectOptionProps | SelectOptionGroupProps)[];
  /**
   * Placeholder text shown as a disabled first option.
   */
  placeholder?: string;
  /** Explicit ID; auto-generated if omitted. */
  id?: string;
}

function isOptionGroup(
  item: SelectOptionProps | SelectOptionGroupProps,
): item is SelectOptionGroupProps {
  return "options" in item;
}

/**
 * Select atom - native select element with custom styling, label, helper text,
 * error, placeholder, and option groups.
 *
 * Uses native select for maximum accessibility. Supports three sizes and
 * states: default, focused, disabled, error.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    size,
    error,
    label,
    helperText,
    errorMessage,
    options = [],
    placeholder,
    id: idProp,
    disabled,
    "aria-describedby": ariaDescribedby,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = id + "-helper";
  const errorId = id + "-error";

  const isError = Boolean(error ?? errorMessage);

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
      <div className="relative">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={isError ? true : undefined}
          aria-describedby={describedBy}
          className={cn(selectVariants({ size, error: isError }), className)}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
          {...props}
        >
          {placeholder != null && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((item, index) => {
            if (isOptionGroup(item)) {
              return (
                <optgroup key={index} label={item.label}>
                  {item.options.map(({ label: optLabel, ...optProps }, i) => (
                    <option key={i} {...optProps}>
                      {optLabel}
                    </option>
                  ))}
                </optgroup>
              );
            }
            const { label: optLabel, ...optProps } = item;
            return (
              <option key={index} {...optProps}>
                {optLabel}
              </option>
            );
          })}
          {children}
        </select>
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

export { Select, selectVariants };
export type { SelectProps, SelectOptionProps, SelectOptionGroupProps };
