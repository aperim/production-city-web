import type { Meta, StoryObj } from '@storybook/react-vite';
import { SecurityCanvas, type SecurityCanvasProps, type AuditLogEntryData } from './SecurityCanvas';

const mockEntries: AuditLogEntryData[] = [
  { id: '1', action: 'Logged in', actorName: 'Alice Johnson', timestamp: new Date('2026-03-15T10:30:00Z'), ipAddress: '192.168.1.100' },
  { id: '2', action: 'Changed role', actorName: 'Bob Smith', subjectName: 'Carol Williams', details: 'Changed from viewer to editor', timestamp: new Date('2026-03-15T09:15:00Z') },
  { id: '3', action: 'Deleted user', actorName: 'Alice Johnson', subjectName: 'Dave Brown', details: 'Removed for inactivity', timestamp: new Date('2026-03-14T16:00:00Z'), ipAddress: '10.0.0.1' },
  { id: '4', action: 'Updated settings', actorName: 'Bob Smith', details: 'Changed notification preferences', timestamp: new Date('2026-03-14T14:00:00Z') },
  { id: '5', action: 'Logged in', actorName: 'Carol Williams', timestamp: new Date('2026-03-14T08:00:00Z'), ipAddress: '203.0.113.42' },
];

const baseProps: SecurityCanvasProps = {
  entries: mockEntries,
  hasPermission: true,
  hasMore: true,
  onLoadMore: () => {},
  onFilterChange: () => {},
};

const meta: Meta<typeof SecurityCanvas> = {
  title: 'Organisms/SecurityCanvas',
  component: SecurityCanvas,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ height: '600px' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof SecurityCanvas>;

export const Default: Story = {
  args: baseProps,
};

export const Empty: Story = {
  args: { ...baseProps, entries: [], hasMore: false },
  name: 'No Entries',
};

export const NoMoreEntries: Story = {
  args: { ...baseProps, hasMore: false },
  name: 'All Loaded',
};

export const Loading: Story = {
  args: { ...baseProps, loading: true },
};

export const Error: Story = {
  args: { ...baseProps, error: 'Failed to load audit log' },
};

export const AccessDenied: Story = {
  args: { ...baseProps, hasPermission: false },
  name: 'Access Denied',
};

export const Filtered: Story = {
  args: {
    ...baseProps,
    entries: mockEntries.filter((e) => e.action === 'Logged in'),
  },
  name: 'Filtered (login only)',
};
