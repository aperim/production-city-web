/**
 * Shared utility functions for the announcement editor.
 *
 * Migrated from apps/web/app/dashboard/announcements/editor-utils.ts
 * to packages/ui for reuse across canvas components.
 *
 * SECURITY: stripCRLF() prevents CRLF injection in email headers.
 *
 * @see Issue #443
 */

import type { ContentBlock } from "../types/announcements";

/** Strip CRLF from text to prevent email header injection. */
export function stripCRLF(text: string): string {
  return text.replace(/[\r\n]/g, "");
}

/** Validation error messages by field. */
export interface ValidationErrors {
  title?: string;
  summary?: string;
  content?: string;
  categories?: string;
  roles?: string;
}

/** Input for pre-publish validation. */
export interface ValidatePublishInput {
  title: string;
  summary: string;
  contentBlocks: ContentBlock[];
  categoryIds: string[];
  visibility: "public" | "private";
  roleIds: string[];
}

/** Validate announcement before publish. */
export function validatePublish(input: ValidatePublishInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.title.trim()) {
    errors.title = "Title is required";
  }
  if (!input.summary.trim()) {
    errors.summary = "Summary is required";
  }
  if (input.contentBlocks.length === 0) {
    errors.content = "At least one content block is required";
  }
  if (input.categoryIds.length === 0) {
    errors.categories = "At least one category is required";
  }
  if (input.visibility === "private" && input.roleIds.length === 0) {
    errors.roles = "Private announcements require at least one role";
  }

  return errors;
}

/** Check if a ValidationErrors object has any errors. */
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Auto-save key for localStorage crash recovery. */
export function getAutoSaveKey(announcementId?: string): string {
  return announcementId
    ? `announcement-draft-${announcementId}`
    : "announcement-draft-new";
}

/** Draft data shape for localStorage persistence. */
export interface DraftData {
  title: string;
  summary: string;
  contentBlocks: ContentBlock[];
  visibility: string;
  categoryIds: string[];
  tagIds: string[];
  roleIds: string[];
}

/** Save draft to localStorage. */
export function saveDraftToLocalStorage(key: string, data: DraftData): void {
  try {
    localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    // localStorage full or unavailable
  }
}

/** Validate shape of localStorage draft data. */
function isValidDraft(data: unknown): data is DraftData & { savedAt: number } {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.title === "string" &&
    typeof d.summary === "string" &&
    Array.isArray(d.contentBlocks) &&
    (d.visibility === "public" || d.visibility === "private") &&
    Array.isArray(d.categoryIds) &&
    d.categoryIds.every((id) => typeof id === "string") &&
    Array.isArray(d.tagIds) &&
    d.tagIds.every((id) => typeof id === "string") &&
    Array.isArray(d.roleIds) &&
    d.roleIds.every((id) => typeof id === "string") &&
    typeof d.savedAt === "number"
  );
}

/** Load draft from localStorage. Returns null if not found, expired (>24h), or invalid. */
export function loadDraftFromLocalStorage(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!isValidDraft(data)) {
      localStorage.removeItem(key);
      return null;
    }
    // Expire after 24 hours
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** Clear localStorage draft. */
export function clearDraftFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
