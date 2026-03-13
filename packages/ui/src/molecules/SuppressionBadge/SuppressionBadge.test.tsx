import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SuppressionBadge } from './SuppressionBadge';

describe('SuppressionBadge', () => {
  it('renders hard bounce label', () => {
    render(<SuppressionBadge reason="hard_bounce" />);
    expect(screen.getByText('Hard bounce')).toBeInTheDocument();
  });

  it('renders spam complaint label', () => {
    render(<SuppressionBadge reason="spam_complaint" />);
    expect(screen.getByText('Spam complaint')).toBeInTheDocument();
  });

  it('renders remove button when removable', () => {
    render(<SuppressionBadge reason="hard_bounce" removable onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: /Remove.*suppression/ })).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', async () => {
    const handleRemove = vi.fn();
    render(<SuppressionBadge reason="hard_bounce" removable onRemove={handleRemove} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it('does not show remove button without removable prop', () => {
    render(<SuppressionBadge reason="hard_bounce" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
