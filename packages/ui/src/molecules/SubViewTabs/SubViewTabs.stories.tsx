import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SubViewTabs, type SubViewTab } from './SubViewTabs';

const meta: Meta<typeof SubViewTabs> = {
  title: 'Molecules/SubViewTabs',
  component: SubViewTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof SubViewTabs>;

const allTabs: SubViewTab[] = [
  { id: 'users', label: 'Users' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'approvals', label: 'Approvals' },
];

function InteractiveWrapper({ tabs }: { tabs: SubViewTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  return (
    <div>
      <SubViewTabs tabs={tabs} activeTab={active} onTabChange={setActive} />
      <div className="p-4 text-sm text-muted-foreground">Active: {active}</div>
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveWrapper tabs={allTabs} />,
};

export const TwoTabs: Story = {
  render: () => (
    <InteractiveWrapper
      tabs={[
        { id: 'users', label: 'Users' },
        { id: 'invitations', label: 'Invitations' },
      ]}
    />
  ),
};

export const WithBadges: Story = {
  render: () => (
    <InteractiveWrapper
      tabs={[
        { id: 'users', label: 'Users', badge: '24' },
        { id: 'invitations', label: 'Invitations', badge: '3' },
        { id: 'approvals', label: 'Approvals', badge: '7' },
      ]}
    />
  ),
};

export const SingleTab: Story = {
  args: {
    tabs: [{ id: 'users', label: 'Users' }],
    activeTab: 'users',
    onTabChange: () => {},
  },
  name: 'Single Tab (hidden)',
};
