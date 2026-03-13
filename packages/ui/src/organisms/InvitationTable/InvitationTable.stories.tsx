import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvitationTable, type InvitationTableInvitation } from './InvitationTable';

const mockInvitations: InvitationTableInvitation[] = [
  {
    id: '1',
    email: 'new-user@example.com',
    status: 'pending',
    role: 'Member',
    invitedBy: 'Troy Admin',
    createdAt: new Date('2026-03-10'),
    expiresAt: new Date('2026-03-17'),
  },
  {
    id: '2',
    email: 'accepted@example.com',
    status: 'accepted',
    role: 'Editor',
    invitedBy: 'Jane Smith',
    createdAt: new Date('2026-03-05'),
    expiresAt: new Date('2026-03-12'),
  },
  {
    id: '3',
    email: 'expired@example.com',
    status: 'expired',
    role: 'Member',
    invitedBy: 'Troy Admin',
    createdAt: new Date('2026-02-01'),
    expiresAt: new Date('2026-02-08'),
  },
  {
    id: '4',
    email: 'revoked@example.com',
    status: 'revoked',
    role: 'Admin',
    invitedBy: 'Troy Admin',
    createdAt: new Date('2026-03-01'),
    expiresAt: new Date('2026-03-08'),
  },
];

const meta = {
  title: 'Organisms/InvitationTable',
  component: InvitationTable,
  tags: ['autodocs'],
} satisfies Meta<typeof InvitationTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithData: Story = {
  args: {
    invitations: mockInvitations,
    onRevoke: (id) => alert(`Revoke: ${id}`),
    onResend: (id) => alert(`Resend: ${id}`),
  },
};

export const Empty: Story = {
  args: { invitations: [] },
};

export const Loading: Story = {
  args: { invitations: [], loading: true },
};
