"use client";

/**
 * Category management page — list, create, edit, reorder, deactivate categories.
 * Permission required: category:manage
 */

import { useCallback, useEffect, useState } from "react";
import { PermissionGate } from "../../lib/route-guard";
import { useBreadcrumbs } from "../use-breadcrumbs";
import {
  listAdminCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  type AdminCategory,
} from "../../lib/api-client";

export default function CategoriesPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Categories" },
  ]);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminCategories();
      if (result.ok) {
        const cats = result.data.categories ?? result.data;
        setCategories(
          Array.isArray(cats) ? cats.sort((a: AdminCategory, b: AdminCategory) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [],
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = useCallback(async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      const result = await createCategory({ name: newName, description: newDescription || undefined });
      if (result.ok) {
        setNewName("");
        setNewDescription("");
        setShowAddForm(false);
        await fetchCategories();
      }
    } finally {
      setSaving(false);
    }
  }, [newName, newDescription, saving, fetchCategories]);

  const handleStartEdit = useCallback((cat: AdminCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editName.trim() || saving) return;
    setSaving(true);
    try {
      const result = await updateCategory(editingId, {
        name: editName,
        description: editDescription || undefined,
      });
      if (result.ok) {
        setEditingId(null);
        await fetchCategories();
      }
    } finally {
      setSaving(false);
    }
  }, [editingId, editName, editDescription, saving, fetchCategories]);

  const handleMove = useCallback(
    async (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= categories.length) return;
      const reordered = [...categories];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(newIndex, 0, moved!);
      setCategories(reordered);
      await reorderCategories(reordered.map((c) => c.id));
    },
    [categories],
  );

  const handleDeactivate = useCallback(
    async (cat: AdminCategory) => {
      if (
        cat.isActive &&
        !confirm(
          "Deactivating will hide this category from new subscriptions. Existing subscriptions are preserved.",
        )
      ) {
        return;
      }
      const result = await updateCategory(cat.id, { isActive: !cat.isActive });
      if (result.ok) {
        await fetchCategories();
      }
    },
    [fetchCategories],
  );

  return (
    <PermissionGate permission="category:manage">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Categories</h1>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
          >
            Add Category
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="New category name"
              data-testid="new-category-name"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="New category description"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-md border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category list */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No categories yet. Create your first category.
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className={`rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-3 transition-opacity duration-150 ${
                  !cat.isActive ? "opacity-50" : ""
                }`}
              >
                {editingId === cat.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label="Edit category name"
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="w-full rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      aria-label="Edit category description"
                    />
                    <div className="flex gap-2">
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
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-foreground ${!cat.isActive ? "line-through" : ""}`}>
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                    )}
                    {cat._count && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat._count.announcements ?? 0} announcements
                        {cat._count.subscriptions !== undefined && ` · ${cat._count.subscriptions} subscribers`}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors duration-150"
                    aria-label={`Move ${cat.name} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === categories.length - 1}
                    className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors duration-150"
                    aria-label={`Move ${cat.name} down`}
                  >
                    ↓
                  </button>
                  {editingId !== cat.id && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeactivate(cat)}
                    className={`rounded border px-2 py-0.5 text-xs transition-colors duration-150 ${
                      cat.isActive
                        ? "border-amber-800/50 text-amber-400 hover:bg-amber-900/20"
                        : "border-green-800/50 text-green-400 hover:bg-green-900/20"
                    }`}
                  >
                    {cat.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
