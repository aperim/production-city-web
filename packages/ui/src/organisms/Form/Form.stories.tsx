import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form } from './Form';
import { FormField } from '../../molecules/FormField/FormField';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';

const meta: Meta<typeof Form> = {
  title: 'Organisms/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Form organism with validation, dirty tracking, error summary, and accessible live regions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <Form
      aria-label="Contact form"
      onSubmit={async (_fd, values) => {
        await new Promise((r) => setTimeout(r, 1000));
        console.log('Submitted:', values);
        return { success: true };
      }}
    >
      <FormField label="Name" required>
        <Input name="name" placeholder="Your name" />
      </FormField>
      <FormField label="Email" required>
        <Input name="email" type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Message">
        <Textarea name="message" placeholder="Your message" />
      </FormField>
    </Form>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <Form
      aria-label="Login form"
      validate={(values) => {
        const errors: Record<string, string | undefined> = {};
        if (!String(values.email ?? '').includes('@')) {
          errors.email = 'Please enter a valid email address';
        }
        if (!values.password || String(values.password).length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        return errors;
      }}
      onSubmit={async () => ({ success: true })}
      showReset
    >
      <FormField label="Email" required>
        <Input name="email" type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Password" required>
        <Input name="password" type="password" placeholder="••••••" />
      </FormField>
    </Form>
  ),
};

export const TwoColumn: Story = {
  render: () => (
    <Form aria-label="Profile form" layout="two-column" onSubmit={async () => ({ success: true })}>
      <FormField label="First name" required>
        <Input name="firstName" placeholder="Alice" />
      </FormField>
      <FormField label="Last name" required>
        <Input name="lastName" placeholder="Smith" />
      </FormField>
      <FormField label="Email" required>
        <Input name="email" type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Phone">
        <Input name="phone" placeholder="+1 555 000 0000" />
      </FormField>
    </Form>
  ),
};

export const SubmissionError: Story = {
  render: () => (
    <Form
      aria-label="Error demo"
      onSubmit={async () => ({
        success: false,
        error: 'Network error. Please check your connection and try again.',
      })}
    >
      <FormField label="Name">
        <Input name="name" defaultValue="Alice" />
      </FormField>
    </Form>
  ),
};
