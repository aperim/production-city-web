'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { sanitizeHref } from '../../atoms/Link/Link';

/** Subsection within a sidebar section */
export interface BreadcrumbSubsection {
  id: string;
  label: string;
  featureIds: string[];
}

/** Section within a sidebar group */
export interface BreadcrumbSection {
  id: string;
  label: string;
  icon: string;
  path: string;
  subsections: BreadcrumbSubsection[];
}

/** Sidebar group for breadcrumb resolution */
export interface BreadcrumbSidebarGroup {
  id: string;
  label: string;
  sections: BreadcrumbSection[];
}

/** Props for the DashboardBreadcrumb molecule */
export interface DashboardBreadcrumbProps {
  /** Current page path */
  currentPath: string;
  /** Sidebar configuration for label resolution */
  sidebarConfig: BreadcrumbSidebarGroup[];
  /** Additional class names */
  className?: string;
}

interface BreadcrumbSegment {
  label: string;
  path?: string;
}

/**
 * Resolve breadcrumb segments from a path using the sidebar config.
 */
function resolveBreadcrumbs(path: string, config: BreadcrumbSidebarGroup[]): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [{ label: 'Dashboard', path: '/dashboard' }];

  if (path === '/dashboard' || path === '/dashboard/') {
    return segments;
  }

  for (const group of config) {
    for (const section of group.sections) {
      // Skip the root dashboard section for non-root paths
      if (section.path === '/dashboard' && path !== '/dashboard') continue;
      // Check if path starts with this section's base path
      if (!path.startsWith(section.path + '/') && path !== section.path) continue;

      segments.push({ label: section.label, path: section.path });

      const pathAfterSection = path.slice(section.path.length);
      const pathParts = pathAfterSection.split('/').filter(Boolean);

      if (pathParts.length === 0) return segments;

      // Match subsection by slug
      for (const subsection of section.subsections) {
        const subsectionSlug = (subsection.id.split('.').pop() ?? '').replace(/_/g, '-');
        if (pathParts[0] === subsectionSlug) {
          segments.push({ label: subsection.label });

          // Feature-level segment
          if (pathParts.length > 1) {
            const featureSlug = pathParts[pathParts.length - 1] ?? '';
            const featureLabel = featureSlug
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
            segments.push({ label: featureLabel });
          }
          return segments;
        }
      }

      return segments;
    }
  }

  return segments;
}

/**
 * DashboardBreadcrumb molecule — registry-derived breadcrumb trail.
 *
 * Resolves labels from the sidebar config based on the current path.
 * On mobile (< md), truncates to first + last with expandable ellipsis.
 * Uses `nav` with `aria-label="Breadcrumb"`.
 */
export function DashboardBreadcrumb({
  currentPath,
  sidebarConfig,
  className,
}: DashboardBreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const segments = resolveBreadcrumbs(currentPath, sidebarConfig);

  if (segments.length === 0) return null;

  const needsTruncation = segments.length > 2;
  const visibleSegments = needsTruncation && !expanded
    ? [segments[0]!, ...segments.slice(-1)]
    : segments;

  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      {/* Desktop: all segments */}
      <ol className="hidden md:flex items-center gap-1.5 text-muted-foreground">
        {segments.map((segment, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={`${segment.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <Separator />}
              {isLast ? (
                <span className="text-foreground font-medium truncate max-w-48" aria-current="page">
                  {segment.label}
                </span>
              ) : (
                <a
                  href={sanitizeHref(segment.path ?? '/dashboard')}
                  className="hover:text-foreground transition-colors duration-150 truncate max-w-32"
                >
                  {segment.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: truncated */}
      <ol className="flex md:hidden items-center gap-1.5 text-muted-foreground">
        {visibleSegments.map((segment, i) => {
          const isLast = i === visibleSegments.length - 1;
          const showEllipsis = needsTruncation && !expanded && i === 0;
          return (
            <li key={`m-${segment.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <Separator />}
              {isLast ? (
                <span className="text-foreground font-medium truncate max-w-40" aria-current="page">
                  {segment.label}
                </span>
              ) : (
                <a
                  href={sanitizeHref(segment.path ?? '/dashboard')}
                  className="hover:text-foreground transition-colors duration-150 truncate max-w-24"
                >
                  {segment.label}
                </a>
              )}
              {showEllipsis && (
                <>
                  <Separator />
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    aria-label="Show full breadcrumb"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-150 px-1"
                  >
                    ...
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Separator() {
  return (
    <svg aria-hidden="true" className="w-3 h-3 shrink-0 text-muted-foreground" viewBox="0 0 16 16">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export { resolveBreadcrumbs };
export type { BreadcrumbSegment };
