"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import type { ContentBlock, Category, Tag } from "../../types/announcements";
import {
  stripCRLF,
  validatePublish,
  hasErrors,
  getAutoSaveKey,
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
  type DraftData,
  type ValidationErrors,
} from "../../lib/announcement-editor-utils";

/** Props for AnnouncementEditorCanvas. */
export interface AnnouncementEditorCanvasProps {
  /** Announcement ID for edit mode. Omit for create mode. */
  announcementId?: string;
  /** Initial data for edit mode. */
  initialData?: DraftData;
  /** Available categories. */
  categories: Category[];
  /** Available tags. */
  tags: Tag[];
  /** Save callback — receives sanitized data. */
  onSave: (data: DraftData) => void;
  /** Publish callback — validates before calling. */
  onPublish: (data: DraftData) => void;
  /** Cancel/back callback. */
  onCancel: () => void;
  /** Server auto-save callback (7s debounce). */
  onAutoSave?: (data: DraftData) => void;
  /** Loading state. */
  loading?: boolean;
  /** Custom className. */
  className?: string;
}

const AUTO_SAVE_DEBOUNCE_MS = 7000;

/**
 * Full-canvas announcement editor.
 *
 * Wraps form fields and content block editing.
 * Handles create and edit modes, auto-save with localStorage crash recovery,
 * and CRLF stripping for security.
 *
 * @see Issue #443
 */
export function AnnouncementEditorCanvas({
  announcementId,
  initialData,
  categories,
  tags,
  onSave,
  onPublish,
  onCancel,
  onAutoSave,
  loading = false,
  className,
}: AnnouncementEditorCanvasProps) {
  const autoSaveKey = getAutoSaveKey(announcementId);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCrashRecovery, setShowCrashRecovery] = useState(false);

  // Initialize from crash recovery or initial data
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    initialData?.contentBlocks ?? [],
  );
  const [visibility, setVisibility] = useState(initialData?.visibility ?? "public");
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData?.categoryIds ?? []);
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds ?? []);
  const [roleIds, setRoleIds] = useState<string[]>(initialData?.roleIds ?? []);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Check for crash recovery draft on mount
  useEffect(() => {
    if (initialData) return; // Edit mode with server data — skip recovery
    const draft = loadDraftFromLocalStorage(autoSaveKey);
    if (draft) {
      setShowCrashRecovery(true);
    }
  }, [autoSaveKey, initialData]);

  function restoreDraft() {
    const draft = loadDraftFromLocalStorage(autoSaveKey);
    if (draft) {
      setTitle(draft.title);
      setSummary(draft.summary);
      setContentBlocks(draft.contentBlocks);
      setVisibility(draft.visibility);
      setCategoryIds(draft.categoryIds);
      setTagIds(draft.tagIds);
      setRoleIds(draft.roleIds);
    }
    setShowCrashRecovery(false);
  }

  function dismissRecovery() {
    clearDraftFromLocalStorage(autoSaveKey);
    setShowCrashRecovery(false);
  }

  const getDraftData = useCallback((): DraftData => ({
    title: stripCRLF(title),
    summary: stripCRLF(summary),
    contentBlocks,
    visibility,
    categoryIds,
    tagIds,
    roleIds,
  }), [title, summary, contentBlocks, visibility, categoryIds, tagIds, roleIds]);

  // Auto-save to localStorage on changes
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const data = getDraftData();
      saveDraftToLocalStorage(autoSaveKey, data);
      onAutoSave?.(data);
    }, AUTO_SAVE_DEBOUNCE_MS);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, summary, contentBlocks, visibility, categoryIds, tagIds, roleIds, autoSaveKey, onAutoSave, getDraftData]);

  function handleSave() {
    const data = getDraftData();
    onSave(data);
  }

  function handlePublish() {
    const data = getDraftData();
    const validationErrors = validatePublish({
      title: data.title,
      summary: data.summary,
      contentBlocks: data.contentBlocks,
      categoryIds: data.categoryIds,
      visibility: data.visibility as "public" | "private",
      roleIds: data.roleIds,
    });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    clearDraftFromLocalStorage(autoSaveKey);
    onPublish(data);
  }

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-4 p-4", className)} role="status">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-6 w-full rounded bg-muted animate-pulse" />
        <div className="h-32 w-full rounded bg-muted animate-pulse" />
        <span className="sr-only">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 p-4 max-w-3xl", className)}>
      {/* Crash recovery prompt */}
      {showCrashRecovery && (
        <div className="flex items-center gap-2 rounded border border-border bg-muted/30 p-3 text-sm">
          <span className="text-muted-foreground">
            A previous draft was found. Restore it?
          </span>
          <button
            type="button"
            onClick={restoreDraft}
            className="rounded border border-border px-2 py-0.5 text-xs hover:bg-muted transition-colors duration-100"
          >
            Restore
          </button>
          <button
            type="button"
            onClick={dismissRecovery}
            className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Discard
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="editor-title" className="block text-xs font-medium text-muted-foreground mb-1">
          Title
        </label>
        <input
          id="editor-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "w-full rounded border px-3 py-2 text-sm bg-transparent text-foreground",
            "focus:outline-2 focus:outline-ring",
            errors.title ? "border-destructive" : "border-border",
          )}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Summary */}
      <div>
        <label htmlFor="editor-summary" className="block text-xs font-medium text-muted-foreground mb-1">
          Summary
        </label>
        <textarea
          id="editor-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className={cn(
            "w-full rounded border px-3 py-2 text-sm bg-transparent text-foreground resize-y",
            "focus:outline-2 focus:outline-ring",
            errors.summary ? "border-destructive" : "border-border",
          )}
        />
        {errors.summary && (
          <p className="mt-1 text-xs text-destructive">{errors.summary}</p>
        )}
      </div>

      {/* Content blocks placeholder */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Content Blocks</p>
        {contentBlocks.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 border border-dashed border-border rounded text-center">
            No content blocks. Add blocks to compose the announcement body.
          </p>
        )}
        {errors.content && (
          <p className="mt-1 text-xs text-destructive">{errors.content}</p>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label htmlFor="editor-visibility" className="block text-xs font-medium text-muted-foreground mb-1">
          Visibility
        </label>
        <select
          id="editor-visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="rounded border border-border px-3 py-2 text-sm bg-transparent text-foreground"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Categories</p>
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <label key={cat.id} className="inline-flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={categoryIds.includes(cat.id)}
                onChange={(e) => {
                  if (e.target.checked) setCategoryIds([...categoryIds, cat.id]);
                  else setCategoryIds(categoryIds.filter((id) => id !== cat.id));
                }}
              />
              {cat.name}
            </label>
          ))}
        </div>
        {errors.categories && (
          <p className="mt-1 text-xs text-destructive">{errors.categories}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <label key={tag.id} className="inline-flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={tagIds.includes(tag.id)}
                onChange={(e) => {
                  if (e.target.checked) setTagIds([...tagIds, tag.id]);
                  else setTagIds(tagIds.filter((id) => id !== tag.id));
                }}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors duration-100"
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="rounded border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors duration-100"
        >
          Publish
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
