"use client";

/**
 * Audit log page — filterable, paginated audit log.
 * Permission required: audit:read
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AuditLogEntry } from "@productioncity/holding-ui";
import { AdminLayout } from "../admin-layout";
import { PermissionGate } from "../../lib/route-guard";
import { listAuditLog, type AuditLogEntryData } from "../../lib/api-client";

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const cursorRef = useRef<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchEntries = useCallback(
    async (append: boolean) => {
      setLoading(true);
      try {
        const result = await listAuditLog({
          action: actionFilter || undefined,
          actor: actorFilter || undefined,
          cursor: append ? cursorRef.current : undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        });
        if (result.ok) {
          if (append) {
            setEntries((prev) => [...prev, ...result.data.entries]);
          } else {
            setEntries(result.data.entries);
          }
          cursorRef.current = result.data.cursor;
          setHasMore(!!result.data.cursor);
        }
      } finally {
        setLoading(false);
      }
    },
    [actionFilter, actorFilter, fromDate, toDate],
  );

  useEffect(() => {
    cursorRef.current = undefined;
    fetchEntries(false);
  }, [fetchEntries]);

  const handleLoadMore = useCallback(() => {
    fetchEntries(true);
  }, [fetchEntries]);

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Audit Log" },
      ]}
    >
      <PermissionGate permission="audit:read">
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Filter by action..."
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filter by action"
              className="rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 w-48 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-150"
            />
            <input
              type="text"
              placeholder="Filter by actor..."
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              aria-label="Filter by actor"
              className="rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 w-48 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-150"
            />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              aria-label="From date"
              className="rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-150"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              aria-label="To date"
              className="rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors duration-150"
            />
          </div>

          {/* Entries */}
          {loading && entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No audit log entries found.
            </p>
          ) : (
            <div className="rounded-sm border border-border divide-y divide-border">
              {entries.map((entry) => (
                <AuditLogEntry
                  key={entry.id}
                  action={entry.action}
                  actorName={entry.actorName}
                  subjectName={entry.subjectName}
                  details={entry.details}
                  timestamp={new Date(entry.timestamp)}
                  ipAddress={entry.ipAddress}
                  className="px-3"
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="self-center rounded-sm border border-border px-4 py-1.5 text-sm hover:bg-accent disabled:opacity-50 transition-colors duration-150"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </PermissionGate>
    </AdminLayout>
  );
}
