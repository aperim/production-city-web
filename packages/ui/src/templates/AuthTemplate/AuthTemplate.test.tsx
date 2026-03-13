import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthTemplate } from './AuthTemplate';

describe('AuthTemplate', () => {
  it('renders children', () => {
    render(<AuthTemplate><p>Login content</p></AuthTemplate>);
    expect(screen.getByText('Login content')).toBeInTheDocument();
  });

  it('renders logo when provided', () => {
    render(
      <AuthTemplate logo={<span>Logo</span>}>
        <p>Content</p>
      </AuthTemplate>,
    );
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('renders without logo', () => {
    const { container } = render(
      <AuthTemplate><p>Content</p></AuthTemplate>,
    );
    expect(container.querySelector('.justify-center')).toBeInTheDocument();
  });
});
