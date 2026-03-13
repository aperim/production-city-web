import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InvitationTable, type InvitationTableInvitation } from './InvitationTable';

const mockInvitations: InvitationTableInvitation[] = [
  {
    id: '1',
    email: 'user@example.com',
    status: 'pending',
    role: 'Member',
    invitedBy: 'Admin',
    createdAt: new Date('2026-03-10'),
    expiresAt: new Date('2026-03-17'),
  },
  {
    id: '2',
    email: 'accepted@example.com',
    status: 'accepted',
    role: 'Editor',
    invitedBy: 'Jane',
    createdAt: new Date('2026-03-05'),
    expiresAt: new Date('2026-03-12'),
  },
];

describe('InvitationTable', () => {
  it('renders invitation rows', () => {
    render(<InvitationTable invitations={mockInvitations} />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('accepted@example.com')).toBeInTheDocument();
  });

  it('renders status indicators', () => {
    render(<InvitationTable invitations={mockInvitations} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('renders role badges', () => {
    render(<InvitationTable invitations={mockInvitations} />);
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<InvitationTable invitations={[]} />);
    expect(screen.getByText('No data to display.')).toBeInTheDocument();
  });

  it('renders action buttons when handlers provided', () => {
    render(
      <InvitationTable
        invitations={mockInvitations}
        onRevoke={vi.fn()}
        onResend={vi.fn()}
      />,
    );
    expect(screen.getByText('Resend')).toBeInTheDocument();
    expect(screen.getByText('Revoke')).toBeInTheDocument();
  });
});
