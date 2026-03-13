import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { UserDetailPanel, type UserDetail } from './UserDetailPanel';

const mockUser: UserDetail = {
  id: '1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  status: 'active',
  roles: ['Admin'],
  createdAt: new Date('2026-01-15'),
  lastLoginAt: new Date('2026-03-12'),
};

describe('UserDetailPanel', () => {
  it('renders user name and email', () => {
    render(<UserDetailPanel open onClose={() => {}} user={mockUser} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders status indicator', () => {
    render(<UserDetailPanel open onClose={() => {}} user={mockUser} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders role badges', () => {
    render(<UserDetailPanel open onClose={() => {}} user={mockUser} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(<UserDetailPanel open onClose={() => {}} user={mockUser} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument();
  });

  it('renders audit log entries when activity tab is active', async () => {
    const auditLog = [
      { action: 'logged in', actorName: 'Jane', timestamp: new Date('2026-03-12T14:30:00Z') },
    ];
    render(<UserDetailPanel open onClose={() => {}} user={mockUser} auditLog={auditLog} />);
    // Switch to activity tab
    await userEvent.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByText('logged in')).toBeInTheDocument();
  });

  it('shows no user message when user is null', () => {
    render(<UserDetailPanel open onClose={() => {}} user={null} />);
    expect(screen.getByText('No user selected.')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(<UserDetailPanel open={false} onClose={() => {}} user={mockUser} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});
