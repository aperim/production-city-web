'use client';

import { type ReactNode } from 'react';
import { Drawer } from '../../molecules/Drawer/Drawer';
import { Tabs, type TabItem } from '../../molecules/Tabs/Tabs';
import { RoleBadge } from '../../molecules/RoleBadge/RoleBadge';
import { StatusIndicator, type StatusType } from '../../molecules/StatusIndicator/StatusIndicator';
import { AuditLogEntry, type AuditLogEntryProps } from '../../molecules/AuditLogEntry/AuditLogEntry';

/** User detail shape (backend-agnostic) */
export interface UserDetail {
  id: string;
  name: string;
  email: string;
  status: StatusType;
  roles: string[];
  createdAt: Date;
  lastLoginAt?: Date;
}

/** Props for the UserDetailPanel organism */
export interface UserDetailPanelProps {
  /**
   * Whether the panel is open.
   */
  open: boolean;
  /**
   * Called when the panel should close.
   */
  onClose: () => void;
  /**
   * User data to display.
   */
  user: UserDetail | null;
  /**
   * Audit log entries for this user.
   */
  auditLog?: AuditLogEntryProps[];
  /**
   * Actions slot (e.g. deactivate, change role buttons).
   */
  actions?: ReactNode;
  /**
   * Panel title.
   * @default "User details"
   */
  title?: string;
  /**
   * Tab labels.
   */
  tabLabels?: {
    overview?: string;
    activity?: string;
  };
  /**
   * Additional class names for the drawer.
   */
  className?: string;
}

/**
 * UserDetailPanel organism — slide-out panel for user details.
 *
 * Composes Drawer + Tabs + RoleBadge + StatusIndicator + AuditLogEntry.
 * All user-supplied text rendered via JSX.
 */
export function UserDetailPanel({
  open,
  onClose,
  user,
  auditLog = [],
  actions,
  title = 'User details',
  tabLabels,
  className,
}: UserDetailPanelProps) {
  if (!user) {
    return (
      <Drawer open={open} onClose={onClose} title={title} className={className}>
        <p className="text-sm text-muted-foreground">No user selected.</p>
      </Drawer>
    );
  }

  const overviewLabel = tabLabels?.overview ?? 'Overview';
  const activityLabel = tabLabels?.activity ?? 'Activity';

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: overviewLabel,
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate max-w-48" title={user.name}>
                {user.name}
              </span>
              <StatusIndicator status={user.status} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground truncate" title={user.email}>
              {user.email}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Roles</p>
            <div className="flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <RoleBadge
                  key={role}
                  role={role}
                  variant={role.toLowerCase() === 'admin' ? 'admin' : 'default'}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <time dateTime={user.createdAt.toISOString()}>
                {user.createdAt.toLocaleDateString()}
              </time>
            </div>
            {user.lastLoginAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last login</span>
                <time dateTime={user.lastLoginAt.toISOString()}>
                  {user.lastLoginAt.toLocaleDateString()}
                </time>
              </div>
            )}
          </div>

          {actions && (
            <div className="pt-2 border-t border-border">
              {actions}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'activity',
      label: activityLabel,
      content: (
        <div className="flex flex-col">
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No activity recorded.</p>
          ) : (
            <div className="divide-y divide-border">
              {auditLog.map((entry, i) => (
                <AuditLogEntry key={i} {...entry} />
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} title={title} className={className}>
      <Tabs items={tabs} aria-label="User detail tabs" />
    </Drawer>
  );
}
