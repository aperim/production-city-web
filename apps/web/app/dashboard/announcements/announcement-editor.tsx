"use client";

/**
 * Shared announcement editor for create and edit pages.
 * Features: block editor, settings sidebar, auto-save, publish validation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ContentBlockEditor,
  type ContentBlock,
} from "@productioncity/holding-ui";
import { useAuth } from "../../lib/auth-context";
import {
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  archiveAnnouncement,
  listAdminCategories,
  listAdminTags,
  listRoles,
  type AdminCategory,
  type AdminTag,
} from "../../lib/api-client";
import {
  stripCRLF,
  validatePublish,
  hasErrors,
  getAutoSaveKey,
  saveDraftToLocalStorage,
  loadDraftFromLocalStorage,
  clearDraftFromLocalStorage,
  type ValidationErrors,
} from "./editor-utils";

export interface AnnouncementEditorProps {
  announcementId?: string;
  initialData?: {
    title: string;
    summary: string;
    contentBlocks: ContentBlock[];
    visibility: "public" | "private";
    categoryIds: string[];
    tagIds: string[];
    roleIds: string[];
    status: "draft" | "published" | "archived";
    deliveryCount?: number;
  };
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function AnnouncementEditor({
  announcementId,
  initialData,
}: AnnouncementEditorProps) {
  const { user } = useAuth();
  const isEditing = Boolean(announcementId);
  const isPublished = initialData?.status === "published";

  // Form state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    initialData?.contentBlocks ?? [],
  );
  const [visibility, setVisibility] = useState<"public" | "private">(
    initialData?.visibility ?? "public",
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categoryIds ?? [],
  );
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds ?? []);
  const [roleIds, setRoleIds] = useState<string[]>(initialData?.roleIds ?? []);

  // Reference data
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  // UI state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [publishing, setPublishing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(announcementId);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChangesRef = useRef(false);
  const publishGuardRef = useRef(false);

  // Load reference data
  useEffect(() => {
    Promise.all([listAdminCategories(), listAdminTags(), listRoles()]).then(
      ([catResult, tagResult, roleResult]) => {
        if (catResult.ok) setCategories(catResult.data.categories ?? catResult.data);
        if (tagResult.ok) setTags(tagResult.data.tags ?? tagResult.data);
        if (roleResult.ok) setRoles(roleResult.data.roles ?? roleResult.data);
      },
    );
  }, []);

  // Try to restore from localStorage on mount (crash recovery)
  useEffect(() => {
    if (initialData) return; // Don't overwrite server data
    const key = getAutoSaveKey(announcementId);
    const draft = loadDraftFromLocalStorage(key);
    if (draft) {
      setTitle(draft.title);
      setSummary(draft.summary);
      setContentBlocks(draft.contentBlocks);
      setVisibility(draft.visibility as "public" | "private");
      setCategoryIds(draft.categoryIds);
      setTagIds(draft.tagIds);
      setRoleIds(draft.roleIds);
    }
  }, [announcementId, initialData]);

  // Mark unsaved on any change
  const markUnsaved = useCallback(() => {
    hasChangesRef.current = true;
    setSaveStatus("unsaved");
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    const key = getAutoSaveKey(currentAnnouncementId);
    saveDraftToLocalStorage(key, {
      title,
      summary,
      contentBlocks,
      visibility,
      categoryIds,
      tagIds,
      roleIds,
    });
  }, [title, summary, contentBlocks, visibility, categoryIds, tagIds, roleIds, currentAnnouncementId]);

  // Auto-save to server every 7 seconds
  const saveToServer = useCallback(async () => {
    if (!hasChangesRef.current) return;
    setSaveStatus("saving");
    try {
      if (currentAnnouncementId) {
        const result = await updateAnnouncement(currentAnnouncementId, {
          title,
          summary,
          contentBlocks,
          visibility,
          categoryIds,
          tagIds,
          roleIds: visibility === "private" ? roleIds : [],
        });
        if (result.ok) {
          hasChangesRef.current = false;
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } else {
        // Create first, then auto-save updates
        const result = await createAnnouncement({
          title: title || "Untitled",
          summary,
          contentBlocks,
          visibility,
          categoryIds,
          tagIds,
          roleIds: visibility === "private" ? roleIds : [],
        });
        if (result.ok) {
          setCurrentAnnouncementId(result.data.id);
          hasChangesRef.current = false;
          setSaveStatus("saved");
          // Clear the "new" draft key since we now have an ID
          clearDraftFromLocalStorage(getAutoSaveKey());
        } else {
          setSaveStatus("error");
        }
      }
    } catch {
      setSaveStatus("error");
    }
  }, [
    currentAnnouncementId,
    title,
    summary,
    contentBlocks,
    visibility,
    categoryIds,
    tagIds,
    roleIds,
  ]);

  // Auto-save timer
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (hasChangesRef.current) {
      autoSaveTimerRef.current = setTimeout(saveToServer, 7000);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [saveToServer, title, summary, contentBlocks, visibility, categoryIds, tagIds, roleIds]);

  // Save on visibility change (tab switch)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && hasChangesRef.current) {
        saveToServer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [saveToServer]);

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Input handlers with CRLF stripping
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(stripCRLF(e.target.value));
      markUnsaved();
    },
    [markUnsaved],
  );

  const handleSummaryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const cleaned = stripCRLF(e.target.value);
      if (cleaned.length <= 500) {
        setSummary(cleaned);
        markUnsaved();
      }
    },
    [markUnsaved],
  );

  const handleBlocksChange = useCallback(
    (blocks: ContentBlock[]) => {
      setContentBlocks(blocks);
      markUnsaved();
    },
    [markUnsaved],
  );

  // Save draft manually
  const handleSaveDraft = useCallback(async () => {
    hasChangesRef.current = true;
    await saveToServer();
  }, [saveToServer]);

  // Publish (ref guard prevents double-publish on rapid clicks)
  const handlePublish = useCallback(async () => {
    if (publishGuardRef.current) return;
    publishGuardRef.current = true;

    const errors = validatePublish({
      title,
      summary,
      contentBlocks,
      categoryIds,
      visibility,
      roleIds,
    });
    setValidationErrors(errors);
    if (hasErrors(errors)) {
      publishGuardRef.current = false;
      return;
    }

    // Save first
    if (hasChangesRef.current) {
      await saveToServer();
    }

    const id = currentAnnouncementId;
    if (!id) return;

    setPublishing(true);
    try {
      const result = await publishAnnouncement(id);
      if (result.ok) {
        clearDraftFromLocalStorage(getAutoSaveKey(id));
        if (typeof window !== "undefined") {
          window.location.href = `/dashboard/announcements/${encodeURIComponent(id)}`;
        }
      }
    } finally {
      setPublishing(false);
    }
  }, [title, summary, contentBlocks, categoryIds, visibility, roleIds, currentAnnouncementId, saveToServer]);

  // Unpublish
  const handleUnpublish = useCallback(async () => {
    if (!currentAnnouncementId) return;
    const count = initialData?.deliveryCount ?? 0;
    if (
      !confirm(
        `Unpublishing will revert to draft. ${count} deliveries have already been sent — recipients will see the old content.`,
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      const result = await unpublishAnnouncement(currentAnnouncementId);
      if (result.ok && typeof window !== "undefined") {
        window.location.reload();
      }
    } finally {
      setActionLoading(false);
    }
  }, [currentAnnouncementId, initialData]);

  // Archive
  const handleArchive = useCallback(async () => {
    if (!currentAnnouncementId) return;
    if (!confirm("Are you sure you want to archive this announcement? It will no longer be visible publicly.")) {
      return;
    }
    setActionLoading(true);
    try {
      const result = await archiveAnnouncement(currentAnnouncementId);
      if (result.ok && typeof window !== "undefined") {
        window.location.href = "/dashboard/announcements";
      }
    } finally {
      setActionLoading(false);
    }
  }, [currentAnnouncementId]);

  // Category toggle
  const toggleCategory = useCallback(
    (id: string) => {
      setCategoryIds((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
      );
      markUnsaved();
    },
    [markUnsaved],
  );

  // Tag toggle
  const toggleTag = useCallback(
    (id: string) => {
      setTagIds((prev) =>
        prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
      );
      markUnsaved();
    },
    [markUnsaved],
  );

  // Role toggle
  const toggleRole = useCallback(
    (id: string) => {
      setRoleIds((prev) =>
        prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
      );
      markUnsaved();
    },
    [markUnsaved],
  );

  return (
    <div className="space-y-4">
      {/* Edit-after-publish warning */}
      {isPublished && isEditing && (
        <div
          className="rounded-lg border border-amber-800/50 bg-amber-900/20 p-3"
          role="alert"
        >
          <p className="text-sm text-amber-300">
            This announcement has been sent to {initialData?.deliveryCount ?? 0} subscribers.
            They will not see your changes in emails/SMS.
          </p>
        </div>
      )}

      {/* Save status */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">
          {isEditing ? "Edit Announcement" : "New Announcement"}
        </h1>
        <span
          className={`text-xs ${
            saveStatus === "saved"
              ? "text-green-400"
              : saveStatus === "saving"
                ? "text-muted-foreground"
                : saveStatus === "error"
                  ? "text-red-400"
                  : "text-amber-400"
          }`}
          aria-live="polite"
        >
          {saveStatus === "saved"
            ? "Saved"
            : saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "error"
                ? "Save failed"
                : "Unsaved changes"}
        </span>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left panel — content editor (70%) */}
        <div className="flex-1 lg:w-7/10 space-y-4">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Announcement title"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Title"
              data-testid="title-input"
            />
            {validationErrors.title && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.title}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <textarea
              value={summary}
              onChange={handleSummaryChange}
              placeholder="Brief summary (max 500 characters)"
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              aria-label="Summary"
              data-testid="summary-input"
            />
            <div className="flex justify-between">
              <div>
                {validationErrors.summary && (
                  <p className="text-xs text-red-400">{validationErrors.summary}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{summary.length}/500</p>
            </div>
          </div>

          {/* Content blocks */}
          <div>
            <ContentBlockEditor
              blocks={contentBlocks}
              onChange={handleBlocksChange}
              onMediaSelect={() => {
                /* TODO: media picker */
              }}
              availableMedia={[]}
              error={validationErrors.content}
              data-testid="content-editor"
            />
          </div>
        </div>

        {/* Right panel — settings sidebar (30%) */}
        <div className="lg:w-3/10 space-y-4">
          {/* Status */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Status</h3>
            <span className="text-sm font-medium text-foreground capitalize">
              {initialData?.status ?? "draft"}
            </span>
          </div>

          {/* Visibility */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Visibility</h3>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => {
                    setVisibility("public");
                    markUnsaved();
                  }}
                  className="accent-primary"
                />
                Public
              </label>
              <label className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => {
                    setVisibility("private");
                    markUnsaved();
                  }}
                  className="accent-primary"
                />
                Private
              </label>
            </div>
            {visibility === "private" && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Visible to roles:</p>
                <div className="flex flex-col gap-1">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={roleIds.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                        className="accent-primary"
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
                {validationErrors.roles && (
                  <p className="mt-1 text-xs text-red-400">{validationErrors.roles}</p>
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Categories</h3>
            <div className="flex flex-col gap-1">
              {categories
                .filter((c) => c.isActive)
                .map((cat) => (
                  <label key={cat.id} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="accent-primary"
                    />
                    {cat.name}
                  </label>
                ))}
            </div>
            {validationErrors.categories && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.categories}</p>
            )}
          </div>

          {/* Tags */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-2 py-0.5 text-xs transition-colors duration-150 ${
                    tagIds.includes(tag.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Author</h3>
            <p className="text-sm text-foreground">{user?.name ?? user?.email ?? "You"}</p>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saveStatus === "saving"}
              className="w-full rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/20 transition-colors duration-150 disabled:opacity-50"
            >
              Save Draft
            </button>

            {currentAnnouncementId && (
              <a
                href={`/dashboard/announcements/${encodeURIComponent(currentAnnouncementId)}`}
                className="block w-full rounded-md border border-border px-3 py-1.5 text-center text-sm text-foreground hover:bg-muted/20 transition-colors duration-150"
              >
                Preview
              </a>
            )}

            {(!isPublished || !isEditing) && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
                data-testid="publish-button"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            )}

            {isPublished && isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={actionLoading}
                  className="w-full rounded-md border border-amber-800/50 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-900/20 transition-colors duration-150 disabled:opacity-50"
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={actionLoading}
                  className="w-full rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-50"
                >
                  Archive
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
