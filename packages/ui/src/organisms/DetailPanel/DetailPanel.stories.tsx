import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailPanel } from './DetailPanel';

const meta: Meta<typeof DetailPanel> = {
  title: 'Organisms/DetailPanel',
  component: DetailPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '500px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DetailPanel>;

export const Open: Story = {
  args: {
    open: true,
    title: 'Production Detail',
    children: (
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Status</div>
          <div className="text-sm">In Production</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Director</div>
          <div className="text-sm">Jane Smith</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Budget</div>
          <div className="text-sm">$2,400,000</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Notes</div>
          <div className="text-sm">Principal photography wrapping next week. Post-production scheduled to begin March 25.</div>
        </div>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    title: 'Hidden Panel',
    children: <div>You should not see this</div>,
  },
};

export const WithForm: Story = {
  args: {
    open: true,
    title: 'Edit Production',
    children: (
      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Title</span>
          <input type="text" defaultValue="Midnight Run" className="rounded-sm border bg-transparent px-2 py-1.5 text-sm" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Description</span>
          <textarea rows={3} className="rounded-sm border bg-transparent px-2 py-1.5 text-sm" defaultValue="A noir thriller set in Melbourne." />
        </label>
        <button type="button" className="rounded-sm bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Save
        </button>
      </form>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-sm border px-3 py-1.5 text-sm"
        >
          Open Panel
        </button>
        <DetailPanel open={open} onClose={() => setOpen(false)} title="Interactive Panel">
          <div className="text-sm">Click outside or press Escape to close.</div>
        </DetailPanel>
      </div>
    );
  },
};
