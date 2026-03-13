import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MagicCodeForm } from './MagicCodeForm';

describe('MagicCodeForm', () => {
  it('renders heading and description', () => {
    render(<MagicCodeForm onSubmit={async () => {}} />);
    expect(screen.getByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText('Enter the verification code we sent to your email.')).toBeInTheDocument();
  });

  it('renders code inputs', () => {
    render(<MagicCodeForm onSubmit={async () => {}} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('calls onSubmit when code is completed', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MagicCodeForm onSubmit={handleSubmit} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]!);
    await user.paste('123456');

    expect(handleSubmit).toHaveBeenCalledWith('123456');
  });

  it('shows error message', () => {
    render(<MagicCodeForm onSubmit={async () => {}} error="Invalid code" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid code');
  });

  it('shows locked message when locked', () => {
    render(<MagicCodeForm onSubmit={async () => {}} locked />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too many failed attempts');
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('shows resend button', () => {
    const handleResend = vi.fn();
    render(<MagicCodeForm onSubmit={async () => {}} onResend={handleResend} />);
    expect(screen.getByText('Resend code')).toBeInTheDocument();
  });

  it('calls onResend when clicked', async () => {
    const handleResend = vi.fn();
    const user = userEvent.setup();
    render(<MagicCodeForm onSubmit={async () => {}} onResend={handleResend} />);
    await user.click(screen.getByText('Resend code'));
    expect(handleResend).toHaveBeenCalledOnce();
  });

  it('shows delivery status', () => {
    render(<MagicCodeForm onSubmit={async () => {}} deliveryStatus="delivered" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses custom labels', () => {
    render(
      <MagicCodeForm
        onSubmit={async () => {}}
        heading="Custom heading"
        description="Custom desc"
        resendLabel="Try again"
        onResend={() => {}}
      />,
    );
    expect(screen.getByText('Custom heading')).toBeInTheDocument();
    expect(screen.getByText('Custom desc')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});
