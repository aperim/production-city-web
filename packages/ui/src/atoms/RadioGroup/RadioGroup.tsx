import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

/** A single radio option configuration */
interface RadioOptionConfig {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
}

/** Props for the RadioGroup atom */
interface RadioGroupProps {
  /**
   * Group name - ties all radio inputs together semantically.
   * Auto-generated if omitted.
   */
  name?: string;
  /**
   * Group label rendered as a legend within a fieldset.
   */
  label?: ReactNode;
  /**
   * Array of radio option configurations.
   */
  options: RadioOptionConfig[];
  /**
   * Currently selected value.
   */
  value?: string;
  /**
   * Default selected value for uncontrolled usage.
   */
  defaultValue?: string;
  /**
   * Called when the selection changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Layout direction. Defaults to vertical.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Disables the entire group.
   */
  disabled?: boolean;
  className?: string;
}

/** Props for the internal RadioItem */
interface RadioItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  id?: string;
}

const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(function RadioItem(
  { className, label, description, id: idProp, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = id + "-desc";

  return (
    <div className="flex items-start gap-2.5 min-h-[44px]">
      <div className="flex items-center min-h-[44px]">
        <input
          ref={ref}
          id={id}
          type="radio"
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            "w-4 h-4 rounded-full border border-border bg-background",
            "transition-colors duration-150",
            "checked:border-primary",
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

/**
 * RadioGroup atom - accessible group of radio buttons with fieldset/legend.
 *
 * Supports horizontal and vertical layouts, per-option descriptions, and
 * controlled/uncontrolled modes.
 */
function RadioGroup({
  name: nameProp,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  disabled = false,
  className,
}: RadioGroupProps) {
  const generatedName = useId();
  const name = nameProp ?? generatedName;

  return (
    <fieldset
      className={cn("border-0 p-0 m-0", className)}
    >
      {label != null && (
        <legend className="text-sm font-medium text-foreground mb-1.5">
          {label}
        </legend>
      )}
      <div
        className={cn(
          "flex gap-1",
          orientation === "horizontal" ? "flex-row flex-wrap" : "flex-col",
        )}
      >
        {options.map((opt, index) => (
          <RadioItem
            key={opt.id ?? opt.value ?? index}
            id={opt.id}
            name={name}
            value={opt.value}
            label={opt.label}
            description={opt.description}
            disabled={disabled || opt.disabled}
            checked={value !== undefined ? value === opt.value : undefined}
            defaultChecked={defaultValue !== undefined ? defaultValue === opt.value : undefined}
            onChange={(e) => {
              if (e.target.checked) onValueChange?.(opt.value);
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}

export { RadioGroup, RadioItem };
export type { RadioGroupProps, RadioOptionConfig, RadioItemProps };
