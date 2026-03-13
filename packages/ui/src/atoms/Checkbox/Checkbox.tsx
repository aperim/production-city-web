import {
  forwardRef,
  useId,
  useRef,
  useEffect,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

/** Props for the Checkbox atom */
interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /**
   * Label text rendered next to the checkbox. Required for accessibility.
   */
  label?: ReactNode;
  /**
   * Description text rendered below the label.
   */
  description?: ReactNode;
  /**
   * When true, the checkbox shows an indeterminate dash indicator.
   * The indeterminate prop sets the DOM property directly.
   */
  indeterminate?: boolean;
  /** Explicit ID; auto-generated if omitted. */
  id?: string;
}

/**
 * Checkbox atom - single checkbox with label, description, and indeterminate support.
 *
 * States: unchecked, checked, indeterminate, disabled.
 * Minimum touch target: 44x44px.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    className,
    label,
    description,
    indeterminate = false,
    id: idProp,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = id + "-desc";
  const internalRef = useRef<HTMLInputElement | null>(null);

  const setRef = (el: HTMLInputElement | null) => {
    internalRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="flex items-start gap-2.5 min-h-[44px]">
      <div className="flex items-center min-h-[44px]">
        <input
          ref={setRef}
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-checked={indeterminate ? "mixed" : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            "w-4 h-4 rounded-xs border border-border bg-background",
            "transition-colors duration-150",
            "checked:bg-primary checked:border-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer",
            className,
          )}
          {...props}
        />
      </div>
      {(label != null || description != null) && (
        <div className="flex flex-col gap-0.5 min-h-[44px] justify-center">
          {label != null && (
            <label
              htmlFor={id}
              className={cn(
                "text-sm font-medium text-foreground leading-none cursor-pointer",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {label}
            </label>
          )}
          {description != null && (
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

/** Props for CheckboxGroup */
interface CheckboxGroupProps {
  /**
   * Group label.
   */
  label?: ReactNode;
  /**
   * Array of checkbox option configs.
   */
  options: Array<{
    id?: string;
    value: string;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean, value: string) => void;
  }>;
  /**
   * When true, shows a "Select all" checkbox at the top.
   */
  selectAll?: boolean;
  /**
   * Label for the "Select all" checkbox. Defaults to "Select all".
   */
  selectAllLabel?: ReactNode;
  className?: string;
}

/**
 * CheckboxGroup atom - manages a set of checkboxes with optional "Select all".
 *
 * Uses fieldset + legend for group semantics.
 */
function CheckboxGroup({
  label,
  options,
  selectAll = false,
  selectAllLabel = "Select all",
  className,
}: CheckboxGroupProps) {
  const allChecked = options.every((o) => o.checked);
  const someChecked = options.some((o) => o.checked);
  const isIndeterminate = someChecked && !allChecked;
  const selectAllId = useId();

  const handleSelectAll = (checked: boolean) => {
    for (const opt of options) {
      opt.onChange?.(checked, opt.value);
    }
  };

  return (
    <fieldset className={cn("flex flex-col gap-1 border-0 p-0 m-0", className)}>
      {label != null && (
        <legend className="text-sm font-medium text-foreground mb-1.5">
          {label}
        </legend>
      )}
      {selectAll && (
        <Checkbox
          id={selectAllId}
          label={selectAllLabel}
          indeterminate={isIndeterminate}
          checked={allChecked}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      )}
      {options.map((opt, index) => (
        <Checkbox
          key={opt.id ?? opt.value ?? index}
          id={opt.id}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          disabled={opt.disabled}
          checked={opt.checked}
          defaultChecked={opt.defaultChecked}
          onChange={(e) => opt.onChange?.(e.target.checked, opt.value)}
          className={selectAll ? "ml-6" : undefined}
        />
      ))}
    </fieldset>
  );
}

export { Checkbox, CheckboxGroup };
export type { CheckboxProps, CheckboxGroupProps };
