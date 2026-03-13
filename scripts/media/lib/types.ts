/**
 * Shared TypeScript interfaces for the Pexels media sourcing pipeline.
 */

/** Sidecar metadata schema — co-located with every downloaded media asset */
export interface SidecarMetadata {
  // Pexels provenance
  source: string;
  pexelsId: number;
  pexelsUrl: string;
  photographer: string;
  photographerUrl: string;
  photographerId: number;

  // Media properties
  originalWidth: number;
  originalHeight: number;
  averageColor: string;
  alt: string;
  originalAlt?: string;

  // Download details
  downloadUrl: string;
  downloadedAt: string;
  downloadedSize: "original" | "large2x" | "large" | "medium" | "small";
  localPath: string;
  checksum: string;

  // Licensing & attribution
  license: string;
  attributionRequired: boolean;
  attributionText: string;

  // Classification
  aiAssisted: boolean;
  aiGenerated: boolean;
  hasFirstNationsPermission: boolean;
  culturalNotes: string | null;
  themeVariant: "light" | "dark" | "universal";
  contentContext: string;
  pairedWith: string | null;

  // Agent provenance
  sourcingAgent: string;
  sourcingPrompt: string;
  reviewStatus: "accepted" | "rejected" | "pending";
  reviewNotes: string | null;
  reviewedAt: string | null;
  reviewConfirmedBy: string | null;
}

/** Required fields that must be present in a valid sidecar file */
export const SIDECAR_REQUIRED_FIELDS: ReadonlyArray<keyof SidecarMetadata> = [
  "source",
  "pexelsId",
  "photographer",
  "alt",
  "localPath",
  "license",
  "downloadUrl",
  "downloadedAt",
  "checksum",
  "originalWidth",
  "originalHeight",
] as const;

/** Pexels API photo source object */
export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

/** Pexels API photo response */
export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

/** Pexels API search response */
export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

/** Pexels video file */
export interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

/** Pexels video */
export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
}

/** Pexels video search response */
export interface PexelsVideoSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  next_page?: string;
}

/** Search options */
export interface PexelsSearchOptions {
  query: string;
  orientation?: "landscape" | "portrait" | "square";
  size?: "large" | "medium" | "small";
  color?: string;
  page?: number;
  perPage?: number;
  minWidth?: number;
  minHeight?: number;
}

/** Review result for a single candidate */
export interface ReviewResult {
  photo: PexelsPhoto;
  accepted: boolean;
  themeVariant: "light" | "dark" | "universal";
  score: number;
  reasons: string[];
}

/** A light/dark pair of media assets */
export interface MediaPairResult {
  contentContext: string;
  light: PexelsPhoto | null;
  dark: PexelsPhoto | null;
  fallback: PexelsPhoto | null;
}

/** Allowed MIME types for downloaded media (no SVG — script injection risk) */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Maximum file size for downloaded media (50 MB) */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
