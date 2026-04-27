'use client';

import { type ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { SidebarGroup } from '../../molecules/SidebarGroup/SidebarGroup';
import type { SidebarItemProps, SidebarItemStatus } from '../../atoms/SidebarItem/SidebarItem';

/** Lifecycle phases in order */
export const PHASE_ORDER = [
  'company_formation',
  'site_acquisition',
  'planning_approvals',
  'design_construct',
  'pre_operations',
  'operations',
  'expansion',
] as const;

export type Phase = (typeof PHASE_ORDER)[number];

/** Phase visibility rules for sidebar groups */
const GROUP_PHASE_VISIBILITY: Record<string, Phase> = {
  workspace: 'company_formation',
  company: 'company_formation',
  development: 'site_acquisition',
  production: 'pre_operations',
  people: 'pre_operations',
  business: 'company_formation',
  operations: 'operations',
  insights: 'company_formation',
  system: 'company_formation',
};

/** Config types matching the generated sidebar config */
export interface NavSubsection {
  id: string;
  label: string;
  featureIds: string[];
}

export interface NavSection {
  id: string;
  label: string;
  icon: string;
  path: string;
  subsections: NavSubsection[];
}

export interface NavGroup {
  id: string;
  label: string;
  sections: NavSection[];
}

/** Route info for matching active items */
export interface NavRoute {
  id: string;
  label: string;
  path: string;
  status: string;
}

/** Props for the SidebarNav organism */
export interface SidebarNavProps {
  /** Sidebar group configuration (from generated sidebar-config.ts) */
  config: NavGroup[];
  /** Visible feature IDs for the current user (filtered by role/permissions) */
  visibleFeatureIds: string[];
  /** Current company lifecycle phase */
  currentPhase: Phase;
  /** Current URL path (for active item highlighting) */
  currentPath: string;
  /** Route manifest (for status resolution) */
  routes: NavRoute[];
  /** Whether sidebar is collapsed (icon rail) */
  isCollapsed: boolean;
  /** Called when collapse toggle is clicked */
  onToggleCollapse: () => void;
  /** Additional class names */
  className?: string;
}

const STORAGE_KEY = 'pc-sidebar-expand-state';

function isPhaseVisible(groupId: string, currentPhase: Phase): boolean {
  const requiredPhase = GROUP_PHASE_VISIBILITY[groupId];
  if (!requiredPhase) return true;
  const currentIdx = PHASE_ORDER.indexOf(currentPhase);
  const requiredIdx = PHASE_ORDER.indexOf(requiredPhase);
  return currentIdx >= requiredIdx;
}

function loadExpandState(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // Ignore parse errors
  }
  return {};
}

function saveExpandState(state: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

/** Icon mapping for sidebar sections */
function SectionIcon({ name }: { name: string }) {
  // Simple SVG icons — keeps the sidebar lean without an icon library dependency
  const icons: Record<string, ReactNode> = {
    home: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 7h2v6h4V9h2v4h4V7h2L8 1z" /></svg>
    ),
    building: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h10v14H3V1zm2 2v2h2V3H5zm4 0v2h2V3H9zM5 7v2h2V7H5zm4 0v2h2V7H9zm-2 4v4h2v-4H7z" /></svg>
    ),
    landmark: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 5v1h14V5L8 1zM2 7v6h3V7H2zm4.5 0v6h3V7h-3zM11 7v6h3V7h-3zM1 14v1h14v-1H1z" /></svg>
    ),
  };
  return <span className="w-4 h-4 flex items-center justify-center" aria-hidden="true">{icons[name] ?? icons.home}</span>;
}

/**
 * SidebarNav organism — full dashboard sidebar navigation.
 *
 * Renders from generated sidebar config. Filters groups by phase visibility
 * and items by the user's visible feature IDs. Hides empty groups/sections.
 * Persists expand/collapse state per group to localStorage.
 */
export function SidebarNav({
  config,
  visibleFeatureIds,
  currentPhase,
  currentPath,
  routes,
  isCollapsed,
  onToggleCollapse,
  className,
}: SidebarNavProps) {
  const visibleSet = useMemo(() => new Set(visibleFeatureIds), [visibleFeatureIds]);
  const routeMap = useMemo(() => {
    const map = new Map<string, NavRoute>();
    for (const route of routes) map.set(route.id, route);
    return map;
  }, [routes]);

  // Initialize expand state from localStorage, validated against current config
  const [expandState, setExpandState] = useState<Record<string, boolean>>(() => {
    const stored = loadExpandState();
    const validGroupIds = new Set(config.map((g) => g.id));
    const cleaned: Record<string, boolean> = {};
    for (const [key, val] of Object.entries(stored)) {
      if (validGroupIds.has(key)) cleaned[key] = val;
    }
    return cleaned;
  });

  // Auto-expand group containing the active item
  useEffect(() => {
    for (const group of config) {
      for (const section of group.sections) {
        for (const sub of section.subsections) {
          for (const fid of sub.featureIds) {
            const route = routeMap.get(fid);
            if (route && currentPath.startsWith(route.path)) {
              setExpandState((prev) => {
                if (prev[group.id]) return prev;
                return { ...prev, [group.id]: true };
              });
              return;
            }
          }
        }
      }
    }
  }, [currentPath, config, routeMap]);

  // Persist expand state changes
  useEffect(() => {
    saveExpandState(expandState);
  }, [expandState]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandState((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  // Filter and build visible groups
  const visibleGroups = useMemo(() => {
    return config
      .filter((group) => isPhaseVisible(group.id, currentPhase))
      .map((group) => {
        const visibleItems: SidebarItemProps[] = [];

        for (const section of group.sections) {
          for (const sub of section.subsections) {
            for (const fid of sub.featureIds) {
              if (!visibleSet.has(fid)) continue;
              const route = routeMap.get(fid);
              if (!route) continue;

              visibleItems.push({
                id: fid,
                label: route.label,
                path: route.path,
                icon: <SectionIcon name={section.icon} />,
                isActive: currentPath === route.path || currentPath.startsWith(route.path + '/'),
                status: (route.status as SidebarItemStatus) || 'planned',
              });
            }
          }
        }

        return { group, items: visibleItems };
      })
      .filter(({ items }) => items.length > 0);
  }, [config, currentPhase, visibleSet, routeMap, currentPath]);

  return (
    <aside
      aria-label="Dashboard navigation"
      className={cn(
        'flex flex-col border-r border-border bg-background transition-[width] duration-200',
        isCollapsed ? 'w-14' : 'w-60',
        className,
      )}
    >
      {/* Collapse toggle */}
      <div className={cn('flex p-2', isCollapsed ? 'justify-center' : 'justify-end')}>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring transition-colors duration-150"
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={cn('transition-transform duration-150', isCollapsed && 'rotate-180')}
          >
            <path d="M9 3l-6 5 6 5V3z" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto px-2 py-2">
        {visibleGroups.map(({ group, items }) => (
          <SidebarGroup
            key={group.id}
            label={group.label}
            items={items}
            isExpanded={expandState[group.id] ?? false}
            onToggle={() => toggleGroup(group.id)}
            collapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
