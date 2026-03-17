'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface CatalogItem {
  id: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  imageUrl?: string;
  ctaLabel?: string;
}

export interface CanvasCatalogProps {
  items: CatalogItem[];
  categories?: string[];
  onItemClick?: (itemId: string) => void;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function CanvasCatalog({
  items,
  categories = [],
  onItemClick,
  onSearch,
  onCategoryFilter,
  emptyMessage = 'No items found',
  className,
}: CanvasCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch?.(value);
      }, 300);
    },
    [onSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleCategoryClick = useCallback(
    (category: string) => {
      const next = activeCategory === category ? null : category;
      setActiveCategory(next);
      onCategoryFilter?.(category);
    },
    [activeCategory, onCategoryFilter],
  );

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q),
      );
    }
    if (activeCategory) {
      result = result.filter((item) => item.tags?.includes(activeCategory));
    }
    return result;
  }, [items, searchQuery, activeCategory]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-sm border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
        />

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  'px-2 py-1 text-xs rounded-sm border',
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground border-border hover:bg-accent/50',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col border rounded-sm bg-card cursor-pointer hover:border-accent-foreground/20 transition-colors duration-150"
              onClick={() => onItemClick?.(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick?.(item.id); } }}
            >
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-sm bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-3">
                <div className="text-sm font-medium">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] rounded-xs border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.ctaLabel && (
                  <button
                    type="button"
                    className="mt-auto w-full rounded-sm border bg-primary px-2 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemClick?.(item.id);
                    }}
                  >
                    {item.ctaLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
