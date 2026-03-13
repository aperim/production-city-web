'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { sanitizeHref } from '../../atoms/Link/Link';

/** A single sidebar navigation item */
export interface SidebarItem {
  /** Item id (unique) */
  id: string;
  /** Item label as ReactNode only */
  label: ReactNode;
  /** Href validated against scheme allowlist */
  href?: string;
  /** Icon slot */
  icon?: ReactNode;
  /** Badge content */
  badge?: ReactNode;
  /** Whether this item is the active route */
  active?: boolean;
  /** On-click handler (if href not provided) */
  onClick?: () => void;
  /** Nested child items */
  children?: SidebarItem[];
}

/** A section within the sidebar */
export interface SidebarSection {
  /** Section id */
  id: string;
  /** Section heading label */
  heading?: ReactNode;
  /** Items in this section */
  items: SidebarItem[];
}

/**
 * Props for the Sidebar organism.
 */
export interface SidebarProps {
  /** Section definitions */
  sections?: SidebarSection[];
  /**
   * Sidebar state.
   * @default "expanded"
   */
  state?: 'expanded' | 'collapsed' | 'hidden';
  /** Called when collapse/expand button clicked */
  onStateChange?: (state: 'expanded' | 'collapsed') => void;
  /** Whether to show the collapse toggle button */
  showToggle?: boolean;
  /** Footer slot */
  footer?: ReactNode;
  /** Additional class names */
  className?: string;
  /**
   * Accessible label for the nav landmark.
   * @default "Sidebar navigation"
   */
  'aria-label'?: string;
}

function SidebarNavItem({
  item,
  collapsed,
  depth = 0,
}: {
  item: SidebarItem;
  collapsed: boolean;
  depth?: number;
}) {
  const [childOpen, setChildOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const content = (
    <>
      {item.icon && (
        <span
          className={cn('shrink-0 w-5 h-5 flex items-center justify-center', collapsed && 'mx-auto')}
          aria-hidden={!collapsed ? 'true' : undefined}
        >
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <span className="flex-1 min-w-0 truncate text-sm">{item.label}</span>
      )}
      {!collapsed && item.badge && (
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
          {item.badge}
        </span>
      )}
      {!collapsed && hasChildren && (
        <svg
          aria-hidden="true"
          className={cn('shrink-0 w-3 h-3 transition-transform duration-150', childOpen && 'rotate-90')}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M6 3l6 5-6 5V3z" />
        </svg>
      )}
    </>
  );

  const baseClass = cn(
    'flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring min-h-[44px]',
    depth > 0 && 'pl-7',
    item.active
      ? 'bg-accent text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
    collapsed && 'justify-center px-2',
  );

  const ariaLabel = collapsed && typeof item.label === 'string' ? item.label : undefined;

  if (hasChildren) {
    return (
      <li>
        <button
          type="button"
          className={baseClass}
          aria-expanded={childOpen}
          aria-label={ariaLabel}
          onClick={() => {
            setChildOpen((s) => !s);
            item.onClick?.();
          }}
        >
          {content}
        </button>
        {childOpen && !collapsed && (
          <ul role="list" className="mt-0.5 flex flex-col gap-0.5">
            {item.children!.map((child) => (
              <SidebarNavItem key={child.id} item={child} collapsed={collapsed} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  if (item.href) {
    return (
      <li>
        <a
          href={sanitizeHref(item.href)}
          aria-current={item.active ? 'page' : undefined}
          aria-label={ariaLabel}
          className={baseClass}
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={baseClass}
        aria-label={ariaLabel}
        onClick={item.onClick}
      >
        {content}
      </button>
    </li>
  );
}

/**
 * Sidebar organism.
 *
 * Collapsible: expanded (full) / collapsed (icon-only) / hidden.
 * Nested navigation with expand/collapse. Badge support.
 * All hrefs validated against scheme allowlist. Labels as ReactNode only.
 * WCAG 2.2 AA: nav landmark, aria-current, aria-expanded.
 */
export function Sidebar({
  sections = [],
  state = 'expanded',
  onStateChange,
  showToggle = true,
  footer,
  className,
  'aria-label': ariaLabel = 'Sidebar navigation',
}: SidebarProps) {
  const collapsed = state === 'collapsed';
  const hidden = state === 'hidden';

  if (hidden) return null;

  return (
    <aside
      aria-label={ariaLabel}
      className={cn(
        'flex flex-col border-r border-border bg-background transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
        className,
      )}
    >
      {/* Toggle button */}
      {showToggle && (
        <div className={cn('flex p-2', collapsed ? 'justify-center' : 'justify-end')}>
          <button
            type="button"
            onClick={() => onStateChange?.(collapsed ? 'expanded' : 'collapsed')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring transition-colors duration-150"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={cn('transition-transform duration-150', collapsed && 'rotate-180')}
            >
              <path d="M9 3l-6 5 6 5V3z" />
            </svg>
          </button>
        </div>
      )}

      {/* Nav sections */}
      <nav aria-label={ariaLabel} className="flex-1 overflow-y-auto px-2 py-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            {section.heading && !collapsed && (
              <div className="px-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {section.heading}
              </div>
            )}
            <ul role="list" className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <SidebarNavItem key={item.id} item={item} collapsed={collapsed} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="border-t border-border p-3">{footer}</div>
      )}
    </aside>
  );
}
