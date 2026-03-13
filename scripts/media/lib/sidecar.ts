/**
 * Sidecar metadata file read/write/validate utilities.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { PexelsPhoto, SidecarMetadata } from "./types.js";
import { SIDECAR_REQUIRED_FIELDS } from "./types.js";

interface CreateSidecarOptions {
  localPath: string;
  checksum: string;
  downloadedSize: "original" | "large2x" | "large" | "medium" | "small";
  sourcingPrompt: string;
  contentContext: string;
  themeVariant: "light" | "dark" | "universal";
}

/** Create a sidecar metadata object from a Pexels photo API response */
export function createSidecarFromPhoto(
  photo: PexelsPhoto,
  options: CreateSidecarOptions,
): SidecarMetadata {
  return {
    source: "pexels",
    pexelsId: photo.id,
    pexelsUrl: photo.url,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    photographerId: photo.photographer_id,
    originalWidth: photo.width,
    originalHeight: photo.height,
    averageColor: photo.avg_color,
    alt: photo.alt,
    originalAlt: photo.alt,
    downloadUrl: photo.src[options.downloadedSize] ?? photo.src.original,
    downloadedAt: new Date().toISOString(),
    downloadedSize: options.downloadedSize,
    localPath: options.localPath,
    checksum: options.checksum,
    license: "pexels",
    attributionRequired: true,
    attributionText: `Photo by ${photo.photographer} on Pexels`,
    aiAssisted: false,
    aiGenerated: false,
    hasFirstNationsPermission: false,
    culturalNotes: null,
    themeVariant: options.themeVariant,
    contentContext: options.contentContext,
    pairedWith: null,
    sourcingAgent: "claude-code",
    sourcingPrompt: options.sourcingPrompt,
    reviewStatus: "pending",
    reviewNotes: null,
    reviewedAt: null,
    reviewConfirmedBy: null,
  };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate a sidecar metadata object against the required schema */
export function validateSidecar(sidecar: SidecarMetadata): ValidationResult {
  const errors: string[] = [];

  for (const field of SIDECAR_REQUIRED_FIELDS) {
    const value = sidecar[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Read and parse a sidecar JSON file */
export function readSidecar(filePath: string): SidecarMetadata {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as SidecarMetadata;
}

/** Update specific fields in an existing sidecar file */
export function updateSidecar(
  filePath: string,
  updates: Partial<SidecarMetadata>,
): void {
  const existing = readSidecar(filePath);
  const updated = { ...existing, ...updates };
  writeFileSync(filePath, JSON.stringify(updated, null, 2));
}

/** Compute SHA-256 checksum of a file, prefixed with "sha256:" */
export function computeChecksum(filePath: string): string {
  const content = readFileSync(filePath);
  const hash = createHash("sha256").update(content).digest("hex");
  return `sha256:${hash}`;
}
