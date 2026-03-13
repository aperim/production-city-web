import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationHeader } from './NavigationHeader';

const meta: Meta<typeof NavigationHeader> = {
  title: 'Organisms/NavigationHeader',
  component: NavigationHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive navigation header. URL scheme allowlist enforced. ReactNode only. WCAG 2.2 AA.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavigationHeader>;

const navItems = [
  { label: 'Dashboard', href: '/', active: true },
  { label: 'Projects', href: '/projects' },
  { label: 'Team', href: '/team' },
  { label: 'Settings', href: '/settings' },
];

export const Default: Story = {
  args: {
    logo: <span className="font-semibold text-sm">Production City</span>,
    navItems,
    actions: (
      <button className="rounded-sm bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:bg-primary/90">
        Sign In
      </button>
    ),
  },
};

export const NoLogo: Story = {
  args: { navItems },
};

export const Transparent: Story = {
  args: {
    logo: <span className="font-semibold text-sm">Production City</span>,
    navItems,
    variant: 'transparent',
  },
  parameters: { backgrounds: { default: 'dark' } },
};

export const Sticky: Story = {
  args: {
    logo: <span className="font-semibold text-sm">Production City</span>,
    navItems,
    sticky: true,
  },
};

export const WithExternalLink: Story = {
  args: {
    navItems: [
      ...navItems,
      { label: 'Docs', href: 'https://docs.example.com', external: true },
    ],
  },
};
