'use client';

import { useMemo } from 'react';
import { cn } from '../../lib/utils';

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId?: string;
}

export interface CanvasCalendarProps {
  /** Current view mode */
  view: CalendarView;
  /** Currently displayed date */
  date: Date;
  /** Events to display */
  events: CalendarEvent[];
  /** Called when view mode changes */
  onViewChange: (view: CalendarView) => void;
  /** Called when date changes (navigation) */
  onDateChange: (date: Date) => void;
  /** Called when an event is clicked */
  onEventClick?: (eventId: string) => void;
  /** Called when an empty slot is clicked */
  onSlotClick?: (date: Date) => void;
  /** Custom className */
  className?: string;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function getWeekDates(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function detectConflicts(events: CalendarEvent[]): Set<string> {
  const conflicts = new Set<string>();
  for (let i = 0; i < events.length; i++) {
    const a = events[i]!;
    for (let j = i + 1; j < events.length; j++) {
      const b = events[j]!;
      if (a.resourceId && b.resourceId && a.resourceId === b.resourceId) {
        const aStart = new Date(a.start).getTime();
        const aEnd = new Date(a.end).getTime();
        const bStart = new Date(b.start).getTime();
        const bEnd = new Date(b.end).getTime();
        if (aStart < bEnd && bStart < aEnd) {
          conflicts.add(a.id);
          conflicts.add(b.id);
        }
      }
    }
  }
  return conflicts;
}

function MonthView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (id: string) => void;
}) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cells = getMonthDays(year, month);

  return (
    <div aria-label="Calendar month view">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="px-2 py-1.5 text-xs font-medium text-muted-foreground text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dayEvents = day
            ? events.filter((e) => {
                const eDate = new Date(e.start);
                return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === day;
              })
            : [];
          return (
            <div
              key={i}
              className={cn(
                'min-h-[80px] border-b border-r p-1',
                !day && 'bg-muted/20',
              )}
            >
              {day && (
                <>
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onEventClick?.(ev.id)}
                        className="truncate rounded-xs bg-primary/10 px-1 py-0.5 text-[11px] text-foreground text-left hover:bg-primary/20 transition-colors"
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  date,
  events,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (id: string) => void;
}) {
  const weekDates = getWeekDates(date);

  return (
    <div aria-label="Calendar week view">
      <div className="grid grid-cols-8 border-b">
        <div className="px-2 py-1.5 text-xs text-muted-foreground" />
        {weekDates.map((d) => (
          <div key={d.toISOString()} className="px-2 py-1.5 text-xs font-medium text-muted-foreground text-center">
            {WEEKDAY_LABELS[d.getDay()]} {d.getDate()}
          </div>
        ))}
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b min-h-[48px]">
            <div className="px-2 py-1 text-[11px] text-muted-foreground">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDates.map((d) => {
              const dayEvents = events.filter((e) => {
                const eDate = new Date(e.start);
                return (
                  eDate.getFullYear() === d.getFullYear() &&
                  eDate.getMonth() === d.getMonth() &&
                  eDate.getDate() === d.getDate() &&
                  eDate.getHours() === hour
                );
              });
              return (
                <div key={d.toISOString()} className="border-r p-0.5">
                  {dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onEventClick?.(ev.id)}
                      className="w-full truncate rounded-xs bg-primary/10 px-1 py-0.5 text-[11px] text-foreground text-left hover:bg-primary/20 transition-colors"
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayView({
  date,
  events,
  conflicts,
  onEventClick,
}: {
  date: Date;
  events: CalendarEvent[];
  conflicts: Set<string>;
  onEventClick?: (id: string) => void;
}) {
  const dayEvents = events.filter((e) => {
    const eDate = new Date(e.start);
    return (
      eDate.getFullYear() === date.getFullYear() &&
      eDate.getMonth() === date.getMonth() &&
      eDate.getDate() === date.getDate()
    );
  });

  return (
    <div aria-label="Calendar day view">
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map((hour) => {
          const hourEvents = dayEvents.filter((e) => new Date(e.start).getHours() === hour);
          return (
            <div key={hour} className="grid grid-cols-[60px_1fr] border-b min-h-[48px]">
              <div className="px-2 py-1 text-[11px] text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="p-0.5 flex flex-col gap-0.5">
                {hourEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    data-conflict={conflicts.has(ev.id) ? '' : undefined}
                    aria-label={conflicts.has(ev.id) ? `${ev.title} (scheduling conflict)` : undefined}
                    onClick={() => onEventClick?.(ev.id)}
                    className={cn(
                      'w-full truncate rounded-xs px-1.5 py-1 text-[11px] text-foreground text-left transition-colors',
                      conflicts.has(ev.id)
                        ? 'bg-destructive/10 border border-destructive/50 hover:bg-destructive/20'
                        : 'bg-primary/10 hover:bg-primary/20',
                    )}
                  >
                    {ev.title}
                    {conflicts.has(ev.id) && (
                      <span className="sr-only"> (scheduling conflict)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Calendar with month/week/day views, event display, and conflict detection.
 */
export function CanvasCalendar({
  view,
  date,
  events,
  onViewChange,
  onDateChange,
  onEventClick,
  className,
}: CanvasCalendarProps) {
  const conflicts = useMemo(() => detectConflicts(events), [events]);

  const handlePrev = () => {
    const next = new Date(date);
    if (view === 'month') next.setMonth(next.getMonth() - 1);
    else if (view === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    onDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(date);
    if (view === 'month') next.setMonth(next.getMonth() + 1);
    else if (view === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const title = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={handlePrev}
            className="rounded-md border px-2 py-1 text-sm hover:bg-accent transition-colors"
          >
            &larr;
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={handleNext}
            className="rounded-md border px-2 py-1 text-sm hover:bg-accent transition-colors"
          >
            &rarr;
          </button>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToday}
            className="rounded-md border px-2.5 py-1 text-sm hover:bg-accent transition-colors"
          >
            Today
          </button>
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => onViewChange(v)}
              className={cn(
                'rounded-md px-2.5 py-1 text-sm transition-colors',
                view === v ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground',
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        {view === 'month' && (
          <MonthView date={date} events={events} onEventClick={onEventClick} />
        )}
        {view === 'week' && (
          <WeekView date={date} events={events} onEventClick={onEventClick} />
        )}
        {view === 'day' && (
          <DayView date={date} events={events} conflicts={conflicts} onEventClick={onEventClick} />
        )}
      </div>
    </div>
  );
}
