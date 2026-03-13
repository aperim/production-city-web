import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdminDashboardTemplate } from './AdminDashboardTemplate';
import { UserTable, type UserTableUser } from '../../organisms/UserTable/UserTable';
import { InvitationTable, type InvitationTableInvitation } from '../../organisms/InvitationTable/InvitationTable';
import type { SidebarSection } from '../../organisms/Sidebar/Sidebar';

const sidebarSections: SidebarSection[] = [
  {
    id: 'main',
    heading: 'Admin',
    items: [
      { id: 'users', label: 'Users', active: true },
      { id: 'invitations', label: 'Invitations' },
      { id: 'roles', label: 'Roles' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

const mockUsers: UserTableUser[] = [
  { id: '1', name: 'Jane Smith', email: 'jane@example.com', status: 'active', roles: ['Admin'], createdAt: new Date('2026-01-15') },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', status: 'pending_approval', roles: ['Member'], createdAt: new Date('2026-02-20') },
];

const mockInvitations: InvitationTableInvitation[] = [
  { id: '1', email: 'new@example.com', status: 'pending', role: 'Member', invitedBy: 'Admin', createdAt: new Date('2026-03-10'), expiresAt: new Date('2026-03-17') },
];

const meta = {
  title: 'Templates/AdminDashboardTemplate',
  component: AdminDashboardTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AdminDashboardTemplate>;

export default meta;

const Logo = () => (
  <span className="text-sm font-medium text-foreground">Production City</span>
);

export const WithUserTable: StoryObj = {
  render: () => (
    <AdminDashboardTemplate
      logo={<Logo />}
      sidebarSections={sidebarSections}
      breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]}
    >
      <UserTable
        users={mockUsers}
        pagination={{ page: 1, totalPages: 1, pageSize: 10 }}
        onPageChange={() => {}}
        onSearch={() => {}}
        onFilter={() => {}}
        onSort={() => {}}
        onUserClick={() => {}}
      />
    </AdminDashboardTemplate>
  ),
};

export const WithInvitationTable: StoryObj = {
  render: () => (
    <AdminDashboardTemplate
      logo={<Logo />}
      sidebarSections={sidebarSections}
      breadcrumbs={[{ label: 'Admin' }, { label: 'Invitations' }]}
    >
      <InvitationTable invitations={mockInvitations} />
    </AdminDashboardTemplate>
  ),
};

export const Loading: StoryObj = {
  render: () => (
    <AdminDashboardTemplate
      logo={<Logo />}
      sidebarSections={sidebarSections}
      loading
    >
      <div />
    </AdminDashboardTemplate>
  ),
};
