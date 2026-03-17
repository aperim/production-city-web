import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsersCanvas, type UsersCanvasProps } from './UsersCanvas';
import type { UserTableUser } from '../UserTable/UserTable';
import type { InvitationTableInvitation } from '../InvitationTable/InvitationTable';

const mockUsers: UserTableUser[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', status: 'active', roles: ['admin'], createdAt: new Date('2026-01-01') },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', status: 'active', roles: ['editor'], createdAt: new Date('2026-01-15') },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', status: 'pending_approval', roles: ['viewer'], createdAt: new Date('2026-02-01') },
  { id: '4', name: 'Dave Brown', email: 'dave@example.com', status: 'deactivated', roles: ['viewer'], createdAt: new Date('2025-11-01') },
];

const mockInvitations: InvitationTableInvitation[] = [
  { id: 'inv-1', email: 'eve@example.com', status: 'pending', role: 'editor', invitedBy: 'Alice', createdAt: new Date('2026-03-01'), expiresAt: new Date('2026-03-15') },
  { id: 'inv-2', email: 'frank@example.com', status: 'expired', role: 'viewer', invitedBy: 'Bob', createdAt: new Date('2026-02-01'), expiresAt: new Date('2026-02-15') },
];

const mockApprovals = [
  { id: 'appr-1', name: 'Grace Lee', email: 'grace@example.com', role: 'editor' },
  { id: 'appr-2', name: 'Henry Park', email: 'henry@example.com', role: 'viewer' },
];

const baseProps: UsersCanvasProps = {
  users: mockUsers,
  usersPagination: { page: 1, totalPages: 1, pageSize: 25 },
  onUsersPageChange: () => {},
  onUsersSearch: () => {},
  onUsersFilter: () => {},
  onUsersSort: () => {},
  onUserClick: () => {},
  invitations: mockInvitations,
  onInvitationResend: () => {},
  onInvitationRevoke: () => {},
  approvals: mockApprovals,
  onApprove: () => {},
  onReject: () => {},
  permissions: { userRead: true, invitationRead: true, userUpdate: true },
};

const meta: Meta<typeof UsersCanvas> = {
  title: 'Organisms/UsersCanvas',
  component: UsersCanvas,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ height: '600px' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof UsersCanvas>;

function InteractiveWrapper(props: UsersCanvasProps) {
  const [_view, setView] = useState<string | undefined>(undefined);
  return <UsersCanvas {...props} onViewChange={setView} />;
}

export const Default: Story = {
  render: () => <InteractiveWrapper {...baseProps} />,
};

export const UsersOnly: Story = {
  args: {
    ...baseProps,
    permissions: { userRead: true, invitationRead: false, userUpdate: false },
  },
};

export const InvitationsOnly: Story = {
  args: {
    ...baseProps,
    permissions: { userRead: false, invitationRead: true, userUpdate: false },
  },
};

export const ApprovalsOnly: Story = {
  args: {
    ...baseProps,
    permissions: { userRead: false, invitationRead: false, userUpdate: true },
  },
};

export const NoPermissions: Story = {
  args: {
    ...baseProps,
    permissions: { userRead: false, invitationRead: false, userUpdate: false },
  },
  name: 'Access Denied',
};

export const Loading: Story = {
  args: { ...baseProps, loading: true },
};

export const Error: Story = {
  args: { ...baseProps, error: 'Failed to load user data' },
};

export const EmptyUsers: Story = {
  args: { ...baseProps, users: [] },
  name: 'Empty Users List',
};

export const EmptyApprovals: Story = {
  args: {
    ...baseProps,
    approvals: [],
    permissions: { userRead: false, invitationRead: false, userUpdate: true },
  },
  name: 'Empty Approvals',
};

export const InvitationsDefault: Story = {
  args: {
    ...baseProps,
    permissions: { userRead: false, invitationRead: true, userUpdate: true },
    initialView: 'invitations',
  },
  name: 'Default to Invitations',
};
