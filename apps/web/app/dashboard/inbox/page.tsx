"use client";

/**
 * Inbox page — shows filtered inbox feed with mark read/dismiss.
 * @see Issue #396
 */

import { useEffect, useState, useCallback } from "react";
import {
  InboxPage as InboxPageTemplate,
  type InboxFeedItem,
  type InboxFilters,
  sanitizeHref,
} from "@productioncity/holding-ui";

import { getApiBase } from "../../lib/env";

const API_BASE = getApiBase();

export default function InboxPageRoute() {
  const [items, setItems] = useState<InboxFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalActionable, setTotalActionable] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<InboxFilters>({});

  const fetchInbox = useCallback(
    async (nextCursor?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (nextCursor) params.set("cursor", nextCursor);
        if (filters.type) params.set("type", filters.type);
        if (filters.workspace) params.set("workspace", filters.workspace);
        params.set("limit", "25");

        const res = await fetch(`${API_BASE}/v1/inbox?${params}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Inbox fetch failed: ${res.status}`);
        const body = (await res.json()) as {
          items: InboxFeedItem[];
          totalUnread: number;
          totalActionable: number;
          nextCursor: string | null;
        };

        setItems((prev) =>
          nextCursor ? [...prev, ...body.items] : body.items,
        );
        setTotalUnread(body.totalUnread);
        setTotalActionable(body.totalActionable);
        setCursor(body.nextCursor ?? null);
        setHasMore(!!body.nextCursor);
      } catch (err) {
        console.error("Inbox fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const handleMarkRead = async (id: string) => {
    await fetch(`${API_BASE}/v1/inbox/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    fetchInbox();
  };

  const handleDismiss = async (id: string) => {
    await fetch(`${API_BASE}/v1/inbox/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed: true }),
    });
    fetchInbox();
  };

  const handleMarkAllRead = async () => {
    await fetch(`${API_BASE}/v1/inbox/mark-all-read`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    fetchInbox();
  };

  return (
    <InboxPageTemplate
      items={items}
      loading={loading}
      totalUnread={totalUnread}
      totalActionable={totalActionable}
      hasMore={hasMore}
      onMarkRead={handleMarkRead}
      onDismiss={handleDismiss}
      onLoadMore={() => cursor && fetchInbox(cursor)}
      onMarkAllRead={handleMarkAllRead}
      onNavigate={(path) => {
        const safe = sanitizeHref(path);
        if (safe !== "#") window.location.href = safe;
      }}
      activeFilters={filters}
      onFilterChange={setFilters}
    />
  );
}
