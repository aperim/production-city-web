import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsersCanvas } from './UsersCanvas';
import type { UserTableUser } from '../UserTable/UserTable';
import type { InvitationTableInvitation } from '../InvitationTable/InvitationTable';

const mockUsers: UserTableUser[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', status: 'active', roles: ['admin'], createdAt: new Date('2026-01-01') },
  { id: '2', name: 'Bob', email: 'bob@test.com', status: 'pending_approval', roles: ['viewer'], createdAt: new Date('2026-02-01') },
];

const mockInvitations: InvitationTableInvitation[] = [
  { id: 'inv-1', email: 'carol@test.com', status: 'pending', role: 'editor', invitedBy: 'Alice', createdAt: new Date('2026-03-01'), expiresAt: new Date('2026-03-15') },
];

const mockApprovals = [
  { name: 'Dave', email: 'dave@test.com', role: 'viewer' },
];

describe('UsersCanvas', () => {
  const defaultProps = {
    users: mockUsers,
    usersPagination: { page: 1, totalPages: 1, pageSize: 25 },
    onUsersPageChange: vi.fn(),
    onUsersSearch: vi.fn(),
    onUsersFilter: vi.fn(),
    onUsersSort: vi.fn(),
    onUserClick: vi.fn(),
    invitations: mockInvitations,
    onInvitationResend: vi.fn(),
    onInvitationRevoke: vi.fn(),
    approvals: mockApprovals,
    onApprove: vi.fn(),
    onReject: vi.fn(),
    permissions: { userRead: true, invitationRead: true, userUpdate: true },
  };

  it('renders Users sub-view by default when user has user:read', () => {
    render(<UsersCanvas {...defaultProps} />);
    expect(screen.getByText('Alice')).toBeDefined();
  });

  it('renders SubViewTabs when multiple permissions are available', () => {
    render(<UsersCanvas {...defaultProps} />);
    expect(screen.getByRole('tablist')).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Users' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Invitations' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Approvals' })).toBeDefined();
  });

  it('switches to Invitations tab when clicked', () => {
    render(<UsersCanvas {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Invitations' }));
    expect(screen.getByText('carol@test.com')).toBeDefined();
  });

  it('switches to Approvals tab when clicked', () => {
    render(<UsersCanvas {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Approvals' }));
    expect(screen.getByText('Dave')).toBeDefined();
  });

  it('defaults to invitations tab when user lacks user:read but has invitation:read', () => {
    render(
      <UsersCanvas
        {...defaultProps}
        permissions={{ userRead: false, invitationRead: true, userUpdate: false }}
      />,
    );
    expect(screen.getByText('carol@test.com')).toBeDefined();
  });

  it('defaults to approvals tab when user only has user:update', () => {
    render(
      <UsersCanvas
        {...defaultProps}
        permissions={{ userRead: false, invitationRead: false, userUpdate: true }}
      />,
    );
    expect(screen.getByText('Dave')).toBeDefined();
  });

  it('hides tabs for unauthorized sub-views', () => {
    render(
      <UsersCanvas
        {...defaultProps}
        permissions={{ userRead: true, invitationRead: false, userUpdate: false }}
      />,
    );
    // With only one permission, SubViewTabs should be hidden (single tab)
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('renders access-denied when no permissions', () => {
    render(
      <UsersCanvas
        {...defaultProps}
        permissions={{ userRead: false, invitationRead: false, userUpdate: false }}
      />,
    );
    expect(screen.getByText(/no access/i)).toBeDefined();
  });

  it('renders loading state', () => {
    render(<UsersCanvas {...defaultProps} loading />);
    // Loading indicator should be present
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('renders error state', () => {
    render(<UsersCanvas {...defaultProps} error="Failed to load users" />);
    expect(screen.getByText('Failed to load users')).toBeDefined();
  });

  it('renders empty users state', () => {
    render(<UsersCanvas {...defaultProps} users={[]} />);
    expect(screen.getByText(/no users/i)).toBeDefined();
  });

  it('respects initialView prop', () => {
    render(<UsersCanvas {...defaultProps} initialView="invitations" />);
    expect(screen.getByText('carol@test.com')).toBeDefined();
  });

  it('calls onViewChange when tab switches', () => {
    const onViewChange = vi.fn();
    render(<UsersCanvas {...defaultProps} onViewChange={onViewChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Invitations' }));
    expect(onViewChange).toHaveBeenCalledWith('invitations');
  });
});
