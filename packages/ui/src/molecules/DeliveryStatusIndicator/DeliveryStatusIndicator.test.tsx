import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeliveryStatusIndicator } from './DeliveryStatusIndicator';

describe('DeliveryStatusIndicator', () => {
  it('renders sending state', () => {
    render(<DeliveryStatusIndicator status="sending" />);
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  it('renders sent state', () => {
    render(<DeliveryStatusIndicator status="sent" />);
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('renders delivered state', () => {
    render(<DeliveryStatusIndicator status="delivered" />);
    expect(screen.getByText('Delivered — check your email')).toBeInTheDocument();
  });

  it('renders bounced state', () => {
    render(<DeliveryStatusIndicator status="bounced" />);
    expect(screen.getByText('Delivery failed — check email address')).toBeInTheDocument();
  });

  it('renders failed state', () => {
    render(<DeliveryStatusIndicator status="failed" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="status" for live region', () => {
    render(<DeliveryStatusIndicator status="sending" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('auto-transitions to delivered after fallbackTimeout', () => {
    vi.useFakeTimers();
    render(<DeliveryStatusIndicator status="sending" fallbackTimeout={5000} />);
    expect(screen.getByText('Sending...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Delivered — check your email')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not auto-transition for non-pending statuses', () => {
    vi.useFakeTimers();
    render(<DeliveryStatusIndicator status="bounced" fallbackTimeout={1000} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Delivery failed — check email address')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
