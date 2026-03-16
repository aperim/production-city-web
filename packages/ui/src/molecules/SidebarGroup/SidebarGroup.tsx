'use client';

import { useId } from 'react';
import { cn } from '../../lib/utils';
import { SidebarItem, type SidebarItemProps } from '../../atoms/SidebarItem/SidebarItem';

/** Props for the SidebarGroup molecule */
export interface SidebarGroupProps {
  /** Group label displayed as heading */
  label: string;
  /** Items within this group */
  items: SidebarItemProps[];
  /** Whether the group is expanded */
  isExpanded: boolean;
  /** Called when the group toggle is clicked */
  onToggle: () => void;
  /** Whether sidebar is collapsed (icon-only) */
  collapsed?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * SidebarGroup molecule — collapsible group of sidebar items with a heading.
 *
 * Uses ARIA disclosure pattern: toggle button with aria-expanded and aria-controls.
 * Items rendered as a list. Empty groups should not be rendered (handled by parent).
 */
export function SidebarGroup({
  label,
  items,
  isExpanded,
  onToggle,
  collapsed = false,
  className,
}: SidebarGroupProps) {
  const contentId = useId();

  if (items.length === 0) return null;

  if (collapsed) {
    return (
      <div className={cn('flex flex-col gap-0.5', className)}>
        {items.map((item) => (
          <SidebarItem key={item.id} {...item} collapsed />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('mb-3', className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className={cn(
          'flex items-center gap-1 w-full px-2 py-1 text-xs font-medium text-muted-foreground',
          'hover:text-foreground transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm',
        )}
      >
        <svg
          aria-hidden="true"
          className={cn('shrink-0 w-3 h-3 transition-transform duration-150', isExpanded && 'rotate-90')}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M6 3l6 5-6 5V3z" />
        </svg>
        <span className="uppercase tracking-wide truncate">{label}</span>
      </button>
      {isExpanded && (
        <ul id={contentId} role="list" className="mt-1 flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <SidebarItem {...item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
