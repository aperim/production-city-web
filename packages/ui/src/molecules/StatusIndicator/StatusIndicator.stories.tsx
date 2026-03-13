import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIndicator } from './StatusIndicator';

const meta = {
  title: 'Molecules/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'pending_approval', 'deactivated', 'pending', 'accepted', 'expired', 'revoked'],
    },
    size: { control: 'select', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { status: 'active' } };
export const PendingApproval: Story = { args: { status: 'pending_approval' } };
export const Deactivated: Story = { args: { status: 'deactivated' } };
export const Pending: Story = { args: { status: 'pending' } };
export const Accepted: Story = { args: { status: 'accepted' } };
export const Expired: Story = { args: { status: 'expired' } };
export const Revoked: Story = { args: { status: 'revoked' } };

export const SmallActive: Story = { args: { status: 'active', size: 'sm' } };
export const SmallPending: Story = { args: { status: 'pending', size: 'sm' } };

export const AllStatuses: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      <StatusIndicator status="active" />
      <StatusIndicator status="pending_approval" />
      <StatusIndicator status="deactivated" />
      <StatusIndicator status="pending" />
      <StatusIndicator status="accepted" />
      <StatusIndicator status="expired" />
      <StatusIndicator status="revoked" />
    </div>
  ),
};

export const AllStatusesSmall: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      <StatusIndicator status="active" size="sm" />
      <StatusIndicator status="pending_approval" size="sm" />
      <StatusIndicator status="deactivated" size="sm" />
      <StatusIndicator status="pending" size="sm" />
      <StatusIndicator status="accepted" size="sm" />
      <StatusIndicator status="expired" size="sm" />
      <StatusIndicator status="revoked" size="sm" />
    </div>
  ),
};
