import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Status of a single step */
export type StepStatus = "pending" | "active" | "completed" | "error" | "disabled";

/** A single step item */
export interface StepItem {
  /** Unique identifier. */
  id: string;
  /** Step label. */
  label: ReactNode;
  /** Optional description below the label. */
  description?: ReactNode;
  /** Current status of the step. */
  status: StepStatus;
}

/** Props for the Stepper molecule */
export interface StepperProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** Step items in order. */
  steps: StepItem[];
  /**
   * Orientation of the stepper.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Called when a completed step is clicked.
   */
  onStepClick?: (id: string) => void;
}

const statusIcons: Record<StepStatus, string> = {
  completed: "✓",
  error: "✕",
  active: "",
  pending: "",
  disabled: "",
};

const stepIndicatorClasses: Record<StepStatus, string> = {
  pending: "border-border bg-background text-muted-foreground",
  active: "border-primary bg-primary text-primary-foreground",
  completed: "border-green-600 bg-green-600 text-white",
  error: "border-destructive bg-destructive text-destructive-foreground",
  disabled: "border-border bg-muted text-muted-foreground opacity-50",
};

const stepLabelClasses: Record<StepStatus, string> = {
  pending: "text-muted-foreground",
  active: "text-foreground font-medium",
  completed: "text-foreground",
  error: "text-destructive",
  disabled: "text-muted-foreground opacity-50",
};

/**
 * Stepper molecule — visual step progress indicator.
 *
 * Shows step status (pending, active, completed, error, disabled).
 * Completed steps are clickable.
 * Implements role="list" with accessible step status announced.
 */
export function Stepper({
  steps,
  orientation = "horizontal",
  onStepClick,
  className,
  ...props
}: StepperProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <ol
      className={cn(
        "flex",
        isHorizontal ? "flex-row items-start gap-0" : "flex-col gap-0",
        className,
      )}
      aria-label="Steps"
      {...props}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isClickable = step.status === "completed" && Boolean(onStepClick);
        const icon = statusIcons[step.status];
        const stepNumber = index + 1;

        const indicator = (
          <span
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
              stepIndicatorClasses[step.status],
            )}
            aria-hidden="true"
          >
            {icon || stepNumber}
          </span>
        );

        return (
          <li
            key={step.id}
            className={cn(
              "flex",
              isHorizontal ? "flex-1 flex-col items-center" : "flex-row gap-3",
            )}
            aria-label={`Step ${stepNumber}: ${typeof step.label === "string" ? step.label : ""}`}
          >
            <div className={cn("flex", isHorizontal ? "flex-col items-center w-full" : "flex-row items-start gap-3 w-full")}>
              <div className={cn("flex", isHorizontal ? "flex-row items-center w-full" : "flex-col items-center")}>
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(step.id)}
                    aria-label={`Go to step ${stepNumber}: ${typeof step.label === "string" ? step.label : ""}`}
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-full"
                  >
                    {indicator}
                  </button>
                ) : (
                  indicator
                )}

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "bg-border",
                      isHorizontal ? "h-px flex-1 mx-2" : "w-px h-6 ms-3.5 my-1",
                    )}
                  />
                )}
              </div>

              <div className={cn(isHorizontal ? "mt-2 text-center" : "flex-1 pb-4")}>
                <span
                  className={cn("block text-sm", stepLabelClasses[step.status])}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
