/**
 * Sample data resolver — returns appropriate sample data for a given
 * workspace and canvas type.
 *
 * Each workspace defines its own sample data with domain-appropriate
 * field names and values. This data is replaced with live API data
 * as each workspace goes live (separate issues per workspace activation).
 *
 * SECURITY NOTE: All sample data is static, hardcoded, non-sensitive
 * demo content. No real PII, credentials, or financial data is included.
 * This module is client-bundled and visible in browser DevTools.
 * When live data integration replaces sample data, ensure the resolver
 * fetches from authenticated API endpoints rather than importing static
 * modules for any workspace containing sensitive information.
 *
 * @see Issue #415
 */

import type { CanvasType, WorkspaceTab } from '../../_generated/workspace-config';
import { PRODUCTIONS_SAMPLE_DATA } from './productions';
import { FACILITIES_SAMPLE_DATA } from './facilities';
import { FINANCE_SAMPLE_DATA } from './finance';
import { PEOPLE_SAMPLE_DATA } from './people';
import { CAMPUS_SAMPLE_DATA } from './campus';
import { EVENTS_SAMPLE_DATA } from './events';
import { EDUCATION_SAMPLE_DATA } from './education';
import { ANALYTICS_SAMPLE_DATA } from './analytics';
import { INVESTOR_RELATIONS_SAMPLE_DATA } from './investor-relations';
import { PARTNERSHIPS_SAMPLE_DATA } from './partnerships';
import { ADMINISTRATION_SAMPLE_DATA } from './administration';

/** Map of workspace ID -> canvas type -> sample data */
const SAMPLE_DATA_MAP: Record<string, Record<string, unknown>> = {
  productions: PRODUCTIONS_SAMPLE_DATA,
  facilities: FACILITIES_SAMPLE_DATA,
  finance: FINANCE_SAMPLE_DATA,
  people: PEOPLE_SAMPLE_DATA,
  campus: CAMPUS_SAMPLE_DATA,
  events: EVENTS_SAMPLE_DATA,
  education: EDUCATION_SAMPLE_DATA,
  analytics: ANALYTICS_SAMPLE_DATA,
  'investor-relations': INVESTOR_RELATIONS_SAMPLE_DATA,
  partnerships: PARTNERSHIPS_SAMPLE_DATA,
  administration: ADMINISTRATION_SAMPLE_DATA,
};

/**
 * Get sample data for a workspace tab's canvas type.
 * Returns typed data appropriate for the canvas component,
 * or an empty object if no sample data exists.
 */
export function getSampleData(workspace: string, tabConfig: WorkspaceTab): Record<string, unknown> {
  const wsData = SAMPLE_DATA_MAP[workspace];
  if (!wsData) return {};

  const canvasData = wsData[tabConfig.canvas as string];
  if (canvasData && typeof canvasData === 'object') {
    return canvasData as Record<string, unknown>;
  }

  // Fall back to the first available canvas data for this workspace
  const firstKey = Object.keys(wsData)[0];
  if (firstKey) {
    const fallback = wsData[firstKey];
    if (fallback && typeof fallback === 'object') {
      return fallback as Record<string, unknown>;
    }
  }

  return {};
}

/**
 * Check if a workspace has sample data for a specific canvas type.
 */
export function hasSampleData(workspace: string, canvasType: CanvasType): boolean {
  const wsData = SAMPLE_DATA_MAP[workspace];
  if (!wsData) return false;
  return canvasType in wsData;
}
