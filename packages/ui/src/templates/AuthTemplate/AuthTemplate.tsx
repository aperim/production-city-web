import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Props for the AuthTemplate */
export interface AuthTemplateProps {
  /**
   * Brand logo slot.
   */
  logo?: ReactNode;
  /**
   * Content to render inside the centered card.
   */
  children: ReactNode;
  /**
   * Additional class names for the root.
   */
  className?: string;
}

/**
 * AuthTemplate — centered card layout for login/verification pages.
 *
 * Renders a brand logo above a card centered on the page.
 * Follows Uncodixify: no gradients, no hero sections, no decorative elements.
 */
export function AuthTemplate({
  logo,
  children,
  className,
}: AuthTemplateProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-background px-4 py-8',
        className,
      )}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        {logo && (
          <div className="flex justify-center">
            {logo}
          </div>
        )}
        <div className="rounded-sm border border-border bg-card p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
