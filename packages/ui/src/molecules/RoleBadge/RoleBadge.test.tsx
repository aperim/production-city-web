import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge', () => {
  it('renders role name', () => {
    render(<RoleBadge role="Admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders remove button when removable', () => {
    render(<RoleBadge role="Editor" removable onRemove={() => {}} />);
    expect(screen.getByRole('button', { name: 'Remove Editor' })).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', async () => {
    const handleRemove = vi.fn();
    render(<RoleBadge role="Editor" removable onRemove={handleRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Editor' }));
    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it('does not render remove button without removable', () => {
    render(<RoleBadge role="Admin" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('truncates long role names', () => {
    render(<RoleBadge role="Very Long Role Name" />);
    const text = screen.getByText('Very Long Role Name');
    expect(text).toHaveClass('truncate');
    expect(text).toHaveAttribute('title', 'Very Long Role Name');
  });
});
