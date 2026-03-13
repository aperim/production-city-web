import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

afterEach(() => {
  vi.useRealTimers();
});

function ToastTrigger({
  variant = 'info',
  duration = 0,
  message = 'Hello toast',
}: {
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  message?: string;
}) {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast({ message, variant, duration })}>Add Toast</button>
  );
}

function Wrapper(props: Partial<Parameters<typeof ToastTrigger>[0]>) {
  return (
    <ToastProvider>
      <ToastTrigger {...props} />
    </ToastProvider>
  );
}

describe('Toast / ToastProvider', () => {
  it('renders no toasts initially', () => {
    render(<Wrapper />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('adds a toast when addToast is called', () => {
    render(<Wrapper message="Test message" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('error variant uses role="alert"', () => {
    render(<Wrapper variant="error" message="Error!" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('non-error variants use role="status"', () => {
    render(<Wrapper variant="success" message="Success!" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('auto-dismisses after duration (fake timers)', () => {
    vi.useFakeTimers();
    render(<Wrapper message="Auto dismiss" duration={3000} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.queryByText('Auto dismiss')).toBeNull();
  });

  it('does not auto-dismiss when duration=0 (fake timers)', () => {
    vi.useFakeTimers();
    render(<Wrapper message="Persist" duration={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText('Persist')).toBeInTheDocument();
  });

  it('manual dismiss removes toast', () => {
    render(<Wrapper message="Dismiss me" duration={0} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByText('Dismiss me')).toBeNull();
  });

  it('renders toast message as text content', () => {
    render(<Wrapper message="Safe text content" />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Safe text content')).toBeInTheDocument();
  });

  it('throws when useToast used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });
});
