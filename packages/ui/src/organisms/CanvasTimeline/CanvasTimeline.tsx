'use client';

import { useMemo, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';

export type TimelineZoom = 'day' | 'week' | 'month' | 'quarter';

export interface TimelineTask {
  id: string;
  title: string;
  start: string;
  end: string;
  progress?: number;
  dependsOn?: string[];
  milestone?: boolean;
  color?: string;
}

export interface CanvasTimelineProps {
  tasks: TimelineTask[];
  zoom: TimelineZoom;
  onZoomChange?: (zoom: TimelineZoom) => void;
  onTaskClick?: (taskId: string) => void;
  startDate: string;
  endDate: string;
  className?: string;
}

const ZOOM_OPTIONS: TimelineZoom[] = ['day', 'week', 'month', 'quarter'];

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay));
}

function generateTimeHeaders(startDate: string, endDate: string, zoom: TimelineZoom): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const headers: string[] = [];

  if (zoom === 'day') {
    const d = new Date(start);
    while (d <= end) {
      headers.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      d.setDate(d.getDate() + 1);
    }
  } else if (zoom === 'week') {
    const d = new Date(start);
    while (d <= end) {
      headers.push(`W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('en-US', { month: 'short' })}`);
      d.setDate(d.getDate() + 7);
    }
  } else if (zoom === 'month') {
    const d = new Date(start);
    while (d <= end) {
      headers.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    const d = new Date(start);
    while (d <= end) {
      headers.push(`Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`);
      d.setMonth(d.getMonth() + 3);
    }
  }

  return headers;
}

export function CanvasTimeline({
  tasks,
  zoom,
  onZoomChange,
  onTaskClick,
  startDate,
  endDate,
  className,
}: CanvasTimelineProps) {
  const totalDays = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);
  const headers = useMemo(() => generateTimeHeaders(startDate, endDate, zoom), [startDate, endDate, zoom]);

  const taskPositions = useMemo(() => {
    return tasks.map((task) => {
      const offsetDays = daysBetween(startDate, task.start);
      const durationDays = Math.max(1, daysBetween(task.start, task.end));
      const leftPct = totalDays > 0 ? (offsetDays / totalDays) * 100 : 0;
      const widthPct = totalDays > 0 ? (durationDays / totalDays) * 100 : 0;
      return { ...task, leftPct, widthPct };
    });
  }, [tasks, startDate, totalDays]);

  const dependencies = useMemo(() => {
    const taskMap = new Map(taskPositions.map((t) => [t.id, t]));
    const deps: Array<{ from: string; to: string; fromRight: number; toLeft: number; fromY: number; toY: number }> = [];

    taskPositions.forEach((task, idx) => {
      if (task.dependsOn) {
        for (const depId of task.dependsOn) {
          const dep = taskMap.get(depId);
          const depIdx = taskPositions.findIndex((t) => t.id === depId);
          if (dep) {
            deps.push({
              from: depId,
              to: task.id,
              fromRight: dep.leftPct + dep.widthPct,
              toLeft: task.leftPct,
              fromY: depIdx,
              toY: idx,
            });
          }
        }
      }
    });

    return deps;
  }, [taskPositions]);

  return (
    <div className={cn('flex flex-col border rounded-sm bg-card', className)} role="region" aria-label="Timeline">
      {/* Zoom controls */}
      <div className="flex items-center gap-1 border-b px-3 py-2">
        {ZOOM_OPTIONS.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => onZoomChange?.(z)}
            className={cn(
              'px-2 py-1 text-xs rounded-sm capitalize',
              z === zoom
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            {z}
          </button>
        ))}
      </div>

      {/* Timeline header */}
      <div className="flex border-b overflow-x-auto" data-timeline-header>
        <div className="w-48 shrink-0 border-r px-3 py-2 text-xs font-medium text-muted-foreground">
          Task
        </div>
        <div className="flex flex-1 min-w-0">
          {headers.map((h, i) => (
            <div
              key={i}
              className="flex-1 min-w-[60px] border-r px-1 py-2 text-xs text-muted-foreground text-center"
            >
              {h}
            </div>
          ))}
        </div>
      </div>

      {/* Task rows */}
      <div className="relative overflow-x-auto">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {dependencies.map((dep, i) => {
            const rowHeight = 40;
            const x1 = `${dep.fromRight}%`;
            const x2 = `${dep.toLeft}%`;
            const y1 = dep.fromY * rowHeight + rowHeight / 2;
            const y2 = dep.toY * rowHeight + rowHeight / 2;
            return (
              <line
                key={i}
                data-dependency
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={1}
                className="text-muted-foreground"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="currentColor" className="text-muted-foreground" />
            </marker>
          </defs>
        </svg>

        {taskPositions.map((task) => (
          <div key={task.id} className="flex h-10 items-center border-b">
            <div className="w-48 shrink-0 border-r px-3 text-sm truncate">
              {task.title}
            </div>
            <div className="relative flex-1 min-w-0 h-full">
              {task.milestone ? (
                <div
                  data-milestone
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-primary cursor-pointer"
                  style={{ left: `${task.leftPct}%` } as CSSProperties}
                  onClick={() => onTaskClick?.(task.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Milestone: ${task.title}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTaskClick?.(task.id); } }}
                />
              ) : (
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 rounded-xs bg-primary/20 cursor-pointer"
                  style={{
                    left: `${task.leftPct}%`,
                    width: `${task.widthPct}%`,
                    minWidth: '4px',
                  } as CSSProperties}
                  onClick={() => onTaskClick?.(task.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={task.title}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTaskClick?.(task.id); } }}
                >
                  {task.progress !== undefined && (
                    <div
                      data-progress
                      className="h-full rounded-xs bg-primary"
                      style={{ width: `${Math.min(100, task.progress * 100)}%` } as CSSProperties}
                    />
                  )}
                  <span className="absolute inset-0 flex items-center px-1 text-xs truncate text-foreground">
                    {task.title}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
