"use client";

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface WorkspaceShellProps {
  /** Sidebar navigation slot */
  sidebar: ReactNode;
  /** Tab bar slot */
  tabs?: ReactNode;
  /** Scope/filter bar slot */
  scopeBar?: ReactNode;
  /** AI panel slot */
  aiPanel?: ReactNode;
  /** Main canvas content */
  children: ReactNode;
  /** Whether sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * WorkspaceShell template — combines sidebar, tabs, scope bar,
 * canvas area, and AI panel into the workspace layout.
 *
 * Responsive: sidebar collapses on mobile, AI panel slides over.
 */
export function WorkspaceShell({
  sidebar,
  tabs,
  scopeBar,
  aiPanel,
  children,
  sidebarCollapsed: _sidebarCollapsed,
  className,
}: WorkspaceShellProps) {
  return (
    <div className={cn('flex h-screen overflow-hidden bg-background', className)}>
      {/* Skip to main content */}
      <a
        href="#workspace-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-background focus:border focus:border-border focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:outline-2 focus:outline-ring"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      {sidebar}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        {tabs}

        {/* Scope bar */}
        {scopeBar}

        {/* Content + AI Panel */}
        <div className="flex-1 flex min-h-0">
          {/* Canvas */}
          <main
            id="workspace-content"
            className="flex-1 overflow-y-auto"
            tabIndex={-1}
          >
            {children}
          </main>

          {/* AI Panel */}
          {aiPanel}
        </div>
      </div>
    </div>
  );
}
