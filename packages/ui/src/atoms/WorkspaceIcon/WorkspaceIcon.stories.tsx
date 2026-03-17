import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceIcon, WORKSPACE_ICONS } from './WorkspaceIcon';

const meta: Meta<typeof WorkspaceIcon> = {
  title: 'Atoms/WorkspaceIcon',
  component: WorkspaceIcon,
  argTypes: {
    icon: { control: 'select', options: Object.keys(WORKSPACE_ICONS) },
    size: { control: { type: 'range', min: 12, max: 48 } },
  },
};
export default meta;
type Story = StoryObj<typeof WorkspaceIcon>;

export const Default: Story = { args: { icon: 'film' } };
export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {Object.keys(WORKSPACE_ICONS).map((icon) => (
        <div key={icon} className="flex flex-col items-center gap-1">
          <WorkspaceIcon icon={icon} size={24} />
          <span className="text-xs text-muted-foreground">{icon}</span>
        </div>
      ))}
    </div>
  ),
};
export const Large: Story = { args: { icon: 'building', size: 48 } };
export const Small: Story = { args: { icon: 'chart-bar', size: 14 } };
export const Decorative: Story = { args: { icon: 'settings', decorative: true } };
