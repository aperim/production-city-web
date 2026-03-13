import {
  useState,
  useRef,
  useId,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

type TooltipPosition = "top" | "right" | "bottom" | "left";

/** Props for the Tooltip atom */
interface TooltipProps {
  /**
   * The content displayed inside the tooltip.
   * Must be ReactNode only - never dangerouslySetInnerHTML.
   */
  content: ReactNode;
  /**
   * The element that triggers the tooltip.
   */
  children: ReactNode;
  /**
   * Preferred position for the tooltip. Auto-flips if it overflows the viewport.
   */
  position?: TooltipPosition;
  /**
   * Delay before the tooltip appears (ms).
   */
  enterDelay?: number;
  /**
   * Delay before the tooltip disappears (ms).
   */
  leaveDelay?: number;
  /**
   * Maximum width of the tooltip in pixels.
   */
  maxWidth?: number;
  /**
   * Whether to show an arrow pointer.
   */
  showArrow?: boolean;
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-popover",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-popover",
  left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-popover",
  right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-popover",
};

/**
 * Tooltip atom - accessible tooltip that appears on hover and focus.
 *
 * Position: top/right/bottom/left with auto-flip on viewport edge.
 * Content: ReactNode only (no dangerouslySetInnerHTML).
 * Accessibility: role="tooltip", aria association.
 */
function Tooltip({
  content,
  children,
  position = "top",
  enterDelay = 300,
  leaveDelay = 100,
  maxWidth = 240,
  showArrow = true,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
  const tooltipId = useId();
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const checkPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Auto-flip logic: prefer the requested position, flip if it overflows
    let best: TooltipPosition = position;
    if (position === "top" && triggerRect.top - tooltipRect.height < 0) best = "bottom";
    else if (position === "bottom" && triggerRect.bottom + tooltipRect.height > vh) best = "top";
    else if (position === "left" && triggerRect.left - tooltipRect.width < 0) best = "right";
    else if (position === "right" && triggerRect.right + tooltipRect.width > vw) best = "left";
    setActualPosition(best);
  }, [position]);

  useEffect(() => {
    if (visible) {
      // Wait a frame for the tooltip to render before measuring
      requestAnimationFrame(checkPosition);
    }
  }, [visible, checkPosition]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const show = useCallback(() => {
    clearTimers();
    enterTimer.current = setTimeout(() => setVisible(true), enterDelay);
  }, [clearTimers, enterDelay]);

  const hide = useCallback(() => {
    clearTimers();
    leaveTimer.current = setTimeout(() => setVisible(false), leaveDelay);
  }, [clearTimers, leaveDelay]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      // aria-describedby on the outermost span that wraps the trigger.
      // This is the most reliable pattern: the trigger element (button, link)
      // is a direct child and inherits the aria relationship from this container.
      // Using onFocusCapture/onBlurCapture ensures focus events bubble up
      // from any focusable descendant.
      aria-describedby={visible ? tooltipId : undefined}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{ maxWidth }}
          className={cn(
            "absolute z-50 rounded-sm px-2.5 py-1.5 text-xs",
            "bg-popover text-popover-foreground",
            "border border-border shadow-sm",
            "pointer-events-none whitespace-normal break-words",
            positionClasses[actualPosition],
            className,
          )}
        >
          {content}
          {showArrow && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute border-4",
                arrowClasses[actualPosition],
              )}
            />
          )}
        </div>
      )}
    </span>
  );
}

export { Tooltip };
export type { TooltipProps, TooltipPosition };
