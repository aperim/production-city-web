import { cn } from '../../lib/utils';

/** Props for the RoleBadge molecule */
export interface RoleBadgeProps {
  /**
   * Role name to display.
   */
  role: string;
  /**
   * Visual variant.
   * @default "default"
   */
  variant?: 'default' | 'admin' | 'system';
  /**
   * Whether the badge can be removed.
   */
  removable?: boolean;
  /**
   * Called when the remove button is clicked.
   */
  onRemove?: () => void;
  /**
   * Additional class names.
   */
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'border-border bg-muted text-foreground',
  admin: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  system: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200',
};

/**
 * RoleBadge molecule — displays a role name with color coding.
 *
 * All user-supplied role text is rendered via JSX text escaping.
 * Long role names are truncated with a title attribute for full text.
 */
export function RoleBadge({
  role,
  variant = 'default',
  removable = false,
  onRemove,
  className,
}: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant] ?? variantClasses.default,
        className,
      )}
    >
      <span className="max-w-24 truncate" title={role}>
        {role}
      </span>
      {removable && onRemove && (
        <button
          type="button"
          aria-label={`Remove ${role}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 shrink-0 rounded-sm opacity-60 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring min-h-[1.25rem] min-w-[1.25rem] flex items-center justify-center"
        >
          <span aria-hidden="true" className="text-xs leading-none">✕</span>
        </button>
      )}
    </span>
  );
}
