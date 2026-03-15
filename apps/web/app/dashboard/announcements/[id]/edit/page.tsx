"use client";

/**
 * Edit announcement editor page.
 * Permission required: announcement:update
 */

import { useEffect, useState } from "react";
import { PermissionGate } from "../../../../lib/route-guard";
import { useBreadcrumbs } from "../../../use-breadcrumbs";
import { AnnouncementEditor } from "../../announcement-editor";
import { getAdminAnnouncement } from "../../../../lib/api-client";
import type { AdminAnnouncementItem } from "../../../../lib/api-client";

export default function EditAnnouncementPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Announcements", href: "/dashboard/announcements" },
    { label: "Edit" },
  ]);

  const [announcement, setAnnouncement] = useState<AdminAnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).at(-2)
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

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <PermissionGate permission="announcement:update">
      {announcement && (
        <AnnouncementEditor
          announcementId={announcement.id}
          initialData={{
            title: announcement.title,
            summary: announcement.summary ?? "",
            contentBlocks: (announcement.contentBlocks ?? []) as import("@productioncity/holding-ui").ContentBlock[],
            visibility: (announcement.visibility ?? "public") as "public" | "private",
            categoryIds: (announcement.categories ?? []).map((c) => c.id),
            tagIds: (announcement.tags ?? []).map((t) => t.id),
            roleIds: (announcement.roleVisibility ?? []).map((r) => r.id),
            status: announcement.status as "draft" | "published" | "archived",
            deliveryCount: announcement.deliveryStats?.sent ?? 0,
          }}
        />
      )}
    </PermissionGate>
  );
}
