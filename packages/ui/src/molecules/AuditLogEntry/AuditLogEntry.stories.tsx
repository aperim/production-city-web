import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuditLogEntry } from './AuditLogEntry';

const meta = {
  title: 'Molecules/AuditLogEntry',
  component: AuditLogEntry,
  tags: ['autodocs'],
} satisfies Meta<typeof AuditLogEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoginEvent: Story = {
  args: {
    action: 'logged in',
    actorName: 'Jane Smith',
    timestamp: new Date('2026-03-12T14:30:00Z'),
    ipAddress: '192.168.1.42',
  },
};

export const RoleChange: Story = {
  args: {
    action: 'changed role of',
    actorName: 'Troy Admin',
    subjectName: 'Jane Smith',
    details: 'Role changed from Member to Administrator',
    timestamp: new Date('2026-03-12T10:15:00Z'),
    ipAddress: '10.0.0.1',
  },
};

export const SystemEvent: Story = {
  args: {
    action: 'Password reset link expired',
    timestamp: new Date('2026-03-11T08:00:00Z'),
  },
};

export const WithLongText: Story = {
  args: {
    action: 'updated permissions for',
    actorName: 'A Very Long Actor Name That Should Truncate Properly',
    subjectName: 'Another Very Long Subject Name For Testing',
    details: 'This is a very detailed description of what happened in this audit log entry that should be truncated',
    timestamp: new Date('2026-03-12T16:45:00Z'),
    ipAddress: '2001:db8::1',
  },
};

export const AuditLogList: StoryObj = {
  render: () => (
    <div className="divide-y divide-border">
      <AuditLogEntry
        action="logged in"
        actorName="Jane Smith"
        timestamp={new Date('2026-03-12T14:30:00Z')}
        ipAddress="192.168.1.42"
      />
      <AuditLogEntry
        action="changed role of"
        actorName="Troy Admin"
        subjectName="Jane Smith"
        details="Role changed from Member to Administrator"
        timestamp={new Date('2026-03-12T10:15:00Z')}
      />
      <AuditLogEntry
        action="Account auto-locked after 5 failed attempts"
        timestamp={new Date('2026-03-11T08:00:00Z')}
      />
    </div>
  ),
};
