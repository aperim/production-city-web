"use client";

import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface ScopeOption {
  /** Unique ID for this scope */
  id: string;
  /** Display label */
  label: string;
}

export interface ScopeBarProps {
  /** Available scope options */
  options: ScopeOption[];
  /** Currently selected scope ID */
  value?: string;
  /** Called when a scope is selected */
  onChange?: (scopeId: string) => void;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Called when search text changes */
  onSearch?: (query: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Filter/scope bar for workspace content.
 * Provides scope tabs and an optional search input.
 */
export function ScopeBar({
  options,
  value,
  onChange,
  searchPlaceholder = 'Filter...',
  onSearch,
  className,
}: ScopeBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    onSearch?.(q);
  }, [onSearch]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b border-border px-4 py-1.5 min-h-[40px]',
        className,
      )}
      role="toolbar"
      aria-label="Content filters"
    >
      <div className="flex items-center gap-1" role="tablist">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={value === opt.id}
            onClick={() => onChange?.(opt.id)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-sm transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              value === opt.id
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {onSearch && (
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className={cn(
            'ml-auto h-7 w-48 rounded-sm border border-border bg-transparent px-2 text-xs',
            'placeholder:text-muted-foreground/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        />
      )}
    </div>
  );
}
