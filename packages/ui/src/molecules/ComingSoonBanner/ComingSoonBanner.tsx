import { cn } from '../../lib/utils';

export type SubscribeState = 'idle' | 'submitting' | 'subscribed' | 'error';

export interface ComingSoonBannerProps {
  /** Feature status */
  status: 'coming_soon' | 'planned';
  /** Target implementation quarter (e.g., "Q3 2026") */
  targetQuarter?: string | null;
  /** Feature ID for subscribe action */
  featureId: string;
  /** Current subscribe state */
  subscribeState: SubscribeState;
  /** Called when user clicks notify/try again */
  onSubscribe: (featureId: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * ComingSoonBanner molecule — displays feature availability status
 * with a notify-me button state machine.
 *
 * States: idle -> submitting -> subscribed | error
 */
export function ComingSoonBanner({
  status,
  targetQuarter,
  featureId,
  subscribeState,
  onSubscribe,
  className,
}: ComingSoonBannerProps) {
  const statusLabel = status === 'coming_soon' && targetQuarter
    ? `Coming ${targetQuarter}`
    : 'Planned';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-sm border border-border bg-muted/50 px-4 py-3',
        className,
      )}
      role="status"
    >
      <span className="text-sm font-medium text-muted-foreground">{statusLabel}</span>
      <NotifyButton
        state={subscribeState}
        onClick={() => onSubscribe(featureId)}
      />
    </div>
  );
}

function NotifyButton({ state, onClick }: { state: SubscribeState; onClick: () => void }) {
  switch (state) {
    case 'idle':
      return (
        <button
          type="button"
          onClick={onClick}
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Notify Me
        </button>
      );
    case 'submitting':
      return (
        <button
          type="button"
          disabled
          className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          Subscribing...
        </button>
      );
    case 'subscribed':
      return (
        <span className="text-xs text-muted-foreground">Subscribed</span>
      );
    case 'error':
      return (
        <button
          type="button"
          onClick={onClick}
          className="rounded-sm border border-destructive/50 bg-background px-3 py-1.5 text-xs font-medium text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try Again
        </button>
      );
    default: {
      const _exhaustive: never = state;
      return <span className="text-xs text-muted-foreground">{String(_exhaustive)}</span>;
    }
  }
}
