import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserDetailPanel, type UserDetail } from './UserDetailPanel';
import type { AuditLogEntryProps } from '../../molecules/AuditLogEntry/AuditLogEntry';

const activeUser: UserDetail = {
  id: '1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  status: 'active',
  roles: ['Admin', 'Editor'],
  createdAt: new Date('2026-01-15'),
  lastLoginAt: new Date('2026-03-12'),
};

const pendingUser: UserDetail = {
  id: '2',
  name: 'Bob Jones',
  email: 'bob@example.com',
  status: 'pending_approval',
  roles: ['Member'],
  createdAt: new Date('2026-03-10'),
};

const deactivatedUser: UserDetail = {
  id: '3',
  name: 'Old User',
  email: 'old@example.com',
  status: 'deactivated',
  roles: ['Member'],
  createdAt: new Date('2025-06-10'),
  lastLoginAt: new Date('2025-12-01'),
};

const auditLog: AuditLogEntryProps[] = [
  { action: 'logged in', actorName: 'Jane Smith', timestamp: new Date('2026-03-12T14:30:00Z'), ipAddress: '192.168.1.42' },
  { action: 'changed role', actorName: 'Admin', subjectName: 'Jane Smith', details: 'Added Editor role', timestamp: new Date('2026-03-10T10:00:00Z') },
];

const meta = {
  title: 'Organisms/UserDetailPanel',
  component: UserDetailPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof UserDetailPanel>;

export default meta;

export const ActiveUser: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true);
    return <UserDetailPanel open={open} onClose={() => setOpen(false)} user={activeUser} auditLog={auditLog} />;
  },
};

export const PendingUser: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true);
    return <UserDetailPanel open={open} onClose={() => setOpen(false)} user={pendingUser} />;
  },
};

export const DeactivatedUser: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true);
    return <UserDetailPanel open={open} onClose={() => setOpen(false)} user={deactivatedUser} auditLog={auditLog} />;
  },
};
