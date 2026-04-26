import type {
  CampusNote,
  Facility,
  AccessRouteLegendEntry,
  SitePlan,
} from './masterplanData.js';

export type { CampusNote, Facility, AccessRouteLegendEntry, SitePlan };

export type MasterplanQuality = 'lite' | 'balanced' | 'high';

export interface MasterplanViewerOptions {
  mode?: 'standalone' | 'embed';
  initialView?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  pauseAutoRotateOnInteraction?: boolean;
  resumeAutoRotateAfterMs?: number;
  showLabels?: boolean;
  showRoutes?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
  quality?: MasterplanQuality;
  onFacilitySelect?: ((id: string | null, facility: Facility | null) => void) | null;
  onFacilityHover?: ((id: string | null, facility: Facility | null) => void) | null;
}

export interface MasterplanDebugInfo {
  memory: { geometries: number; textures: number };
  render: {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
    frame: number;
  };
  routesVisible: boolean;
  view: string;
}

export interface MasterplanSceneCounts {
  objects: number;
  meshes: number;
  instancedMeshes: number;
  lineSegments: number;
  labels: number;
  geometries: number;
  materials: number;
}

export interface MasterplanViewerInstance {
  setCameraView(view: string): void;
  setAutoRotate(enabled: boolean): void;
  setRoutesVisible(enabled: boolean): void;
  selectFacility(id: string | null, focusCamera?: boolean): void;
  focusFacility(id: string): void;
  resize(): void;
  dispose(): void;
  getCurrentView(): string;
  getDebugInfo(): MasterplanDebugInfo;
  countScene(): MasterplanSceneCounts;
}

export declare function createMasterplanViewer(
  container: HTMLElement,
  options?: MasterplanViewerOptions,
): MasterplanViewerInstance;

export declare const campusNotes: CampusNote[];
export declare const facilities: Facility[];
export declare const accessRouteLegend: AccessRouteLegendEntry[];
export declare const sitePlan: SitePlan;
