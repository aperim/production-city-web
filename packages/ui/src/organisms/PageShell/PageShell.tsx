'use client';

import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** PageShell layout variant */
export type PageShellLayout = 'sidebar-left' | 'sidebar-right' | 'no-sidebar';

/**
 * Props for the PageShell organism.
 */
export interface PageShellProps {
  /**
   * Header slot — typically NavigationHeader.
   */
  header?: ReactNode;
  /**
   * Sidebar slot — typically Sidebar.
   */
  sidebar?: ReactNode;
  /**
   * Main content area.
   */
  children: ReactNode;
  /**
   * Optional footer slot.
   */
  footer?: ReactNode;
  /**
   * Layout variant.
   * @default "sidebar-left"
   */
  layout?: PageShellLayout;
  /**
   * ID for the main content area (linked from skip-to-content).
   * @default "main-content"
   */
  mainId?: string;
  /**
   * Whether content area has default padding.
   * @default true
   */
  contentPadding?: boolean;
  /**
   * Whether the layout is in a loading/skeleton state.
   * @default false
   */
  loading?: boolean;
  /**
   * Additional class names for the root element.
   */
  className?: string;
}

function SkeletonShell() {
  return (
    <div className="flex flex-col h-full animate-pulse" aria-hidden="true">
      <div className="h-14 bg-muted border-b border-border" />
      <div className="flex flex-1">
        <div className="w-60 bg-muted border-r border-border" />
        <div className="flex-1 p-6">
          <div className="h-8 w-1/3 rounded-sm bg-muted mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-sm bg-muted" />
            <div className="h-4 w-5/6 rounded-sm bg-muted" />
            <div className="h-4 w-4/6 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PageShell organism.
 *
 * Composes NavigationHeader + Sidebar + main content + footer.
 * Supports sidebar-left, sidebar-right, and no-sidebar layouts.
 * main#main-content for skip link target. Responsive.
 * ReactNode only throughout.
 */
export function PageShell({
  header,
  sidebar,
  children,
  footer,
  layout = 'sidebar-left',
  mainId = 'main-content',
  contentPadding = true,
  loading = false,
  className,
}: PageShellProps) {
  if (loading) {
    return (
      <div className={cn('flex flex-col min-h-screen bg-background', className)}>
        <SkeletonShell />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col min-h-screen bg-background', className)}>
      {/* Header */}
      {header}

      {/* Body */}
      <div
        className={cn(
          'flex flex-1 min-h-0',
          layout === 'sidebar-right' && 'flex-row-reverse',
        )}
      >
        {/* Sidebar */}
        {sidebar && layout !== 'no-sidebar' && (
          <div className="shrink-0 h-full">{sidebar}</div>
        )}

        {/* Main content */}
        <main
          id={mainId}
          tabIndex={-1}
          className={cn(
            'flex-1 min-w-0 overflow-y-auto outline-none',
            contentPadding && 'p-6',
          )}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="border-t border-border bg-background">
          {footer}
        </footer>
      )}
    </div>
  );
}
