import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthTemplate } from './AuthTemplate';
import { LoginForm } from '../../organisms/LoginForm/LoginForm';
import { MagicCodeForm } from '../../organisms/MagicCodeForm/MagicCodeForm';

const meta = {
  title: 'Templates/AuthTemplate',
  component: AuthTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const Logo = () => (
  <span className="text-lg font-medium text-foreground">Production City</span>
);

export const WithLoginForm: Story = {
  args: {
    logo: <Logo />,
    children: <LoginForm onSubmit={async () => {}} />,
  },
};

export const WithMagicCodeForm: Story = {
  args: {
    logo: <Logo />,
    children: (
      <MagicCodeForm
        onSubmit={async () => {}}
        deliveryStatus="delivered"
        onResend={() => {}}
      />
    ),
  },
};

export const NoLogo: Story = {
  args: {
    children: <LoginForm onSubmit={async () => {}} />,
  },
};
