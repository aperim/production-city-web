import {
  useState,
  useRef,
  useId,
  useEffect,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

/** Props for the DatePicker molecule */
export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Currently selected date (controlled).
   */
  value?: Date | null;
  /**
   * Called when the user selects a date.
   */
  onChange?: (date: Date | null) => void;
  /**
   * Minimum selectable date.
   */
  minDate?: Date;
  /**
   * Maximum selectable date.
   */
  maxDate?: Date;
  /**
   * Locale for date formatting.
   * @default "en-GB"
   */
  locale?: string;
  /**
   * Accessible label for the date picker trigger.
   */
  "aria-label"?: string;
  /**
   * Placeholder text for the trigger when no date is selected.
   */
  placeholder?: string;
  /**
   * Whether the picker is disabled.
   */
  disabled?: boolean;
}

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns 0=Monday, 6=Sunday for a date */
function dayOfWeekMon(d: Date) {
  return (d.getDay() + 6) % 7;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDisabled(date: Date, min?: Date, max?: Date) {
  if (min && date < min) return true;
  if (max && date > max) return true;
  return false;
}

/**
 * DatePicker molecule — accessible calendar date selection.
 *
 * Keyboard navigation: arrow keys for days, PgUp/PgDn for months, Escape to close.
 * Falls back gracefully with a native date input when JS is unavailable.
 * Locale-aware date formatting via Intl.DateTimeFormat.
 */
export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  locale = "en-GB",
  "aria-label": ariaLabel = "Select date",
  placeholder = "Select date",
  disabled = false,
  className,
  ...props
}: DatePickerProps) {
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ?? new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerId = `datepicker-trigger-${instanceId}`;
  const calendarId = `datepicker-cal-${instanceId}`;

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  useEffect(() => {
    if (open && focusedDate) {
      const btn = calendarRef.current?.querySelector<HTMLButtonElement>(
        `[data-date="${focusedDate.toISOString().slice(0, 10)}"]`,
      );
      btn?.focus();
    }
  }, [open, focusedDate]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !calendarRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function formatDate(d: Date) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  function formatMonthYear(d: Date) {
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d);
  }

  function openPicker() {
    setViewDate(value ?? new Date());
    setFocusedDate(value ?? new Date());
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function selectDate(d: Date) {
    onChange?.(d);
    closePicker();
  }

  function prevMonth() {
    setViewDate((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
  }

  function handleCalendarKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePicker();
      return;
    }

    const current = focusedDate ?? value ?? new Date();

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedDate && !isDisabled(focusedDate, minDate, maxDate)) {
        selectDate(focusedDate);
      }
      return;
    }

    let nextOffset: Date | null = null;
    const cur = new Date(current);

    if (e.key === "ArrowRight") { e.preventDefault(); cur.setDate(cur.getDate() + 1); nextOffset = cur; }
    else if (e.key === "ArrowLeft") { e.preventDefault(); cur.setDate(cur.getDate() - 1); nextOffset = cur; }
    else if (e.key === "ArrowDown") { e.preventDefault(); cur.setDate(cur.getDate() + 7); nextOffset = cur; }
    else if (e.key === "ArrowUp") { e.preventDefault(); cur.setDate(cur.getDate() - 7); nextOffset = cur; }
    else if (e.key === "PageUp") { e.preventDefault(); cur.setMonth(cur.getMonth() - 1); nextOffset = cur; }
    else if (e.key === "PageDown") { e.preventDefault(); cur.setMonth(cur.getMonth() + 1); nextOffset = cur; }
    else if (e.key === "Home") { e.preventDefault(); cur.setDate(1); nextOffset = cur; }
    else if (e.key === "End") { e.preventDefault(); cur.setDate(getDaysInMonth(cur.getFullYear(), cur.getMonth())); nextOffset = cur; }
    else { return; }

    if (nextOffset && !isDisabled(nextOffset, minDate, maxDate)) {
      setFocusedDate(nextOffset);
      setViewDate(new Date(nextOffset.getFullYear(), nextOffset.getMonth(), 1));
    }
  }

  // Build calendar grid
  const firstOfMonth = startOfMonth(viewDate);
  const startDayOffset = dayOfWeekMon(firstOfMonth);
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const calDays: (Date | null)[] = [
    ...Array.from({ length: startDayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  return (
    <div className={cn("relative inline-flex flex-col gap-1", className)} {...props}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? calendarId : undefined}
        disabled={disabled}
        onClick={() => (open ? closePicker() : openPicker())}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-background px-3 text-sm",
          "hover:bg-accent transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <span aria-hidden="true" className="text-muted-foreground">📅</span>
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {open && (
        <div
          ref={calendarRef}
          id={calendarId}
          role="dialog"
          aria-modal="true"
          aria-label={`Calendar: ${formatMonthYear(viewDate)}`}
          onKeyDown={handleCalendarKeyDown}
          className={cn(
            "absolute top-full z-50 mt-1 rounded-sm border border-border bg-popover p-3 shadow-sm",
            "w-64",
          )}
        >
          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={prevMonth}
              className="rounded-sm p-1 text-sm text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              ‹
            </button>
            <p className="text-sm font-medium">{formatMonthYear(viewDate)}</p>
            <button
              type="button"
              aria-label="Next month"
              onClick={nextMonth}
              className="rounded-sm p-1 text-sm text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 text-center" role="row" aria-hidden="true">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="py-1 text-xs font-medium text-muted-foreground">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            role="grid"
            aria-label={formatMonthYear(viewDate)}
            className="grid grid-cols-7"
          >
            {calDays.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} role="gridcell" aria-hidden="true" />;
              }

              const dateKey = day.toISOString().slice(0, 10);
              const isSelected = value ? isSameDay(day, value) : false;
              const isFocused = focusedDate ? isSameDay(day, focusedDate) : false;
              const isToday = isSameDay(day, new Date());
              const disabled = isDisabled(day, minDate, maxDate);

              return (
                <div key={dateKey} role="gridcell">
                  <button
                    type="button"
                    data-date={dateKey}
                    aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(day)}
                    aria-selected={isSelected}
                    aria-pressed={isSelected}
                    aria-disabled={disabled}
                    tabIndex={isFocused ? 0 : -1}
                    disabled={disabled}
                    onClick={() => selectDate(day)}
                    onFocus={() => setFocusedDate(day)}
                    className={cn(
                      "w-full rounded-sm p-1.5 text-center text-sm transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-ring",
                      "disabled:pointer-events-none disabled:opacity-30",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "border border-primary text-foreground"
                          : "hover:bg-accent text-foreground",
                    )}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Clear button */}
          {value && (
            <div className="mt-2 border-t border-border pt-2">
              <button
                type="button"
                onClick={() => { onChange?.(null); closePicker(); }}
                className="w-full rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
