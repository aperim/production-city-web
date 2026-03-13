import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const toggleTrackVariants = cva(
  [
    "relative inline-flex shrink-0 rounded-full border-2 border-transparent",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "cursor-pointer",
    "bg-muted",
    "peer-checked:bg-primary",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const toggleThumbVariants = cva(
  [
    "pointer-events-none absolute rounded-full bg-background shadow-sm",
    "transition-transform duration-150",
    "top-0 left-0",
    "peer-checked:translate-x-full",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/** Props for the Toggle atom */
interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">,
    VariantProps<typeof toggleTrackVariants> {
  /**
   * Visible label rendered next to the toggle.
   */
  label?: ReactNode;
  /**
   * Description text rendered below the label.
   */
  description?: ReactNode;
  /** Explicit ID; auto-generated if omitted. */
  id?: string;
}

/**
 * Toggle atom - a switch/toggle control implemented as a styled checkbox.
 *
 * States: off, on, disabled.
 * Sizes: sm, md, lg.
 * Minimum touch target: 44x44px.
 */
const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { className, size, label, description, id: idProp, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const descriptionId = id + "-desc";

  return (
    <div className="flex items-start gap-3 min-h-[44px]">
      <div className="flex items-center min-h-[44px]">
        <label
          htmlFor={id}
          className={cn(
            "relative inline-flex items-center",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            role="switch"
            disabled={disabled}
            aria-describedby={description ? descriptionId : undefined}
            className={cn("peer sr-only", className)}
            {...props}
          />
          <span className={cn(toggleTrackVariants({ size }))}>
            <span className={cn(toggleThumbVariants({ size }))} />
          </span>
        </label>
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

export { Toggle, toggleTrackVariants };
export type { ToggleProps };
