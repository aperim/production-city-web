import type { Meta, StoryObj } from '@storybook/react-vite';
import { AIPanel } from './AIPanel';

const meta: Meta<typeof AIPanel> = {
  title: 'Organisms/AIPanel',
  component: AIPanel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex justify-end">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof AIPanel>;

export const Closed: Story = {
  args: {
    open: false,
  },
};

export const OpenEmpty: Story = {
  args: {
    open: true,
  },
};

export const WithMessages: Story = {
  args: {
    open: true,
    messages: [
      { id: '1', role: 'user', content: 'What productions are currently in shooting?', timestamp: new Date(Date.now() - 60000).toISOString() },
      { id: '2', role: 'assistant', content: 'There are 3 productions currently in the shooting phase: Project Alpha, Project Beta, and Project Gamma. Would you like details on any of these?', timestamp: new Date(Date.now() - 30000).toISOString() },
      { id: '3', role: 'user', content: 'Tell me about Project Alpha', timestamp: new Date().toISOString() },
    ],
  },
};

export const Loading: Story = {
  args: {
    open: true,
    loading: true,
    messages: [
      { id: '1', role: 'user', content: 'Generate a report', timestamp: new Date().toISOString() },
    ],
  },
};
