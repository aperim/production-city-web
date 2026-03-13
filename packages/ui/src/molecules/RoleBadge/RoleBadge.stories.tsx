import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoleBadge } from './RoleBadge';

const meta = {
  title: 'Molecules/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'admin', 'system'] },
  },
} satisfies Meta<typeof RoleBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { role: 'Member' } };
export const Admin: Story = { args: { role: 'Administrator', variant: 'admin' } };
export const System: Story = { args: { role: 'System', variant: 'system' } };

export const Removable: Story = {
  args: {
    role: 'Editor',
    removable: true,
    onRemove: () => alert('Remove clicked'),
  },
};

export const LongRoleName: Story = {
  args: { role: 'Super Long Role Name That Should Truncate' },
};

export const RoleGroup: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <RoleBadge role="Admin" variant="admin" />
      <RoleBadge role="Editor" />
      <RoleBadge role="Viewer" />
      <RoleBadge role="System" variant="system" />
    </div>
  ),
};
