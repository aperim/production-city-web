import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvitationForm } from './InvitationForm';

const meta = {
  title: 'Organisms/InvitationForm',
  component: InvitationForm,
  tags: ['autodocs'],
} satisfies Meta<typeof InvitationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const roles = ['Admin', 'Editor', 'Member', 'Viewer'];

export const Default: Story = {
  args: {
    roles,
    onSubmit: async (data) => alert(JSON.stringify(data)),
  },
};

export const WithValidationErrors: Story = {
  args: {
    roles,
    onSubmit: async () => {},
    fieldErrors: {
      email: 'Please enter a valid email address.',
      role: 'Please select a role.',
    },
  },
};

export const WithFormError: Story = {
  args: {
    roles,
    onSubmit: async () => {},
    error: 'This email address has already been invited.',
  },
};

export const CustomLabels: Story = {
  args: {
    roles,
    onSubmit: async () => {},
    labels: {
      email: 'Recipient email',
      role: 'Assign role',
      message: 'Welcome message',
      submit: 'Invite user',
    },
  },
};
