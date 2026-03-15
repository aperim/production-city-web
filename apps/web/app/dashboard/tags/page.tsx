"use client";

/**
 * Tag management page — list, create, edit, delete tags.
 * Permission required: tag:manage
 */

import { useCallback, useEffect, useState } from "react";
import { PermissionGate } from "../../lib/route-guard";
import { useBreadcrumbs } from "../use-breadcrumbs";
import {
  listAdminTags,
  createTag,
  updateTag,
  deleteTag,
  type AdminTag,
} from "../../lib/api-client";

export default function TagsPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tags" },
  ]);

  const [tags, setTags] = useState<AdminTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminTags();
      if (result.ok) {
        const t = result.data.tags ?? result.data;
        setTags(Array.isArray(t) ? t : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAdd = useCallback(async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      const result = await createTag({ name: newName });
      if (result.ok) {
        setNewName("");
        setShowAddForm(false);
        await fetchTags();
      }
    } finally {
      setSaving(false);
    }
  }, [newName, saving, fetchTags]);

  const handleStartEdit = useCallback((tag: AdminTag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editName.trim() || saving) return;
    setSaving(true);
    try {
      const result = await updateTag(editingId, { name: editName });
      if (result.ok) {
        setEditingId(null);
        await fetchTags();
      }
    } finally {
      setSaving(false);
    }
  }, [editingId, editName, saving, fetchTags]);

  const handleDelete = useCallback(
    async (tag: AdminTag) => {
      if (
        !confirm(
          "Deleting this tag will remove it from all announcements. Continue?",
        )
      ) {
        return;
      }
      const result = await deleteTag(tag.id);
      if (result.ok) {
        await fetchTags();
      }
    },
    [fetchTags],
  );

  return (
    <PermissionGate permission="tag:manage">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Tags</h1>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
          >
            Add Tag
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="rounded-lg border border-border bg-card p-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tag name"
              className="flex-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="New tag name"
              data-testid="new-tag-name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !newName.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Tag list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No tags yet. Create your first tag.
          </p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-3"
              >
                {editingId === tag.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label="Edit tag name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tag.name}</p>
                      {tag._count && (
                        <p className="text-xs text-muted-foreground">
                          {tag._count.announcements ?? 0} announcements
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(tag)}
                        className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tag)}
                        className="rounded border border-border px-2 py-0.5 text-xs text-red-400 hover:text-red-300 hover:border-red-800/50 transition-colors duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
