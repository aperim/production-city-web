export interface SitePlan {
  name: string;
  width: number;
  depth: number;
  areaSqm: number;
  purpose: string;
}

export type CampusNote = [string, string];

export type FacilityCategory =
  | 'public'
  | 'creative'
  | 'stage'
  | 'support'
  | 'education'
  | 'logistics';

export interface Facility {
  id: string;
  name: string;
  shortName: string;
  category: FacilityCategory;
  purpose: string;
  metrics: [string, string][];
}

export type AccessRouteKind = 'public' | 'secure' | 'truck' | 'pedestrian';

export interface AccessRouteLegendEntry {
  kind: AccessRouteKind;
  label: string;
  color: string;
}

export declare const sitePlan: SitePlan;
export declare const campusNotes: CampusNote[];
export declare const facilities: Facility[];
export declare const accessRouteLegend: AccessRouteLegendEntry[];
