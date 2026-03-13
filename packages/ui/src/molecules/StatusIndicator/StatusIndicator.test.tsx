import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusIndicator } from './StatusIndicator';

describe('StatusIndicator', () => {
  it('renders active status label', () => {
    render(<StatusIndicator status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders pending_approval status label', () => {
    render(<StatusIndicator status="pending_approval" />);
    expect(screen.getByText('Pending approval')).toBeInTheDocument();
  });

  it('renders deactivated status label', () => {
    render(<StatusIndicator status="deactivated" />);
    expect(screen.getByText('Deactivated')).toBeInTheDocument();
  });

  it('renders all status types', () => {
    const statuses = ['active', 'pending_approval', 'deactivated', 'pending', 'accepted', 'expired', 'revoked'] as const;
    statuses.forEach((status) => {
      const { unmount } = render(<StatusIndicator status={status} />);
      expect(screen.getByText(/./)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies small size classes', () => {
    const { container } = render(<StatusIndicator status="active" size="sm" />);
    expect(container.firstChild).toHaveClass('text-xs');
  });

  it('applies medium size classes by default', () => {
    const { container } = render(<StatusIndicator status="active" />);
    expect(container.firstChild).toHaveClass('text-sm');
  });
});
