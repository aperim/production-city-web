"use client";

/**
 * Announcement preview page — shows full rendering with metadata and delivery stats.
 * Permission required: announcement:read_admin
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ContentBlockRenderer,
  AnnouncementStatusBadge,
  VisibilityBadge,
  type ContentBlock,
} from "@productioncity/holding-ui";
import { PermissionGate } from "../../../lib/route-guard";
import { useBreadcrumbs } from "../../use-breadcrumbs";
import {
  getAdminAnnouncement,
  publishAnnouncement,
  type AdminAnnouncementItem,
} from "../../../lib/api-client";
import { validatePublish, hasErrors } from "../editor-utils";

export default function AnnouncementPreviewPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Announcements", href: "/dashboard/announcements" },
    { label: "Preview" },
  ]);

  const [announcement, setAnnouncement] = useState<AdminAnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const publishGuardRef = useRef(false);
  const [previewMode, setPreviewMode] = useState<"web" | "email">("web");

  useEffect(() => {
    const id = typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop()
      : null;
    if (!id) {
      setError("Invalid announcement ID");
      setLoading(false);
      return;
    }

    getAdminAnnouncement(id).then((result) => {
      if (result.ok) {
        setAnnouncement(result.data);
      } else {
        setError(result.error.message ?? "Failed to load announcement");
      }
      setLoading(false);
    });
  }, []);

  const handlePublish = useCallback(async () => {
    if (!announcement || publishing || publishGuardRef.current) return;
    publishGuardRef.current = true;
    const errors = validatePublish({
      title: announcement.title,
      summary: announcement.summary ?? "",
      contentBlocks: (announcement.contentBlocks ?? []) as ContentBlock[],
      categoryIds: (announcement.categories ?? []).map((c) => c.id),
      visibility: (announcement.visibility ?? "public") as "public" | "private",
      roleIds: (announcement.roleVisibility ?? []).map((r) => r.id),
    });
    if (hasErrors(errors)) {
      publishGuardRef.current = false;
      alert(Object.values(errors).join("\n"));
      return;
    }
    setPublishing(true);
    try {
      const result = await publishAnnouncement(announcement.id);
      if (result.ok && typeof window !== "undefined") {
        window.location.reload();
      }
    } finally {
      setPublishing(false);
    }
  }, [announcement, publishing]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-red-400">{error ?? "Not found"}</p>
      </div>
    );
  }

  const blocks = ([...(announcement.contentBlocks ?? [])] as ContentBlock[]).sort(
    (a: ContentBlock, b: ContentBlock) => (a.position ?? 0) - (b.position ?? 0),
  );

  return (
    <PermissionGate permission="announcement:read_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AnnouncementStatusBadge status={announcement.status as "draft" | "published" | "archived"} />
            <VisibilityBadge visibility={(announcement.visibility ?? "public") as "public" | "private"} />
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/dashboard/announcements/${encodeURIComponent(announcement.id)}/edit`}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted/20 transition-colors duration-150"
            >
              Edit
            </a>
            {announcement.status === "draft" && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{announcement.title}</h1>
          {announcement.summary && (
            <p className="mt-2 text-sm text-muted-foreground">{announcement.summary}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {announcement.author && (
              <span>By {announcement.author.name}</span>
            )}
            {announcement.publishedAt && (
              <span>
                Published{" "}
                <time dateTime={announcement.publishedAt}>
                  {new Date(announcement.publishedAt).toLocaleDateString("en-AU")}
                </time>
              </span>
            )}
            {(announcement.categories ?? []).length > 0 && (
              <span>
                Categories: {announcement.categories!.map((c) => c.name).join(", ")}
              </span>
            )}
            {(announcement.tags ?? []).length > 0 && (
              <span>Tags: {announcement.tags!.map((t) => t.name).join(", ")}</span>
            )}
          </div>
        </div>

        {/* Delivery stats (if published) */}
        {announcement.status === "published" && announcement.deliveryStats && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-3">Delivery Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(announcement.deliveryStats).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="text-lg font-semibold text-foreground">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview mode toggle */}
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
          <button
            type="button"
            onClick={() => setPreviewMode("web")}
            className={`rounded-md px-3 py-1 text-xs transition-colors duration-150 ${
              previewMode === "web"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Web Preview
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("email")}
            className={`rounded-md px-3 py-1 text-xs transition-colors duration-150 ${
              previewMode === "email"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email Preview
          </button>
        </div>

        {/* Content blocks */}
        <div
          className={
            previewMode === "email"
              ? "mx-auto max-w-xl rounded-lg border border-border bg-card p-6"
              : "space-y-4"
          }
        >
          {blocks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No content blocks.
            </p>
          )}
          {blocks.map((block) => (
            <ContentBlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </PermissionGate>
  );
}
