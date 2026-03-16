import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SidebarGroup } from './SidebarGroup';
import type { SidebarItemProps } from '../../atoms/SidebarItem/SidebarItem';

const items: SidebarItemProps[] = [
  { id: 'directory', label: 'Team Directory', path: '/dashboard/company/hr/directory' },
  { id: 'org-chart', label: 'Organisation Chart', path: '/dashboard/company/hr/org-chart', status: 'coming_soon' },
  { id: 'recruitment', label: 'Recruitment Pipeline', path: '/dashboard/company/hr/recruitment', status: 'planned' },
];

const meta: Meta<typeof SidebarGroup> = {
  title: 'Molecules/SidebarGroup',
  component: SidebarGroup,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-56 bg-background border border-border rounded-sm p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SidebarGroup>;

function InteractiveGroup(props: Partial<React.ComponentProps<typeof SidebarGroup>>) {
  const [expanded, setExpanded] = useState(true);
  return (
    <SidebarGroup
      label="Human Resources"
      items={items}
      isExpanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      {...props}
    />
  );
}

export const Expanded: Story = {
  render: () => <InteractiveGroup />,
};

export const Collapsed: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(false);
    return (
      <SidebarGroup
        label="Human Resources"
        items={items}
        isExpanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
    );
  },
};

export const WithActiveChild: Story = {
  render: () => {
    const activeItems: SidebarItemProps[] = items.map((item) =>
      item.id === 'directory' ? { ...item, isActive: true } : item,
    );
    return (
      <SidebarGroup
        label="Human Resources"
        items={activeItems}
        isExpanded
        onToggle={() => {}}
      />
    );
  },
};

export const CollapsedSidebar: Story = {
  render: () => (
    <SidebarGroup
      label="Human Resources"
      items={items}
      isExpanded
      collapsed
      onToggle={() => {}}
    />
  ),
  decorators: [
    (Story) => (
      <div className="w-14 bg-background border border-border rounded-sm p-2">
        <Story />
      </div>
    ),
  ],
};
