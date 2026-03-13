import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

beforeEach(() => {
  // Clean up portals between tests
  document.body.textContent = '';
});

function Wrapper({
  open = true,
  onClose = vi.fn(),
  ...props
}: Partial<Parameters<typeof Modal>[0]>) {
  return (
    <Modal open={open} onClose={onClose} title="Test Dialog" {...props}>
      <button>Inner Button</button>
    </Modal>
  );
}

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Wrapper open={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders dialog when open', () => {
    render(<Wrapper />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(<Wrapper />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('shows title and aria-labelledby', () => {
    render(<Wrapper title="My Modal" />);
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('shows description when provided', () => {
    render(<Wrapper description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(<Wrapper onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key', async () => {
    const onClose = vi.fn();
    render(<Wrapper onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose on Escape when closeOnEscape=false', async () => {
    const onClose = vi.fn();
    render(<Wrapper onClose={onClose} closeOnEscape={false} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders footer when provided', () => {
    render(<Wrapper footer={<button>Confirm</button>} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('does not render close button when showClose=false', () => {
    render(<Wrapper showClose={false} />);
    expect(screen.queryByRole('button', { name: /close dialog/i })).toBeNull();
  });

  it('renders title as text content (no HTML injection)', () => {
    const titleText = 'Safe Title Text';
    render(<Wrapper title={titleText} />);
    expect(screen.getByText(titleText)).toBeInTheDocument();
  });

  it('applies size class for sm', () => {
    render(<Wrapper size="sm" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-sm');
  });

  it('applies size class for lg', () => {
    render(<Wrapper size="lg" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-lg');
  });
});
