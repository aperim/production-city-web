import { cn } from '../../lib/utils';
import { FeatureStatusDot, type FeatureDotStatus } from '../FeatureStatusDot/FeatureStatusDot';

export interface TabItemProps {
  /** Tab label */
  label: string;
  /** Whether this tab is currently active */
  active?: boolean;
  /** Feature status for the dot indicator */
  status?: FeatureDotStatus;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * Individual tab button for the workspace tab bar.
 * Shows label with optional status dot. Active state uses underline indicator.
 */
export function TabItem({ label, active, status, onClick, className }: TabItemProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap',
        'min-h-[44px] border-b-2 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-foreground text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
        className,
      )}
    >
      {status && <FeatureStatusDot status={status} />}
      {label}
    </button>
  );
}
