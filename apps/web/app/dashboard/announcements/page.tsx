"use client";

/**
 * Announcements dashboard — list, filter, sort, paginate, and manage announcements.
 * Permission required: announcement:read_admin
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminAnnouncementTable,
  type AdminAnnouncement,
  type ContentBlock,
  type PaginationState,
} from "@productioncity/holding-ui";
import { PermissionGate } from "../../lib/route-guard";
import { useBreadcrumbs } from "../use-breadcrumbs";
import {
  listAdminAnnouncements,
  publishAnnouncement,
  archiveAnnouncement,
} from "../../lib/api-client";

type StatusFilter = "draft" | "published" | "archived" | "";
type VisibilityFilter = "public" | "private" | "";

interface DraftStats {
  drafts: number;
  published: number;
  archived: number;
}

export default function AnnouncementsListPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Announcements" },
  ]);

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<DraftStats>({ drafts: 0, published: 0, archived: 0 });
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const publishGuardRef = useRef(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminAnnouncements({
        page,
        status: statusFilter || undefined,
        visibility: visibilityFilter || undefined,
        search: search || undefined,
      });
      if (result.ok) {
        const items = result.data.announcements.map(
          (a): AdminAnnouncement => ({
            id: a.id,
            title: a.title,
            summary: a.summary ?? "",
            slug: a.slug,
            categories: a.categories ?? [],
            tags: a.tags ?? [],
            author: { name: a.author?.name ?? "Unknown" },
            publishedAt: a.publishedAt ?? a.createdAt,
            visibility: (a.visibility ?? "public") as "public" | "private",
            status: (a.status ?? "draft") as "draft" | "published" | "archived",
            contentBlocks: (a.contentBlocks ?? []) as ContentBlock[],
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          }),
        );
        setAnnouncements(items);
        const pg = result.data.pagination;
        setTotalPages(pg?.totalPages ?? Math.ceil((pg?.total ?? items.length) / (pg?.pageSize ?? 20)));
        // Compute simple stats from current data
        setStats({
          drafts: items.filter((a) => a.status === "draft").length,
          published: items.filter((a) => a.status === "published").length,
          archived: items.filter((a) => a.status === "archived").length,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, visibilityFilter, search]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleEdit = useCallback((id: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `/dashboard/announcements/${encodeURIComponent(id)}/edit`;
    }
  }, []);

  const handlePublish = useCallback(
    async (id: string) => {
      if (publishingId || publishGuardRef.current) return;
      publishGuardRef.current = true;
      setPublishingId(id);
      try {
        const result = await publishAnnouncement(id);
        if (result.ok) {
          await fetchAnnouncements();
        }
      } finally {
        setPublishingId(null);
        publishGuardRef.current = false;
      }
    },
    [publishingId, fetchAnnouncements],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to archive this announcement? It will no longer be visible publicly.")) {
        return;
      }
      const result = await archiveAnnouncement(id);
      if (result.ok) {
        await fetchAnnouncements();
      }
    },
    [fetchAnnouncements],
  );

  const pagination: PaginationState = {
    page,
    totalPages,
    onPageChange: setPage,
  };

  return (
    <PermissionGate permission="announcement:read_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Announcements</h1>
          <a
            href="/dashboard/announcements/new"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-150"
          >
            New Announcement
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Drafts</p>
            <p className="text-2xl font-semibold text-foreground">{stats.drafts}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="text-2xl font-semibold text-foreground">{stats.published}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Archived</p>
            <p className="text-2xl font-semibold text-foreground">{stats.archived}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
            aria-label="Search announcements"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => {
              setVisibilityFilter(e.target.value as VisibilityFilter);
              setPage(1);
            }}
            className="rounded-md border border-border bg-card px-2 py-1.5 text-sm text-foreground"
            aria-label="Filter by visibility"
          >
            <option value="">All visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Table */}
        <AdminAnnouncementTable
          announcements={announcements}
          onEdit={handleEdit}
          onPublish={handlePublish}
          onArchive={handleArchive}
          pagination={pagination}
          loading={loading}
          data-testid="announcements-table"
        />
      </div>
    </PermissionGate>
  );
}
