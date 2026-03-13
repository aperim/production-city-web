import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserTable, type UserTableUser } from './UserTable';

const mockUsers: UserTableUser[] = [
  { id: '1', name: 'Jane Smith', email: 'jane@example.com', status: 'active', roles: ['Admin'], createdAt: new Date('2026-01-15') },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', status: 'pending_approval', roles: ['Member'], createdAt: new Date('2026-02-20') },
  { id: '3', name: 'Alice Chen', email: 'alice@example.com', status: 'active', roles: ['Editor', 'Member'], createdAt: new Date('2026-03-01') },
  { id: '4', name: 'Deactivated User', email: 'old@example.com', status: 'deactivated', roles: ['Member'], createdAt: new Date('2025-06-10') },
];

const meta = {
  title: 'Organisms/UserTable',
  component: UserTable,
  tags: ['autodocs'],
} satisfies Meta<typeof UserTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs = {
  pagination: { page: 1, totalPages: 3, pageSize: 10 },
  onPageChange: () => {},
  onSearch: () => {},
  onFilter: () => {},
  onSort: () => {},
  onUserClick: (id: string) => alert(`User clicked: ${id}`),
};

export const WithData: Story = {
  args: { ...defaultArgs, users: mockUsers },
};

export const Empty: Story = {
  args: { ...defaultArgs, users: [], pagination: { page: 1, totalPages: 0, pageSize: 10 } },
};

export const Loading: Story = {
  args: { ...defaultArgs, users: [], loading: true },
};

export const Filtered: Story = {
  args: {
    ...defaultArgs,
    users: mockUsers.filter((u) => u.status === 'active'),
    pagination: { page: 1, totalPages: 1, pageSize: 10 },
  },
};
