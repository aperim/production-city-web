'use client';

import { cn } from '../../lib/utils';
import { WorkspaceCard, type WorkspaceCardProps } from '../../molecules/WorkspaceCard/WorkspaceCard';
import { RecentItem } from '../../molecules/RecentItem/RecentItem';

export interface AttentionItemData {
  id: string;
  type: 'approval' | 'mention' | 'update' | 'system';
  summary: string;
  workspace: string;
  sourceUrl: string;
  priority: 'urgent' | 'action' | 'info';
  createdAt: string;
}

export interface RecentData {
  label: string;
  path: string;
  timestamp: string;
}

export interface WhatsNewData {
  featureId: string;
  label: string;
  workspace: string;
  activatedAt: string;
}

export interface HomeDashboardProps {
  attentionItems: AttentionItemData[];
  recents: RecentData[];
  workspaceCards: WorkspaceCardProps[];
  whatsNew: WhatsNewData[];
  onNavigate: (path: string) => void;
  onRecentClick: (path: string) => void;
  className?: string;
}

/**
 * Home dashboard template with four sections:
 * 1. Needs Your Attention
 * 2. Pick Up Where You Left Off
 * 3. Your Workspaces (card grid)
 * 4. What's New
 */
export function HomeDashboard({
  attentionItems,
  recents,
  workspaceCards,
  whatsNew,
  onNavigate,
  onRecentClick,
  className,
}: HomeDashboardProps) {
  return (
    <div className={cn('flex flex-col gap-8 p-6', className)}>
      {/* Needs Your Attention */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Needs Your Attention</h2>
        {attentionItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attentionItems.map((item) => (
              <li key={item.id} className="rounded-lg border border-border p-3">
                <button
                  type="button"
                  onClick={() => onNavigate(item.sourceUrl)}
                  className="text-sm text-left hover:underline"
                >
                  {item.summary}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pick Up Where You Left Off */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Pick Up Where You Left Off</h2>
        {recents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Start exploring workspaces to build your recents.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {recents.map((r) => (
              <RecentItem
                key={r.path}
                label={r.label}
                path={r.path}
                timestamp={r.timestamp}
                onClick={() => onRecentClick(r.path)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Your Workspaces */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Your Workspaces</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaceCards.map((card) => (
            <WorkspaceCard key={card.workspace.id} {...card} />
          ))}
        </div>
      </section>

      {/* What's New */}
      {whatsNew.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">What's New</h2>
          <ul className="flex flex-col gap-2">
            {whatsNew.map((item) => (
              <li key={item.featureId} className="rounded-lg border border-border p-3 text-sm">
                {item.label}
                <span className="ml-2 text-xs text-muted-foreground">{item.workspace}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
