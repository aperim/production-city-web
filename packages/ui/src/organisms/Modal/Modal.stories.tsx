import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Organisms/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Modal dialog organism with focus trap, Escape/backdrop close, portal rendering, and WCAG 2.2 AA support.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

function Controlled(args: Partial<Parameters<typeof Modal>[0]>) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        onClick={() => setOpen(true)}
      >
        Open Modal
      </button>
      <Modal open={open} onClose={() => setOpen(false)} {...args}>
        {args.children ?? (
          <p className="text-sm text-muted-foreground">
            Modal body content. Press Escape or click the backdrop to close.
          </p>
        )}
      </Modal>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Controlled
      title="Default Modal"
      description="A standard modal dialog."
      footer={
        <>
          <button className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent">
            Cancel
          </button>
          <button className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90">
            Confirm
          </button>
        </>
      }
    />
  ),
};

export const Small: Story = {
  render: () => <Controlled title="Small Modal" size="sm" />,
};

export const Large: Story = {
  render: () => <Controlled title="Large Modal" size="lg" />,
};

export const ExtraLarge: Story = {
  render: () => <Controlled title="Extra Large Modal" size="xl" />,
};

export const FullScreen: Story = {
  render: () => <Controlled title="Full Screen Modal" size="full" />,
};

export const NoTitle: Story = {
  render: () => (
    <Controlled aria-label="Untitled dialog">
      <p className="text-sm text-muted-foreground">
        This modal has no title, so aria-label is used instead.
      </p>
    </Controlled>
  ),
};

export const ConfirmationDialog: Story = {
  render: () => (
    <Controlled
      title="Delete item?"
      description="This action cannot be undone."
      size="sm"
      footer={
        <>
          <button className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent">
            Cancel
          </button>
          <button className="rounded-sm bg-destructive text-destructive-foreground px-4 py-2 text-sm hover:bg-destructive/90">
            Delete
          </button>
        </>
      }
    />
  ),
};

export const NoBackdropClose: Story = {
  render: () => (
    <Controlled
      title="Required Action"
      description="You must complete this action before continuing."
      closeOnBackdrop={false}
    />
  ),
};
