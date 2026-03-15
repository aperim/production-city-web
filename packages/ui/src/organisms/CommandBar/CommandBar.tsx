import {
  useState,
  useRef,
  useId,
  useEffect,
  useMemo,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { cn } from "../../lib/utils";

/** Feature entry from the generated feature-index.ts */
export interface CommandBarFeature {
  id: string;
  label: string;
  description: string;
  path: string;
  section: string;
  subsection: string;
  keywords: string[];
  status: "planned" | "coming_soon" | "active" | "deprecated";
}

export interface CommandBarProps {
  /** Feature search index from generated feature-index.ts. */
  featureIndex: CommandBarFeature[];
  /** IDs of recently visited features (last 5, from localStorage). */
  recentFeatureIds: string[];
  /** Called when a feature is selected. */
  onSelect: (featureId: string, path: string) => void;
  /** Called when the command bar should close. */
  onClose: () => void;
  /** Whether the command bar is open. */
  open: boolean;
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** Text shown when no results match. */
  emptyMessage?: string;
  /** Label for the "Recent" section. */
  recentLabel?: string;
  /** Status label map for i18n. */
  statusLabels?: Record<string, string>;
}

const DEFAULT_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  coming_soon: "Coming Soon",
  active: "Active",
  deprecated: "Deprecated",
};

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function matchesFeature(query: string, feature: CommandBarFeature): boolean {
  if (!query) return true;
  return (
    fuzzyMatch(query, feature.label) ||
    fuzzyMatch(query, feature.description) ||
    fuzzyMatch(query, feature.section) ||
    fuzzyMatch(query, feature.subsection) ||
    feature.keywords.some((kw) => fuzzyMatch(query, kw))
  );
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  coming_soon: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  planned: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
  deprecated: "bg-red-500/15 text-red-400 border-red-500/20",
};

/**
 * CommandBar organism — dashboard command palette for searching all features.
 *
 * Built on the same patterns as CommandPalette molecule but specialized
 * for the dashboard feature registry with status badges, recent features,
 * and section breadcrumbs.
 */
export function CommandBar({
  featureIndex,
  recentFeatureIds,
  onSelect,
  onClose,
  open,
  placeholder = "Search features...",
  emptyMessage = "No features found",
  recentLabel = "Recent",
  statusLabels = DEFAULT_STATUS_LABELS,
}: CommandBarProps) {
  const instanceId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const listboxId = `cmdbar-listbox-${instanceId}`;

  // Build recent features list
  const recentFeatures = useMemo(() => {
    if (!recentFeatureIds.length || query) return [];
    return recentFeatureIds
      .map((id) => featureIndex.find((f) => f.id === id))
      .filter((f): f is CommandBarFeature => f !== undefined)
      .slice(0, 5);
  }, [featureIndex, recentFeatureIds, query]);

  // Filter features
  const filtered = useMemo(() => {
    if (!query) return featureIndex;
    return featureIndex.filter((f) => matchesFeature(query, f));
  }, [featureIndex, query]);

  // Combined list for keyboard navigation: recent + filtered (no duplicates)
  const flatItems = useMemo(() => {
    if (recentFeatures.length === 0) return filtered;
    const recentIds = new Set(recentFeatures.map((f) => f.id));
    const nonRecent = filtered.filter((f) => !recentIds.has(f.id));
    return [...recentFeatures, ...nonRecent];
  }, [recentFeatures, filtered]);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement;
      setQuery("");
      setActiveIndex(0);
      // Delay to allow dialog to render
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const activeItem = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    if (activeItem && typeof activeItem.scrollIntoView === "function") {
      activeItem.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const close = useCallback(() => {
    onClose();
    setQuery("");
    const opener = openerRef.current;
    if (opener && typeof opener.focus === "function") {
      setTimeout(() => opener.focus(), 0);
    }
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handleBackdrop(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleBackdrop);
    return () => document.removeEventListener("mousedown", handleBackdrop);
  }, [open, close]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const active = flatItems[activeIndex];
      if (active) {
        onSelect(active.id, active.path);
        close();
      }
    }
  }

  const activeItemId = flatItems[activeIndex]
    ? `cmdbar-item-${instanceId}-${flatItems[activeIndex].id}`
    : undefined;

  if (!open) return null;

  const hasRecent = recentFeatures.length > 0 && !query;
  const recentIds = new Set(recentFeatures.map((f) => f.id));
  // Cap rendered items at 50 to prevent DOM jank with 502-item registry
  const MAX_RENDERED = 50;
  const mainResults = hasRecent
    ? filtered.filter((f) => !recentIds.has(f.id)).slice(0, MAX_RENDERED)
    : filtered.slice(0, MAX_RENDERED);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20"
        aria-hidden="true"
        onClick={close}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-lg rounded-sm border border-border bg-popover shadow-sm overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-3">
          <svg
            aria-hidden="true"
            className="shrink-0 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={flatItems.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeItemId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="shrink-0 rounded-sm px-1 py-0.5 text-xs text-muted-foreground border border-border hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            esc
          </button>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Features"
          className="max-h-80 overflow-y-auto py-1"
        >
          {flatItems.length === 0 ? (
            <li
              className="px-3 py-4 text-center text-sm text-muted-foreground"
              aria-live="polite"
            >
              {emptyMessage}
            </li>
          ) : (
            <>
              {/* Recent section */}
              {hasRecent && recentFeatures.length > 0 && (
                <li>
                  <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                    {recentLabel}
                  </p>
                  <ul role="group" aria-label={recentLabel}>
                    {recentFeatures.map((feature) =>
                      renderFeatureItem(feature, instanceId, flatItems, activeIndex, setActiveIndex, onSelect, close, statusLabels),
                    )}
                  </ul>
                </li>
              )}
              {/* Main results */}
              {mainResults.map((feature) =>
                renderFeatureItem(feature, instanceId, flatItems, activeIndex, setActiveIndex, onSelect, close, statusLabels),
              )}
            </>
          )}
        </ul>

        {/* Result count for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {flatItems.length === 0
            ? emptyMessage
            : `${flatItems.length} features found`}
        </div>
      </div>
    </div>
  );
}

function renderFeatureItem(
  feature: CommandBarFeature,
  instanceId: string,
  flatItems: CommandBarFeature[],
  activeIndex: number,
  setActiveIndex: (i: number) => void,
  onSelect: (id: string, path: string) => void,
  close: () => void,
  statusLabels: Record<string, string>,
) {
  const itemIndex = flatItems.indexOf(feature);
  const isActive = itemIndex === activeIndex;
  const itemId = `cmdbar-item-${instanceId}-${feature.id}`;
  const statusLabel = statusLabels[feature.status] ?? feature.status;
  const badgeStyle = STATUS_BADGE_STYLES[feature.status] ?? STATUS_BADGE_STYLES.planned;

  return (
    <li
      key={feature.id}
      id={itemId}
      role="option"
      aria-selected={isActive}
      onClick={() => {
        onSelect(feature.id, feature.path);
        close();
      }}
      onMouseEnter={() => setActiveIndex(itemIndex)}
      className={cn(
        "flex cursor-default items-center gap-2.5 px-3 py-2 text-sm",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate">{feature.label}</span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-sm border px-1.5 py-0.5 text-xs",
              badgeStyle,
            )}
          >
            {statusLabel}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {feature.section} &rsaquo; {feature.subsection}
        </p>
      </div>
    </li>
  );
}
