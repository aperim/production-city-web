import { cn } from "../../lib/utils";

export interface CommandBarTriggerProps {
  /** Called when the trigger is clicked. */
  onClick: () => void;
  /** Optional label text shown before the shortcut hint. */
  label?: string;
  /** Additional class names. */
  className?: string;
}

/**
 * CommandBarTrigger atom — button showing keyboard shortcut hint (Cmd+K).
 * Used in the dashboard header to open the command bar.
 */
export function CommandBarTrigger({
  onClick,
  label,
  className,
}: CommandBarTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open command palette"
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150",
        className,
      )}
    >
      {label && <span>{label}</span>}
      <kbd className="pointer-events-none inline-flex items-center gap-0.5 rounded-sm border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </button>
  );
}
