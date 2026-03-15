'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { sanitizeHref } from '../../atoms/Link/Link';

/** A single navigation link item */
export interface NavItem {
  /** Link label as ReactNode only */
  label: ReactNode;
  /** Href validated against scheme allowlist (http/https/mailto/tel/relative) */
  href: string;
  /** Whether this item is the currently active route */
  active?: boolean;
  /** Whether this link opens in a new tab */
  external?: boolean;
}

/**
 * Props for the NavigationHeader organism.
 */
export interface NavigationHeaderProps {
  /** Logo/brand slot */
  logo?: ReactNode;
  /** Primary navigation items */
  navItems?: NavItem[];
  /** Right-side slot (user menu, search trigger, CTA, etc.) */
  actions?: ReactNode;
  /**
   * Whether the header is sticky.
   * @default false
   */
  sticky?: boolean;
  /**
   * Visual variant.
   * @default "default"
   */
  variant?: 'default' | 'transparent';
  /**
   * Skip-to-content target id.
   * @default "main-content"
   */
  skipToContentId?: string;
  /**
   * Skip-to-content link label (i18n).
   * @default "Skip to main content"
   */
  skipToContentLabel?: string;
  /** Additional class names */
  className?: string;
  /**
   * Accessible label for the navigation landmark.
   * @default "Main navigation"
   */
  'aria-label'?: string;
}

/**
 * NavigationHeader organism.
 *
 * URL scheme allowlist: all hrefs pass through sanitizeHref() from the Link atom.
 * Labels are ReactNode only — no HTML injection.
 * Skip-to-content link. WCAG 2.2 AA: nav landmark, aria-current="page".
 */
export function NavigationHeader({
  logo,
  navItems = [],
  actions,
  sticky = false,
  variant = 'default',
  skipToContentId = 'main-content',
  skipToContentLabel = 'Skip to main content',
  className,
  'aria-label': ariaLabel = 'Main navigation',
}: NavigationHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        'w-full border-b border-border z-40',
        variant === 'default' ? 'bg-background' : 'bg-transparent',
        sticky && 'sticky top-0',
        className,
      )}
    >
      <a
        href={`#${skipToContentId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:outline-2 focus:outline-ring"
      >
        {skipToContentLabel}
      </a>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {logo && <div className="shrink-0">{logo}</div>}

          <nav
            aria-label={ariaLabel}
            className="hidden md:flex items-center gap-1 flex-1 ml-4"
          >
            {navItems.map((item, i) => (
              <a
                key={i}
                href={sanitizeHref(item.href)}
                aria-current={item.active ? 'page' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                target={item.external ? '_blank' : undefined}
                className={cn(
                  'px-3 py-1.5 rounded-sm text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  item.active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {actions && (
            <div className="hidden md:flex items-center gap-2 shrink-0">{actions}</div>
          )}

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMobileOpen((s) => !s)}
            className="md:hidden ml-auto flex items-center justify-center w-11 h-11 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring transition-colors duration-150"
          >
            {mobileOpen ? (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3.5A.5.5 0 0 1 1.5 3h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 3.5zm0 4A.5.5 0 0 1 1.5 7h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 7.5zm0 4A.5.5 0 0 1 1.5 11h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 11.5z" />
              </svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <nav id="mobile-nav" aria-label={ariaLabel} className="md:hidden py-3 border-t border-border">
            <ul className="flex flex-col gap-1" role="list">
              {navItems.map((item, i) => (
                <li key={i}>
                  <a
                    href={sanitizeHref(item.href)}
                    aria-current={item.active ? 'page' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    target={item.external ? '_blank' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-sm text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring',
                      item.active
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {actions && (
                <li className="pt-2 border-t border-border mt-1 flex items-center gap-2 px-3">
                  {actions}
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
