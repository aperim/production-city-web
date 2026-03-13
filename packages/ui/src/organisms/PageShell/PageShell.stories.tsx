import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PageShell } from './PageShell';
import { NavigationHeader } from '../NavigationHeader/NavigationHeader';
import { Sidebar, type SidebarSection } from '../Sidebar/Sidebar';

const meta: Meta<typeof PageShell> = {
  title: 'Organisms/PageShell',
  component: PageShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'PageShell composes NavigationHeader + Sidebar + main + footer into a full layout.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageShell>;

const navItems = [
  { label: 'Dashboard', href: '/', active: true },
  { label: 'Projects', href: '/projects' },
];

const sidebarSections: SidebarSection[] = [
  {
    id: 'main',
    heading: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/', active: true },
      { id: 'projects', label: 'Projects', href: '/projects' },
      { id: 'team', label: 'Team', href: '/team' },
    ],
  },
];

function ControlledShell() {
  const [sidebarState, setSidebarState] = useState<'expanded' | 'collapsed'>('expanded');
  return (
    <PageShell
      header={
        <NavigationHeader
          logo={<span className="font-semibold text-sm">Production City</span>}
          navItems={navItems}
        />
      }
      sidebar={
        <Sidebar
          sections={sidebarSections}
          state={sidebarState}
          onStateChange={setSidebarState}
          showToggle
        />
      }
      footer={
        <div className="px-6 py-3 text-xs text-muted-foreground">
          Production City &copy; 2026
        </div>
      }
    >
      <div className="max-w-2xl">
        <p className="text-sm text-muted-foreground">Main content goes here.</p>
      </div>
    </PageShell>
  );
}

export const Default: Story = {
  render: () => <ControlledShell />,
};

export const NoSidebar: Story = {
  render: () => (
    <PageShell
      header={
        <NavigationHeader
          logo={<span className="font-semibold text-sm">Production City</span>}
          navItems={navItems}
        />
      }
      layout="no-sidebar"
    >
      <p className="text-sm text-muted-foreground">No sidebar layout.</p>
    </PageShell>
  ),
};

export const SidebarRight: Story = {
  render: () => (
    <PageShell
      header={
        <NavigationHeader
          logo={<span className="font-semibold text-sm">Production City</span>}
          navItems={navItems}
        />
      }
      sidebar={<Sidebar sections={sidebarSections} showToggle />}
      layout="sidebar-right"
    >
      <p className="text-sm text-muted-foreground">Sidebar right layout.</p>
    </PageShell>
  ),
};

export const Loading: Story = {
  render: () => <PageShell loading={true}>Content</PageShell>,
};
