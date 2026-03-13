import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders email input and submit button', () => {
    render(<LoginForm onSubmit={async () => {}} />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument();
  });

  it('calls onSubmit with email on form submission', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Send magic link' }));

    expect(handleSubmit).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error message', () => {
    render(<LoginForm onSubmit={async () => {}} error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('shows rate limit message', () => {
    render(<LoginForm onSubmit={async () => {}} rateLimited />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too many attempts');
  });

  it('disables button when rate limited', () => {
    render(<LoginForm onSubmit={async () => {}} rateLimited />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows delivery status indicator', () => {
    render(<LoginForm onSubmit={async () => {}} deliveryStatus="delivered" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses custom labels', () => {
    render(<LoginForm onSubmit={async () => {}} emailLabel="Your email" submitLabel="Go" />);
    expect(screen.getByLabelText('Your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});
