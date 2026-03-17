import type { Meta, StoryObj } from '@storybook/react-vite';
import { AttentionDot } from './AttentionDot';

const meta: Meta<typeof AttentionDot> = {
  title: 'Atoms/AttentionDot',
  component: AttentionDot,
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['urgent', 'action', 'info'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AttentionDot>;

export const Urgent: Story = { args: { priority: 'urgent' } };
export const Action: Story = { args: { priority: 'action' } };
export const Info: Story = { args: { priority: 'info' } };

export const AllPriorities: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-2"><AttentionDot priority="urgent" /> Urgent</span>
      <span className="flex items-center gap-2"><AttentionDot priority="action" /> Action</span>
      <span className="flex items-center gap-2"><AttentionDot priority="info" /> Info</span>
    </div>
  ),
};
