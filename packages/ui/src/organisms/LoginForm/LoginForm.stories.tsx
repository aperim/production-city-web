import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginForm } from './LoginForm';

const meta = {
  title: 'Organisms/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onSubmit: async () => {} },
};

export const WithDeliveryStatus: Story = {
  args: {
    onSubmit: async () => {},
    deliveryStatus: 'sending',
  },
};

export const Delivered: Story = {
  args: {
    onSubmit: async () => {},
    deliveryStatus: 'delivered',
  },
};

export const WithError: Story = {
  args: {
    onSubmit: async () => {},
    error: 'Account not found. Please check your email address.',
  },
};

export const RateLimited: Story = {
  args: {
    onSubmit: async () => {},
    rateLimited: true,
  },
};

export const CustomLabels: Story = {
  args: {
    onSubmit: async () => {},
    emailLabel: 'Your email',
    submitLabel: 'Get started',
  },
};
