import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from './Form';

describe('Form', () => {
  it('renders submit button', () => {
    render(<Form>Content</Form>);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('renders custom submit label', () => {
    render(<Form submitLabel="Save">Content</Form>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders reset button when showReset=true', () => {
    render(<Form showReset>Content</Form>);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('calls onSubmit when submitted', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    render(
      <Form onSubmit={onSubmit}>
        <input name="name" defaultValue="Alice" />
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('shows validation errors before submitting', async () => {
    const validate = vi.fn().mockResolvedValue({ name: 'Name is required' });
    render(
      <Form validate={validate}>
        <input name="name" />
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('does not call onSubmit when validation fails', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: true });
    const validate = vi.fn().mockResolvedValue({ name: 'Required' });
    render(<Form validate={validate} onSubmit={onSubmit}><input name="name" /></Form>);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(validate).toHaveBeenCalled());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows form-level error on failed submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ success: false, error: 'Server error' });
    render(<Form onSubmit={onSubmit}>Content</Form>);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('disables submit when submitting', async () => {
    let resolve: (v: { success: boolean }) => void;
    const promise = new Promise<{ success: boolean }>((r) => { resolve = r; });
    const onSubmit = vi.fn().mockReturnValue(promise);
    render(<Form onSubmit={onSubmit}>Content</Form>);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    resolve!({ success: true });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled());
  });

  it('resets form on reset button click', async () => {
    render(
      <Form showReset>
        <input name="name" defaultValue="Alice" />
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    // After reset, dirty state should be false (no error summary)
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders render function children with context', () => {
    render(
      <Form>
        {(ctx) => (
          <div data-testid="ctx-dirty">{String(ctx.isDirty)}</div>
        )}
      </Form>,
    );
    expect(screen.getByTestId('ctx-dirty').textContent).toBe('false');
  });

  it('renders aria-label on form', () => {
    render(<Form aria-label="User form">Content</Form>);
    expect(screen.getByRole('form', { name: 'User form' })).toBeInTheDocument();
  });

  it('renders two-column layout grid', () => {
    const { container } = render(<Form layout="two-column">Content</Form>);
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });
});
