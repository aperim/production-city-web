import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sidebar, type SidebarSection, type SidebarProps } from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Collapsible sidebar navigation. URL scheme allowlist enforced. ReactNode labels. WCAG 2.2 AA.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5L1 7h2v7.5h4V11h2v3.5h4V7h2L8 1.5z" />
  </svg>
);

const sections: SidebarSection[] = [
  {
    id: 'main',
    heading: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/', icon: <HomeIcon />, active: true },
      { id: 'projects', label: 'Projects', href: '/projects', badge: '3' },
      {
        id: 'team',
        label: 'Team',
        href: '/team',
        children: [
          { id: 'members', label: 'Members', href: '/team/members' },
          { id: 'roles', label: 'Roles', href: '/team/roles' },
        ],
      },
    ],
  },
  {
    id: 'settings',
    heading: 'Settings',
    items: [
      { id: 'account', label: 'Account', href: '/settings/account' },
      { id: 'billing', label: 'Billing', href: '/settings/billing' },
    ],
  },
];

function Controlled(args: Partial<SidebarProps>) {
  const [state, setState] = useState<'expanded' | 'collapsed'>('expanded');
  return (
    <div className="flex h-screen">
      <Sidebar
        {...args}
        sections={sections}
        state={state}
        onStateChange={setState}
        showToggle
        footer={
          <div className="text-xs text-muted-foreground">v1.0.0</div>
        }
      />
      <main className="flex-1 p-6">
        <p className="text-sm text-muted-foreground">Main content area</p>
      </main>
    </div>
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const Collapsed: Story = {
  render: () => {
    const [state, setState] = useState<'expanded' | 'collapsed'>('collapsed');
    return (
      <div className="flex h-screen">
        <Sidebar sections={sections} state={state} onStateChange={setState} showToggle />
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">Main content area</p>
        </main>
      </div>
    );
  },
};
