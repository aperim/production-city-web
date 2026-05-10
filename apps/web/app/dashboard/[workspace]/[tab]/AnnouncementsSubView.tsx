'use client';

/**
 * Announcements sub-view for the Communications canvas.
 * Renders a table of admin announcements fetched from GET /v1/admin/announcements.
 *
 * @see Issue #PRO-3881
 */

import type { AdminAnnouncementItem } from '../../../lib/api-client';

interface AnnouncementsSubViewProps {
  announcements: AdminAnnouncementItem[];
  loading: boolean;
  error: string | null;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_CLASSES: Record<string, string> = {
  draft: 'text-muted-foreground',
  published: 'text-green-600 dark:text-green-400',
  archived: 'text-muted-foreground line-through',
};

export function AnnouncementsSubView({
  announcements,
  loading,
  error,
  onView,
  onEdit,
  onCreate,
}: AnnouncementsSubViewProps) {
  if (loading) {
    return (
      <div role="status" className="flex flex-col gap-3 p-4">
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        <span className="sr-only">Loading announcements…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm text-muted-foreground">
          {announcements.length === 0 ? 'No announcements yet.' : `${announcements.length} announcement${announcements.length === 1 ? '' : 's'}`}
        </span>
        <button
          type="button"
          onClick={onCreate}
          className="text-sm font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          New announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground">
          No announcements have been created yet.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Visibility</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Author</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Published</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {announcements.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onView(item.id)}
                      className="font-medium hover:underline text-left"
                    >
                      {item.title}
                    </button>
                    {item.summary && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.summary}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CLASSES[item.status] ?? 'text-muted-foreground'}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{item.visibility}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.author.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(item.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
