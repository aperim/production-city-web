/**
 * Tests for canvas wiring — verifies sample data modules resolve correctly
 * and the workspace scope configs cover all workspaces.
 *
 * @see Issue #415
 */

import { describe, it, expect } from 'vitest';
import { getSampleData, hasSampleData } from '../[workspace]/sample-data';
import { WORKSPACE_SCOPE_CONFIGS } from '../config/workspace-scope-configs';
import type { WorkspaceTab, CanvasType } from '../_generated/workspace-config';

const ALL_WORKSPACE_IDS = [
  'productions',
  'facilities',
  'finance',
  'people',
  'campus',
  'events',
  'education',
  'analytics',
  'investor-relations',
  'partnerships',
  'administration',
] as const;

const ALL_CANVAS_TYPES: CanvasType[] = [
  'table',
  'board',
  'calendar',
  'timeline',
  'catalog',
  'documents',
  'charts',
];

function makeTab(canvas: CanvasType): WorkspaceTab {
  return {
    id: 'test-tab',
    label: 'Test Tab',
    canvas,
    featureIds: ['test.feature'],
  };
}

describe('Sample data modules', () => {
  for (const wsId of ALL_WORKSPACE_IDS) {
    it(`provides sample data for workspace: ${wsId}`, () => {
      // Every workspace should have at least one canvas type with data
      const hasAny = ALL_CANVAS_TYPES.some((ct) => hasSampleData(wsId, ct));
      expect(hasAny).toBe(true);
    });

    it(`getSampleData returns an object for workspace: ${wsId}`, () => {
      // getSampleData should always return a non-null object
      const data = getSampleData(wsId, makeTab('table'));
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
    });
  }

  it('returns empty object for unknown workspace', () => {
    const data = getSampleData('nonexistent', makeTab('table'));
    expect(data).toEqual({});
  });
});

describe('Workspace scope configs', () => {
  for (const wsId of ALL_WORKSPACE_IDS) {
    it(`has scope config for workspace: ${wsId}`, () => {
      const config = WORKSPACE_SCOPE_CONFIGS[wsId];
      expect(config).toBeDefined();
      expect(config!.options.length).toBeGreaterThan(0);
    });
  }

  it('each scope config has unique option IDs', () => {
    for (const [_wsId, config] of Object.entries(WORKSPACE_SCOPE_CONFIGS)) {
      const ids = config.options.map((o) => o.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });
});
