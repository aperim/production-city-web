import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InvitationForm } from './InvitationForm';

const roles = ['Admin', 'Editor', 'Member'];

describe('InvitationForm', () => {
  it('renders email, role, and message fields', () => {
    render(<InvitationForm roles={roles} onSubmit={async () => {}} />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Message (optional)')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<InvitationForm roles={roles} onSubmit={async () => {}} />);
    expect(screen.getByRole('button', { name: 'Send invitation' })).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<InvitationForm roles={roles} onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('Email address'), 'test@example.com');
    await user.selectOptions(screen.getByLabelText('Role'), 'Editor');
    await user.type(screen.getByLabelText('Message (optional)'), 'Welcome!');
    await user.click(screen.getByRole('button', { name: 'Send invitation' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      role: 'Editor',
      message: 'Welcome!',
    });
  });

  it('shows field validation errors', () => {
    render(
      <InvitationForm
        roles={roles}
        onSubmit={async () => {}}
        fieldErrors={{ email: 'Invalid email', role: 'Required' }}
      />,
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows form-level error', () => {
    render(
      <InvitationForm roles={roles} onSubmit={async () => {}} error="Already invited" />,
    );
    expect(screen.getByText('Already invited')).toBeInTheDocument();
  });

  it('renders role options', () => {
    render(<InvitationForm roles={roles} onSubmit={async () => {}} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });
});
