'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Supported dashboard roles */
export type DashboardRole =
  | 'admin'
  | 'executive'
  | 'staff'
  | 'client'
  | 'investor'
  | 'guest'
  | 'vendor'
  | 'government'
  | 'partner'
  | 'first_nations';

/** KPI card data */
export interface KpiCard {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

/** Quick action button */
export interface QuickAction {
  label: string;
  href: string;
  icon?: ReactNode;
}

/** Activity feed entry */
export interface ActivityEntry {
  id: string;
  message: string;
  timestamp: string;
}

/** Props for the RoleDashboard template */
export interface RoleDashboardProps {
  /** User's display name */
  userName: string;
  /** User's primary role */
  role: DashboardRole;
  /** KPI cards to display */
  kpiCards?: KpiCard[];
  /** Quick action buttons */
  quickActions?: QuickAction[];
  /** Recent activity feed */
  activities?: ActivityEntry[];
  /** Whether data is loading */
  loading?: boolean;
  /** Additional class names */
  className?: string;
}

/** Role display labels */
const ROLE_LABELS: Record<DashboardRole, string> = {
  admin: 'Administrator',
  executive: 'Executive',
  staff: 'Staff',
  client: 'Client',
  investor: 'Investor',
  guest: 'Guest',
  vendor: 'Vendor',
  government: 'Government',
  partner: 'Partner',
  first_nations: 'First Nations',
};

/** Role-appropriate welcome subtext */
const ROLE_WELCOME: Record<DashboardRole, string> = {
  admin: 'System overview and management tools',
  executive: 'Strategic metrics and company performance',
  staff: 'Your workspace and daily tasks',
  client: 'Project updates and communications',
  investor: 'Portfolio performance and reports',
  guest: 'Welcome to Production City',
  vendor: 'Orders, invoices, and deliveries',
  government: 'Compliance, reporting, and policy',
  partner: 'Partnership metrics and collaboration',
  first_nations: 'Cultural programs and community initiatives',
};

/**
 * RoleDashboard template — role-specific landing page.
 *
 * Shows welcome message, KPI cards, quick actions, and activity feed.
 * Phase 1: placeholder content; Phase 2+: live data.
 */
export function RoleDashboard({
  userName,
  role,
  kpiCards = [],
  quickActions = [],
  activities = [],
  loading = false,
  className,
}: RoleDashboardProps) {
  return (
    <div className={cn('p-6 max-w-5xl', className)}>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-lg font-medium text-foreground">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ROLE_LABELS[role]} &middot; {ROLE_WELCOME[role]}
        </p>
      </div>

      {/* KPI Cards */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="rounded-sm border border-border bg-card p-4 flex flex-col gap-1"
            >
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-medium text-foreground tabular-nums">
                  {loading ? '-' : card.value}
                </p>
                {card.change && !loading && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      card.trend === 'up' && 'text-emerald-500',
                      card.trend === 'down' && 'text-red-500',
                      card.trend === 'neutral' && 'text-muted-foreground',
                    )}
                  >
                    {card.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading placeholder for KPI cards */}
      {loading && kpiCards.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-sm border border-border bg-card p-4 animate-pulse"
            >
              <div className="h-3 w-20 bg-muted rounded mb-2" />
              <div className="h-7 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-foreground mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {action.icon && <span className="w-4 h-4" aria-hidden="true">{action.icon}</span>}
                {action.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {activities.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-foreground mb-3">Recent Activity</h2>
          <div className="divide-y divide-border rounded-sm border border-border">
            {activities.map((entry) => (
              <div key={entry.id} className="px-3 py-2 flex items-baseline justify-between gap-4">
                <p className="text-sm text-foreground truncate">{entry.message}</p>
                <time className="text-xs text-muted-foreground whitespace-nowrap" dateTime={entry.timestamp}>
                  {entry.timestamp}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && kpiCards.length === 0 && quickActions.length === 0 && activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Your dashboard is being set up. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
