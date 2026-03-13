import type { Meta, StoryObj } from '@storybook/react-vite';
import { MagicCodeForm } from './MagicCodeForm';

const meta = {
  title: 'Organisms/MagicCodeForm',
  component: MagicCodeForm,
  tags: ['autodocs'],
} satisfies Meta<typeof MagicCodeForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async (code) => alert(`Submitted: ${code}`),
    onResend: () => alert('Resend clicked'),
    deliveryStatus: 'delivered',
  },
};

export const Sending: Story = {
  args: {
    onSubmit: async () => {},
    deliveryStatus: 'sending',
  },
};

export const WithError: Story = {
  args: {
    onSubmit: async () => {},
    error: 'Invalid code. Please try again.',
    deliveryStatus: 'delivered',
    onResend: () => {},
  },
};

export const Locked: Story = {
  args: {
    onSubmit: async () => {},
    locked: true,
  },
};

export const CustomLabels: Story = {
  args: {
    onSubmit: async () => {},
    heading: 'Verify your identity',
    description: 'We sent a code to your phone.',
    resendLabel: 'Send again',
    onResend: () => {},
  },
};
