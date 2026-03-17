'use client';

import { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { SubViewTabs, type SubViewTab } from '../../molecules/SubViewTabs/SubViewTabs';
import { UserTable, type UserTableUser, type PaginationInfo } from '../UserTable/UserTable';
import { InvitationTable, type InvitationTableInvitation } from '../InvitationTable/InvitationTable';
import { ApprovalCard } from '../ApprovalCard/ApprovalCard';
import type { StatusType } from '../../molecules/StatusIndicator/StatusIndicator';
import type { SortState } from '../DataTable/DataTable';

/** Permission flags for sub-view visibility. */
export interface UsersCanvasPermissions {
  /** Can view the Users sub-view. Maps to `user:read`. */
  userRead: boolean;
  /** Can view the Invitations sub-view. Maps to `invitation:read`. */
  invitationRead: boolean;
  /** Can view the Approvals sub-view. Maps to `user:update`. */
  userUpdate: boolean;
}

/** Approval item shape. */
export interface ApprovalItem {
  name: string;
  email: string;
  role: string;
  avatarInitial?: string;
}

/** Props for the UsersCanvas organism. */
export interface UsersCanvasProps {
  /** User data for the Users sub-view. */
  users: UserTableUser[];
  /** Pagination for the Users sub-view. */
  usersPagination: PaginationInfo;
  /** Page change handler for Users. */
  onUsersPageChange: (page: number) => void;
  /** Search handler for Users. */
  onUsersSearch: (query: string) => void;
  /** Filter handler for Users. */
  onUsersFilter: (status: StatusType | '') => void;
  /** Sort handler for Users. */
  onUsersSort: (sort: SortState) => void;
  /** Row click handler for Users. */
  onUserClick: (userId: string) => void;
  /** Invitation data for the Invitations sub-view. */
  invitations: InvitationTableInvitation[];
  /** Resend invitation handler. */
  onInvitationResend?: (id: string) => void;
  /** Revoke invitation handler. */
  onInvitationRevoke?: (id: string) => void;
  /** Approval items for the Approvals sub-view. */
  approvals: ApprovalItem[];
  /** Approve handler. */
  onApprove: (index: number) => void;
  /** Reject handler. */
  onReject: (index: number) => void;
  /** Permission flags controlling sub-view visibility. */
  permissions: UsersCanvasPermissions;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Initial sub-view (overrides permission-aware default). */
  initialView?: 'users' | 'invitations' | 'approvals';
  /** Called when the active sub-view changes. */
  onViewChange?: (view: string) => void;
  /** Additional class names. */
  className?: string;
}

type ViewId = 'users' | 'invitations' | 'approvals';

/**
 * UsersCanvas organism — container with SubViewTabs for Users, Invitations,
 * and Approvals sub-views.
 *
 * Permission-aware: tabs are filtered based on permissions, and the default
 * tab is the first authorized sub-view.
 */
export function UsersCanvas({
  users,
  usersPagination,
  onUsersPageChange,
  onUsersSearch,
  onUsersFilter,
  onUsersSort,
  onUserClick,
  invitations,
  onInvitationResend,
  onInvitationRevoke,
  approvals,
  onApprove,
  onReject,
  permissions,
  loading = false,
  error,
  initialView,
  onViewChange,
  className,
}: UsersCanvasProps) {
  const availableTabs = useMemo(() => {
    const tabs: SubViewTab[] = [];
    if (permissions.userRead) tabs.push({ id: 'users', label: 'Users' });
    if (permissions.invitationRead) tabs.push({ id: 'invitations', label: 'Invitations' });
    if (permissions.userUpdate) tabs.push({ id: 'approvals', label: 'Approvals' });
    return tabs;
  }, [permissions.userRead, permissions.invitationRead, permissions.userUpdate]);

  const defaultTab = initialView && availableTabs.some((t) => t.id === initialView)
    ? initialView
    : (availableTabs[0]?.id as ViewId | undefined);

  const [activeView, setActiveView] = useState<ViewId>(defaultTab ?? 'users');

  const handleTabChange = (tabId: string) => {
    setActiveView(tabId as ViewId);
    onViewChange?.(tabId);
  };

  // No permissions at all
  if (availableTabs.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-muted-foreground', className)}>
        No access to user management
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-destructive', className)}>
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-muted-foreground', className)}>
        Loading...
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <SubViewTabs
        tabs={availableTabs}
        activeTab={activeView}
        onTabChange={handleTabChange}
        aria-label="User management views"
      />

      <div className="flex-1 overflow-y-auto p-4">
        {activeView === 'users' && permissions.userRead && (
          users.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No users found
            </div>
          ) : (
            <UserTable
              users={users}
              pagination={usersPagination}
              onPageChange={onUsersPageChange}
              onSearch={onUsersSearch}
              onFilter={onUsersFilter}
              onSort={onUsersSort}
              onUserClick={onUserClick}
            />
          )
        )}

        {activeView === 'invitations' && permissions.invitationRead && (
          <InvitationTable
            invitations={invitations}
            onResend={onInvitationResend}
            onRevoke={onInvitationRevoke}
          />
        )}

        {activeView === 'approvals' && permissions.userUpdate && (
          approvals.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No pending approvals
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {approvals.map((item, index) => (
                <ApprovalCard
                  key={item.email}
                  name={item.name}
                  email={item.email}
                  role={item.role}
                  avatarInitial={item.avatarInitial}
                  onApprove={() => onApprove(index)}
                  onReject={() => onReject(index)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
