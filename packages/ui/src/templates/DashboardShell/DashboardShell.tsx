import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Props for the DashboardShell template */
export interface DashboardShellProps {
  /** Sidebar navigation slot */
  sidebar: ReactNode;
  /** Breadcrumb slot */
  breadcrumb?: ReactNode;
  /** Header actions slot (e.g., notifications, user menu) */
  header?: ReactNode;
  /** Main content */
  children: ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * DashboardShell template — top-level dashboard layout.
 *
 * Renders sidebar on the left, header bar on top, and scrollable content area.
 * Includes a skip navigation link for keyboard/screen reader users.
 * Responsive: sidebar managed externally (collapsed/overlay states via SidebarNav props).
 */
export function DashboardShell({
  sidebar,
  breadcrumb,
  header,
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-background focus:border focus:border-border focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline-2 focus:outline-ring"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      {sidebar}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 py-2 min-h-[48px]">
          <div className="flex-1 min-w-0">
            {breadcrumb}
          </div>
          {header && (
            <div className="shrink-0 ml-4">
              {header}
            </div>
          )}
        </header>

        {/* Content */}
        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
