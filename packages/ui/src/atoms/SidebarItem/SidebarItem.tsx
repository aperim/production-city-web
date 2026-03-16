'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { sanitizeHref } from '../Link/Link';

/** Feature status for sidebar display */
export type SidebarItemStatus = 'active' | 'coming_soon' | 'planned' | 'deprecated';

/** Props for the SidebarItem atom */
export interface SidebarItemProps {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  path: string;
  /** Optional icon slot */
  icon?: ReactNode;
  /** Whether this item matches the current route */
  isActive?: boolean;
  /** Feature status */
  status?: SidebarItemStatus;
  /** Optional badge content (e.g., notification count) */
  badge?: ReactNode;
  /** Whether sidebar is in collapsed (icon-only) mode */
  collapsed?: boolean;
  /** Additional class names */
  className?: string;
}

const STATUS_INDICATORS: Record<SidebarItemStatus, { label: string; className: string } | null> = {
  active: null,
  coming_soon: { label: 'Coming soon', className: 'bg-amber-500/70' },
  planned: { label: 'Planned', className: 'bg-muted-foreground/40' },
  deprecated: { label: 'Deprecated', className: 'bg-red-500/70' },
};

/**
 * SidebarItem atom — single navigation item for the dashboard sidebar.
 *
 * Renders as an anchor with optional icon, status indicator, and badge.
 * Supports collapsed (icon-only) mode. Uses `aria-current="page"` for active state.
 */
export function SidebarItem({
  id,
  label,
  path,
  icon,
  isActive = false,
  status = 'active',
  badge,
  collapsed = false,
  className,
}: SidebarItemProps) {
  const statusIndicator = STATUS_INDICATORS[status];

  return (
    <a
      href={sanitizeHref(path)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      data-testid={`sidebar-item-${id}`}
      className={cn(
        'flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'min-h-[44px]',
        isActive
          ? 'bg-accent text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        collapsed && 'justify-center px-2',
        className,
      )}
    >
      {icon && (
        <span
          className={cn('shrink-0 w-5 h-5 flex items-center justify-center', collapsed && 'mx-auto')}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      {!collapsed && (
        <span className="flex-1 min-w-0 truncate">{label}</span>
      )}
      {!collapsed && statusIndicator && (
        <span
          className={cn('shrink-0 w-1.5 h-1.5 rounded-full', statusIndicator.className)}
          aria-label={statusIndicator.label}
          role="img"
        />
      )}
      {!collapsed && badge && (
        <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
          {badge}
        </span>
      )}
    </a>
  );
}
