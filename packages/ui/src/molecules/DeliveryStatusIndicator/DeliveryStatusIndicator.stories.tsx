import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeliveryStatusIndicator } from './DeliveryStatusIndicator';

const meta = {
  title: 'Molecules/DeliveryStatusIndicator',
  component: DeliveryStatusIndicator,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['sending', 'sent', 'delivered', 'bounced', 'failed'],
    },
  },
} satisfies Meta<typeof DeliveryStatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sending: Story = { args: { status: 'sending' } };
export const Sent: Story = { args: { status: 'sent' } };
export const Delivered: Story = { args: { status: 'delivered' } };
export const Bounced: Story = { args: { status: 'bounced' } };
export const Failed: Story = { args: { status: 'failed' } };

export const FallbackTimeout: Story = {
  args: { status: 'sending', fallbackTimeout: 3000 },
  parameters: {
    docs: {
      description: {
        story: 'After 3 seconds, auto-transitions to "Delivered — check your email" state.',
      },
    },
  },
};

export const AllStates: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <DeliveryStatusIndicator status="sending" />
      <DeliveryStatusIndicator status="sent" />
      <DeliveryStatusIndicator status="delivered" />
      <DeliveryStatusIndicator status="bounced" />
      <DeliveryStatusIndicator status="failed" />
    </div>
  ),
};
