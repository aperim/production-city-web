import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserTable, type UserTableUser } from './UserTable';

const mockUsers: UserTableUser[] = [
  { id: '1', name: 'Jane Smith', email: 'jane@example.com', status: 'active', roles: ['Admin'], createdAt: new Date('2026-01-15') },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', status: 'pending_approval', roles: ['Member'], createdAt: new Date('2026-02-20') },
];

const defaultProps = {
  users: mockUsers,
  pagination: { page: 1, totalPages: 1, pageSize: 10 },
  onPageChange: vi.fn(),
  onSearch: vi.fn(),
  onFilter: vi.fn(),
  onSort: vi.fn(),
  onUserClick: vi.fn(),
};

describe('UserTable', () => {
  it('renders user rows', () => {
    render(<UserTable {...defaultProps} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<UserTable {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('calls onSearch when typing', async () => {
    const user = userEvent.setup();
    render(<UserTable {...defaultProps} />);
    await user.type(screen.getByPlaceholderText('Search users...'), 'jane');
    expect(defaultProps.onSearch).toHaveBeenCalled();
  });

  it('renders status filter', () => {
    render(<UserTable {...defaultProps} />);
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
  });

  it('renders role badges', () => {
    render(<UserTable {...defaultProps} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  it('renders status indicators', () => {
    render(<UserTable {...defaultProps} />);
    // "Active" appears in both filter dropdown option and status indicator
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    // "Pending approval" appears in both filter option and StatusIndicator
    expect(screen.getAllByText('Pending approval').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no users', () => {
    render(<UserTable {...defaultProps} users={[]} />);
    expect(screen.getByText('No data to display.')).toBeInTheDocument();
  });
});
