'use client';

import { DataTable, type DataTableColumn } from '../DataTable/DataTable';
import { StatusIndicator, type StatusType } from '../../molecules/StatusIndicator/StatusIndicator';
import { RoleBadge } from '../../molecules/RoleBadge/RoleBadge';

/** Invitation shape for the table (backend-agnostic) */
export interface InvitationTableInvitation {
  id: string;
  email: string;
  status: StatusType;
  role: string;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
}

/** Props for the InvitationTable organism */
export interface InvitationTableProps {
  /**
   * Invitation data to display.
   */
  invitations: InvitationTableInvitation[];
  /**
   * Loading state.
   */
  loading?: boolean;
  /**
   * Called when revoke action is triggered.
   */
  onRevoke?: (id: string) => void;
  /**
   * Called when resend action is triggered.
   */
  onResend?: (id: string) => void;
  /**
   * Table caption for accessibility.
   * @default "Invitations"
   */
  caption?: string;
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * InvitationTable organism — admin invitation list with status and actions.
 *
 * Composes DataTable + StatusIndicator + RoleBadge + action buttons.
 * All user-supplied text rendered via JSX.
 */
export function InvitationTable({
  invitations,
  loading = false,
  onRevoke,
  onResend,
  caption = 'Invitations',
  className,
}: InvitationTableProps) {
  const columns: DataTableColumn<InvitationTableInvitation>[] = [
    {
      id: 'email',
      header: 'Email',
      accessor: (row) => (
        <span className="truncate max-w-48 block" title={row.email}>
          {row.email}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => <StatusIndicator status={row.status} size="sm" />,
    },
    {
      id: 'role',
      header: 'Role',
      accessor: (row) => <RoleBadge role={row.role} />,
    },
    {
      id: 'invitedBy',
      header: 'Invited by',
      accessor: (row) => (
        <span className="text-muted-foreground truncate max-w-32 block" title={row.invitedBy}>
          {row.invitedBy}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Sent',
      accessor: (row) => (
        <time dateTime={row.createdAt.toISOString()} className="text-muted-foreground">
          {row.createdAt.toLocaleDateString()}
        </time>
      ),
      sortable: true,
    },
    {
      id: 'expiresAt',
      header: 'Expires',
      accessor: (row) => (
        <time dateTime={row.expiresAt.toISOString()} className="text-muted-foreground">
          {row.expiresAt.toLocaleDateString()}
        </time>
      ),
    },
  ];

  const actions = [];
  if (onResend) {
    actions.push({
      label: 'Resend',
      onClick: (row: InvitationTableInvitation) => onResend(row.id),
      show: (row: InvitationTableInvitation) => row.status === 'pending' || row.status === 'expired',
    });
  }
  if (onRevoke) {
    actions.push({
      label: 'Revoke',
      onClick: (row: InvitationTableInvitation) => onRevoke(row.id),
      show: (row: InvitationTableInvitation) => row.status === 'pending',
    });
  }

  return (
    <DataTable
      columns={columns}
      data={invitations}
      loading={loading}
      caption={caption}
      rowActions={actions.length > 0 ? actions : undefined}
      className={className}
    />
  );
}
