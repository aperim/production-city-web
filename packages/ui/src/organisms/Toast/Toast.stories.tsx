import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastProvider, useToast, type ToastPosition } from './Toast';

const meta: Meta = {
  title: 'Organisms/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Toast notification system with context-based queue management, auto-dismiss, and WCAG live regions.',
      },
    },
  },
};

export default meta;

function ToastDemo({ position: _position }: { position?: ToastPosition }) {
  const { addToast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-accent"
        onClick={() => addToast({ message: 'Information message', variant: 'info', duration: 4000 })}
      >
        Info
      </button>
      <button
        className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-accent"
        onClick={() => addToast({ message: 'Action completed successfully', variant: 'success', duration: 4000 })}
      >
        Success
      </button>
      <button
        className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-accent"
        onClick={() => addToast({ message: 'Please review before continuing', variant: 'warning', duration: 4000 })}
      >
        Warning
      </button>
      <button
        className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-accent"
        onClick={() => addToast({ message: 'An error occurred. Please try again.', variant: 'error', duration: 6000 })}
      >
        Error
      </button>
      <button
        className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-accent"
        onClick={() =>
          addToast({
            message: 'File deleted.',
            variant: 'info',
            duration: 6000,
            actionLabel: 'Undo',
            onAction: () => {},
          })
        }
      >
        With Action
      </button>
      <button
        className="rounded-sm border border-border px-3 py-2 text-sm hover:bg-accent"
        onClick={() => addToast({ message: 'Persistent toast (no auto-dismiss)', variant: 'info', duration: 0 })}
      >
        Persistent
      </button>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <ToastProvider position="bottom-right">
      <ToastDemo />
    </ToastProvider>
  ),
};

export const TopRight: StoryObj = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo position="top-right" />
    </ToastProvider>
  ),
};

export const TopCenter: StoryObj = {
  render: () => (
    <ToastProvider position="top-center">
      <ToastDemo position="top-center" />
    </ToastProvider>
  ),
};

export const BottomCenter: StoryObj = {
  render: () => (
    <ToastProvider position="bottom-center">
      <ToastDemo position="bottom-center" />
    </ToastProvider>
  ),
};
