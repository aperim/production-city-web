'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { DataTable, type DataTableColumn, type SortState } from '../DataTable/DataTable';
import { StatusIndicator, type StatusType } from '../../molecules/StatusIndicator/StatusIndicator';
import { RoleBadge } from '../../molecules/RoleBadge/RoleBadge';

/** User shape for the table (backend-agnostic) */
export interface UserTableUser {
  id: string;
  name: string;
  email: string;
  status: StatusType;
  roles: string[];
  createdAt: Date;
}

/** Pagination info */
export interface PaginationInfo {
  page: number;
  totalPages: number;
  pageSize: number;
}

/** Props for the UserTable organism */
export interface UserTableProps {
  /**
   * User data to display.
   */
  users: UserTableUser[];
  /**
   * Pagination state.
   */
  pagination: PaginationInfo;
  /**
   * Called when page changes.
   */
  onPageChange: (page: number) => void;
  /**
   * Called when search input changes.
   */
  onSearch: (query: string) => void;
  /**
   * Called when status filter changes.
   */
  onFilter: (status: StatusType | '') => void;
  /**
   * Called when sort changes.
   */
  onSort: (sort: SortState) => void;
  /**
   * Called when a user row is clicked.
   */
  onUserClick: (userId: string) => void;
  /**
   * Loading state.
   */
  loading?: boolean;
  /**
   * Search placeholder.
   * @default "Search users..."
   */
  searchPlaceholder?: string;
  /**
   * Filter label.
   * @default "All statuses"
   */
  filterAllLabel?: string;
  /**
   * Table caption for accessibility.
   * @default "Users"
   */
  caption?: string;
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * UserTable organism — admin user list with search, filters, and pagination.
 *
 * Composes DataTable + search Input + status Select filter +
 * StatusIndicator + RoleBadge. All user-supplied text rendered via JSX.
 */
export function UserTable({
  users,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  onSort,
  onUserClick,
  loading = false,
  searchPlaceholder = 'Search users...',
  filterAllLabel = 'All statuses',
  caption = 'Users',
  className,
}: UserTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [sortState, setSortState] = useState<SortState>({ columnId: '', direction: null });

  const columns: DataTableColumn<UserTableUser>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (row) => (
        <span className="font-medium truncate max-w-40 block" title={row.name}>
          {row.name}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: (row) => (
        <span className="truncate max-w-48 block text-muted-foreground" title={row.email}>
          {row.email}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => <StatusIndicator status={row.status} size="sm" />,
      sortable: true,
    },
    {
      id: 'roles',
      header: 'Roles',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <RoleBadge key={role} role={role} variant={role.toLowerCase() === 'admin' ? 'admin' : 'default'} />
          ))}
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: (row) => (
        <time dateTime={row.createdAt.toISOString()} className="text-muted-foreground">
          {row.createdAt.toLocaleDateString()}
        </time>
      ),
      sortable: true,
    },
  ];

  const handleSortChange = (sort: SortState) => {
    setSortState(sort);
    onSort(sort);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearch(e.target.value);
          }}
          aria-label={searchPlaceholder}
          className="rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 w-64 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-150"
        />
        <select
          aria-label="Filter by status"
          onChange={(e) => onFilter(e.target.value as StatusType | '')}
          className="rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 appearance-none pe-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-150"
        >
          <option value="">{filterAllLabel}</option>
          <option value="active">Active</option>
          <option value="pending_approval">Pending approval</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        caption={caption}
        page={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onPageChange={onPageChange}
        sortState={sortState}
        onSortChange={handleSortChange}
        rowActions={[
          {
            label: 'View',
            onClick: (row) => onUserClick(row.id),
          },
        ]}
      />
    </div>
  );
}
