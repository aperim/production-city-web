'use client';

import { useCallback } from 'react';
import { cn } from '../../lib/utils';

export type DocumentSortField = 'name' | 'date' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface DocumentItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size?: number;
  updatedAt?: string;
  childCount?: number;
}

export interface CanvasDocumentsProps {
  items: DocumentItem[];
  currentPath: string;
  onItemClick?: (itemId: string) => void;
  onUpload?: (files: FileList) => void;
  onCreateFolder?: () => void;
  onSort?: (field: DocumentSortField) => void;
  sortBy?: DocumentSortField;
  sortDirection?: SortDirection;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function fileTypeIcon(fileType?: string): string {
  switch (fileType?.toLowerCase()) {
    case 'pdf': return 'PDF';
    case 'doc':
    case 'docx': return 'DOC';
    case 'xls':
    case 'xlsx': return 'XLS';
    case 'ppt':
    case 'pptx': return 'PPT';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg': return 'IMG';
    case 'mp4':
    case 'mov':
    case 'avi': return 'VID';
    default: return 'FILE';
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CanvasDocuments({
  items,
  currentPath,
  onItemClick,
  onUpload,
  onCreateFolder,
  onSort,
  sortBy = 'name',
  sortDirection = 'asc',
  className,
}: CanvasDocumentsProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files.length > 0) {
        onUpload?.(e.dataTransfer.files);
      }
    },
    [onUpload],
  );

  const sortFields: DocumentSortField[] = ['name', 'date', 'size', 'type'];

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="text-xs text-muted-foreground">{currentPath}</div>
        <div className="flex items-center gap-2">
          {onCreateFolder && (
            <button
              type="button"
              onClick={onCreateFolder}
              className="px-2 py-1 text-xs rounded-sm border hover:bg-accent/50"
            >
              New Folder
            </button>
          )}
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        {sortFields.map((field) => (
          <button
            key={field}
            type="button"
            onClick={() => onSort?.(field)}
            className={cn(
              'px-2 py-1 text-xs rounded-sm capitalize',
              sortBy === field
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            {field}
            {sortBy === field && (
              <span className="ml-1">{sortDirection === 'asc' ? '\u2191' : '\u2193'}</span>
            )}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div
        data-upload-zone
        className="flex items-center justify-center border border-dashed rounded-sm p-6 text-xs text-muted-foreground hover:border-primary/50 hover:bg-accent/10 transition-colors duration-150"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        Drop files here to upload
      </div>

      {/* File list */}
      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No documents</div>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.id}
              data-type={item.type}
              className="flex items-center gap-3 border-b px-2 py-2 cursor-pointer hover:bg-accent/10 transition-colors duration-150"
              onClick={() => onItemClick?.(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemClick?.(item.id); } }}
            >
              {/* Icon */}
              <div className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xs text-[10px] font-medium',
                item.type === 'folder'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}>
                {item.type === 'folder' ? 'DIR' : fileTypeIcon(item.fileType)}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{item.name}</div>
                {item.type === 'folder' && item.childCount !== undefined && (
                  <div className="text-xs text-muted-foreground">{item.childCount} items</div>
                )}
              </div>

              {/* Size */}
              {item.size !== undefined && (
                <div className="text-xs text-muted-foreground shrink-0">
                  {formatFileSize(item.size)}
                </div>
              )}

              {/* Date */}
              {item.updatedAt && (
                <div className="text-xs text-muted-foreground shrink-0">
                  {formatDate(item.updatedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
