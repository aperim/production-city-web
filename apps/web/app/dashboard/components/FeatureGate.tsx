'use client';

import type { ReactNode } from 'react';
import { ComingSoonPage, type ComingSoonFeature, type RelatedFeature } from '@productioncity/holding-ui';
import { DASHBOARD_ROUTES, type DashboardRoute } from '../_generated/routes';
import { FEATURE_INDEX } from '../_generated/feature-index';

/** Props for the FeatureGate component */
export interface FeatureGateProps {
  /** The feature ID to gate */
  featureId: string;
  /** Visible feature IDs for the current user */
  visibleFeatureIds: string[];
  /** Children to render if the feature is active and accessible */
  children?: ReactNode;
}

/**
 * Build a route map from the generated routes for O(1) lookup.
 */
const ROUTE_MAP = new Map<string, DashboardRoute>();
for (const route of DASHBOARD_ROUTES) {
  ROUTE_MAP.set(route.id, route);
}

/**
 * Build a feature index map for O(1) lookup.
 */
const FEATURE_MAP = new Map<string, (typeof FEATURE_INDEX)[number]>();
for (const entry of FEATURE_INDEX) {
  FEATURE_MAP.set(entry.id, entry);
}

/**
 * Find related features in the same subsection.
 */
function findRelatedFeatures(featureId: string, visibleIds: Set<string>): RelatedFeature[] {
  // Parse subsection prefix (e.g., "company_ops.hr" from "company_ops.hr.directory")
  const parts = featureId.split('.');
  if (parts.length < 3) return [];
  const subsectionPrefix = parts.slice(0, 2).join('.');

  const related: RelatedFeature[] = [];
  for (const route of DASHBOARD_ROUTES) {
    if (route.id === featureId) continue;
    if (!route.id.startsWith(subsectionPrefix + '.')) continue;
    if (!visibleIds.has(route.id)) continue;

    const feature = FEATURE_MAP.get(route.id);
    if (!feature) continue;

    related.push({
      id: route.id,
      label: feature.label,
      status: route.status as 'active' | 'coming_soon' | 'planned' | 'deprecated',
      targetQuarter: null, // Not available in generated routes; would need feature index extension
      path: route.path,
    });
  }

  return related.slice(0, 4);
}

/**
 * FeatureGate — route-level guard for dashboard features.
 *
 * Checks:
 * 1. Feature exists in the route manifest
 * 2. Feature is in the user's visible_feature_ids (role + permission check done server-side)
 * 3. Feature status: active → render children, planned/coming_soon → ComingSoonPage
 *
 * Security: unauthorized features return null (rendered as 404 by parent layout).
 * Never shows a 403 to prevent feature enumeration.
 */
export function FeatureGate({
  featureId,
  visibleFeatureIds,
  children,
}: FeatureGateProps) {
  // 1. Look up feature in manifest (timing-safe: always do this first)
  const route = ROUTE_MAP.get(featureId);

  // 2. Check visibility (role + permissions resolved server-side)
  const visibleSet = new Set(visibleFeatureIds);
  const isVisible = visibleSet.has(featureId);

  // Unknown feature or not visible → 404 (identical response for both)
  if (!route || !isVisible) {
    return null;
  }

  // 3. Check feature status
  if (route.status === 'active') {
    // Active feature with children (page component) → render it
    if (children) return <>{children}</>;
    // Active feature but no page component → graceful fallback
  }

  // 4. Planned, coming_soon, or active without a page → ComingSoonPage
  const featureEntry = FEATURE_MAP.get(featureId);
  if (!featureEntry) return null;

  const comingSoonFeature: ComingSoonFeature = {
    id: route.id,
    label: featureEntry.label,
    description: featureEntry.description,
    status: (route.status === 'deprecated' ? 'planned' : route.status) as 'planned' | 'coming_soon',
    targetQuarter: null, // Would come from registry; not in generated routes
    priority: route.priority,
    phase: route.phase,
  };

  const relatedFeatures = findRelatedFeatures(featureId, visibleSet);

  return (
    <ComingSoonPage
      feature={comingSoonFeature}
      relatedFeatures={relatedFeatures}
    />
  );
}
