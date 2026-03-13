import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalCard } from './ApprovalCard';

describe('ApprovalCard', () => {
  const defaultProps = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Editor',
    onApprove: vi.fn(),
    onReject: vi.fn(),
  };

  it('renders user name and email', () => {
    render(<ApprovalCard {...defaultProps} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders role badge', () => {
    render(<ApprovalCard {...defaultProps} />);
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('renders avatar initial from name', () => {
    render(<ApprovalCard {...defaultProps} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('uses custom avatar initial', () => {
    render(<ApprovalCard {...defaultProps} avatarInitial="JS" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders approve and reject buttons', () => {
    render(<ApprovalCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
  });

  it('calls onApprove when approve clicked', async () => {
    const handleApprove = vi.fn();
    const user = userEvent.setup();
    render(<ApprovalCard {...defaultProps} onApprove={handleApprove} />);
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(handleApprove).toHaveBeenCalledOnce();
  });

  it('calls onReject when reject clicked', async () => {
    const handleReject = vi.fn();
    const user = userEvent.setup();
    render(<ApprovalCard {...defaultProps} onReject={handleReject} />);
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(handleReject).toHaveBeenCalledOnce();
  });

  it('shows approved state after approving', async () => {
    const user = userEvent.setup();
    render(<ApprovalCard {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });

  it('shows rejected state after rejecting', async () => {
    const user = userEvent.setup();
    render(<ApprovalCard {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('truncates long names', () => {
    render(<ApprovalCard {...defaultProps} name="Very Long Name" />);
    const el = screen.getByText('Very Long Name');
    expect(el).toHaveClass('truncate');
    expect(el).toHaveAttribute('title', 'Very Long Name');
  });
});
