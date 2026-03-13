import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const inputGroupVariants = cva(
  [
    "flex w-full items-stretch overflow-hidden",
    "rounded-sm border border-border bg-background",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
    "has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-8 text-xs",
        md: "h-9 text-sm",
        lg: "h-10 text-base",
      },
      error: {
        true: "border-destructive focus-within:ring-destructive",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  },
);

const addonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "bg-muted text-muted-foreground select-none",
    "border-border",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "px-2",
        md: "px-3",
        lg: "px-3.5",
      },
      position: {
        start: "border-e",
        end: "border-s",
      },
      clickable: {
        true: "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-150",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      position: "start",
      clickable: false,
    },
  },
);

/** Props for the InputGroup molecule */
export interface InputGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputGroupVariants> {
  /**
   * Prefix addon — icon, text string, or ReactNode rendered before the input.
   */
  prefix?: ReactNode;
  /**
   * Suffix addon — icon, text string, or ReactNode rendered after the input.
   */
  suffix?: ReactNode;
  /**
   * Click handler for the prefix addon (makes it interactive).
   */
  onPrefixClick?: () => void;
  /**
   * Click handler for the suffix addon (makes it interactive).
   */
  onSuffixClick?: () => void;
  /**
   * Accessible label for clickable prefix addon.
   */
  prefixLabel?: string;
  /**
   * Accessible label for clickable suffix addon.
   */
  suffixLabel?: string;
}

/**
 * InputGroup molecule — an input with connected prefix and/or suffix addons.
 *
 * Addons can be static (text/icon labels) or interactive (clickable buttons).
 * The entire group shows a unified border and focus ring.
 */
export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  function InputGroup(
    {
      prefix,
      suffix,
      onPrefixClick,
      onSuffixClick,
      prefixLabel,
      suffixLabel,
      size,
      error,
      className,
      ...inputProps
    },
    ref,
  ) {
    const inputClasses = cn(
      "flex-1 min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
      size === "sm" ? "px-2.5" : size === "lg" ? "px-3.5" : "px-3",
    );

    const prefixClickable = Boolean(onPrefixClick);
    const suffixClickable = Boolean(onSuffixClick);

    return (
      <div className={cn(inputGroupVariants({ size, error }), className)}>
        {prefix != null && (
          prefixClickable ? (
            <button
              type="button"
              aria-label={prefixLabel}
              onClick={onPrefixClick}
              className={cn(addonVariants({ size, position: "start", clickable: true }))}
            >
              {prefix}
            </button>
          ) : (
            <span
              aria-hidden={typeof prefix !== "string"}
              className={cn(addonVariants({ size, position: "start" }))}
            >
              {prefix}
            </span>
          )
        )}

        <input
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={inputClasses}
          {...inputProps}
        />

        {suffix != null && (
          suffixClickable ? (
            <button
              type="button"
              aria-label={suffixLabel}
              onClick={onSuffixClick}
              className={cn(addonVariants({ size, position: "end", clickable: true }))}
            >
              {suffix}
            </button>
          ) : (
            <span
              aria-hidden={typeof suffix !== "string"}
              className={cn(addonVariants({ size, position: "end" }))}
            >
              {suffix}
            </span>
          )
        )}
      </div>
    );
  },
);
