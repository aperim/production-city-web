import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MagicCodeInput } from './MagicCodeInput';

describe('MagicCodeInput', () => {
  it('renders the correct number of inputs', () => {
    render(<MagicCodeInput onComplete={() => {}} length={6} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('renders 4 inputs when length=4', () => {
    render(<MagicCodeInput onComplete={() => {}} length={4} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('auto-advances to next input on digit entry', async () => {
    const user = userEvent.setup();
    render(<MagicCodeInput onComplete={() => {}} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]!);
    await user.keyboard('1');

    expect(inputs[1]).toHaveFocus();
  });

  it('calls onComplete when all digits filled', async () => {
    const handleComplete = vi.fn();
    const user = userEvent.setup();
    render(<MagicCodeInput onComplete={handleComplete} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]!);
    await user.keyboard('123456');

    expect(handleComplete).toHaveBeenCalledWith('123456');
  });

  it('only accepts numeric input', async () => {
    const user = userEvent.setup();
    render(<MagicCodeInput onComplete={() => {}} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]!);
    await user.keyboard('a');

    expect(inputs[0]).toHaveValue('');
  });

  it('handles backspace to go to previous input', async () => {
    const user = userEvent.setup();
    render(<MagicCodeInput onComplete={() => {}} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]!);
    await user.keyboard('12');
    // Now focused on inputs[2], input[1] has "2"
    expect(inputs[2]).toHaveFocus();

    await user.keyboard('{Backspace}');
    // Should go back to inputs[1]
    expect(inputs[1]).toHaveFocus();
  });

  it('handles paste to fill all fields', async () => {
    const handleComplete = vi.fn();
    const user = userEvent.setup();
    render(<MagicCodeInput onComplete={handleComplete} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]!);
    await user.paste('654321');

    expect(inputs[0]).toHaveValue('6');
    expect(inputs[1]).toHaveValue('5');
    expect(inputs[2]).toHaveValue('4');
    expect(inputs[3]).toHaveValue('3');
    expect(inputs[4]).toHaveValue('2');
    expect(inputs[5]).toHaveValue('1');
    expect(handleComplete).toHaveBeenCalledWith('654321');
  });

  it('preserves leading zeros on paste', async () => {
    const handleComplete = vi.fn();
    const user = userEvent.setup();
    render(<MagicCodeInput onComplete={handleComplete} autoFocus={false} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]!);
    await user.paste('012345');

    expect(inputs[0]).toHaveValue('0');
    expect(inputs[1]).toHaveValue('1');
    expect(inputs[2]).toHaveValue('2');
    expect(inputs[3]).toHaveValue('3');
    expect(inputs[4]).toHaveValue('4');
    expect(inputs[5]).toHaveValue('5');
    expect(handleComplete).toHaveBeenCalledWith('012345');
  });

  it('shows error message when error prop is provided', () => {
    render(<MagicCodeInput onComplete={() => {}} error="Invalid code" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid code');
  });

  it('sets aria-invalid when error is present', () => {
    render(<MagicCodeInput onComplete={() => {}} error="Invalid code" />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables all inputs when disabled', () => {
    render(<MagicCodeInput onComplete={() => {}} disabled />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('has proper aria labels for each digit', () => {
    render(<MagicCodeInput onComplete={() => {}} length={6} />);
    expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 6 of 6')).toBeInTheDocument();
  });
});
