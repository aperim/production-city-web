import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface FailureModeItem {
  number: number;
  title: string;
  description: string;
}

/** Props for the FailureModeCard molecule */
interface FailureModeCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of numbered failure mode items to render in a responsive grid. */
  items: FailureModeItem[];
}

/**
 * FailureModeCard molecule — numbered cards in a responsive grid.
 *
 * Grid: 1-col on mobile, 2-col on tablet, 3-col on desktop.
 * Number in large mono font; title bold; description muted.
 */
function FailureModeCard({ items, className, ...props }: FailureModeCardProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[--grid-gap,1.5rem]",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item.number}
          className="flex flex-col gap-3 rounded-md border border-border p-5"
        >
          <span
            aria-hidden="true"
            className="font-[--mono] text-muted-foreground/40 leading-none select-none"
            style={{ fontSize: "var(--font-size-display, clamp(2.5rem, 6vw, 5rem))" }}
          >
            {String(item.number).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold text-foreground text-base">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { FailureModeCard };
export type { FailureModeCardProps, FailureModeItem };
