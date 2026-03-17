"use client";

import { cn } from '../../lib/utils';
import { WorkspaceIcon } from '../../atoms/WorkspaceIcon/WorkspaceIcon';
import { BadgeCount } from '../../atoms/BadgeCount/BadgeCount';
import { RecentItem, type RecentItemProps } from '../../molecules/RecentItem/RecentItem';

export interface WorkspaceSidebarItem {
  /** Workspace slug (used as key and in navigation) */
  id: string;
  /** Display label */
  label: string;
  /** Icon name from WorkspaceIcon */
  icon: string;
  /** Navigation path */
  path: string;
}

export interface WorkspaceSidebarProps {
  /** List of workspace items to display */
  workspaces: WorkspaceSidebarItem[];
  /** Currently active workspace ID */
  activeWorkspace?: string;
  /** Inbox unread count */
  inboxCount?: number;
  /** Recent items (max 5) */
  recents?: Omit<RecentItemProps, 'onClick'>[];
  /** Whether the sidebar is collapsed to icon rail */
  collapsed?: boolean;
  /** Toggle collapse handler */
  onToggleCollapse?: () => void;
  /** Navigation handler for workspace items */
  onNavigate?: (path: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * WorkspaceSidebar organism — role-adaptive sidebar with workspace list,
 * inbox badge, recents, and collapse state.
 *
 * Desktop: 240px wide. Collapsed: 56px icon rail. Mobile: overlay.
 */
export function WorkspaceSidebar({
  workspaces,
  activeWorkspace,
  inboxCount = 0,
  recents = [],
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  className,
}: WorkspaceSidebarProps) {
  const handleNav = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <nav
      role="navigation"
      aria-label="Workspace navigation"
      className={cn(
        'flex flex-col h-full border-r border-border bg-background transition-[width] duration-150',
        collapsed ? 'w-14' : 'w-60',
        className,
      )}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-between px-3 py-2 min-h-[48px]">
        {!collapsed && (
          <span className="text-sm font-medium text-foreground truncate">Workspaces</span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-sm',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-colors duration-150',
            collapsed && 'mx-auto',
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {collapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {/* Home */}
      <button
        type="button"
        onClick={() => handleNav('/dashboard')}
        aria-label="Home"
        className={cn(
          'flex items-center gap-3 px-3 py-2 min-h-[44px] text-sm',
          'hover:bg-accent/50 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed && 'justify-center px-0',
        )}
      >
        <WorkspaceIcon icon="home" size={18} decorative />
        {!collapsed && <span className="text-foreground">Home</span>}
      </button>

      {/* Inbox */}
      <button
        type="button"
        onClick={() => handleNav('/dashboard/inbox')}
        aria-label={collapsed ? `Inbox${inboxCount > 0 ? ` (${inboxCount} unread)` : ''}` : undefined}
        className={cn(
          'relative flex items-center gap-3 px-3 py-2 min-h-[44px] text-sm',
          'hover:bg-accent/50 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          collapsed && 'justify-center px-0',
        )}
      >
        <WorkspaceIcon icon="inbox" size={18} decorative />
        {!collapsed && (
          <>
            <span className="text-foreground flex-1">Inbox</span>
            <BadgeCount count={inboxCount} />
          </>
        )}
        {collapsed && inboxCount > 0 && (
          <BadgeCount count={inboxCount} className="absolute top-0 right-0 scale-75" />
        )}
      </button>

      {/* Divider */}
      <div className="mx-3 my-1.5 border-t border-border" />

      {/* Recents */}
      {!collapsed && recents.length > 0 && (
        <div className="px-1">
          <span className="px-2 py-1 text-[11px] font-medium text-muted-foreground/70">
            Recents
          </span>
          {recents.slice(0, 5).map((item) => (
            <RecentItem
              key={item.path}
              {...item}
              onClick={handleNav}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      {!collapsed && recents.length > 0 && (
        <div className="mx-3 my-1.5 border-t border-border" />
      )}

      {/* Workspace list */}
      <div className="flex-1 overflow-y-auto px-1">
        {!collapsed && (
          <span className="px-2 py-1 text-[11px] font-medium text-muted-foreground/70">
            Workspaces
          </span>
        )}
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            type="button"
            onClick={() => handleNav(ws.path)}
            className={cn(
              'flex items-center gap-3 w-full px-2 py-2 min-h-[44px] text-sm rounded-sm',
              'hover:bg-accent/50 transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeWorkspace === ws.id && 'bg-accent text-foreground',
              activeWorkspace !== ws.id && 'text-muted-foreground',
              collapsed && 'justify-center px-0',
            )}
            title={collapsed ? ws.label : undefined}
            aria-label={collapsed ? ws.label : undefined}
          >
            <WorkspaceIcon icon={ws.icon} size={18} decorative />
            {!collapsed && <span className="truncate">{ws.label}</span>}
          </button>
        ))}
      </div>

      {/* Bottom section */}
      <div className="mt-auto border-t border-border">
        <button
          type="button"
          onClick={() => handleNav('/dashboard/profile')}
          aria-label="Profile"
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 min-h-[44px] text-sm',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'justify-center px-0',
          )}
        >
          <WorkspaceIcon icon="user" size={18} decorative />
          {!collapsed && <span>Profile</span>}
        </button>
        <button
          type="button"
          onClick={() => handleNav('/dashboard/help')}
          aria-label="Help"
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 min-h-[44px] text-sm',
            'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed && 'justify-center px-0',
          )}
        >
          <WorkspaceIcon icon="help-circle" size={18} decorative />
          {!collapsed && <span>Help</span>}
        </button>
      </div>
    </nav>
  );
}
