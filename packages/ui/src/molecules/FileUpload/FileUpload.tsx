import {
  useState,
  useRef,
  useId,
  type DragEvent,
  type ChangeEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

/** Represents an uploaded or uploading file entry */
export interface UploadFile {
  /** Unique identifier. */
  id: string;
  /** File name. */
  name: string;
  /** File size in bytes. */
  size: number;
  /** Upload progress 0-100, or undefined if not started. */
  progress?: number;
  /** Error message if the file failed validation or upload. */
  error?: string;
  /** The underlying File object. */
  file: File;
}

/** Props for the FileUpload molecule */
export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Called when the file selection changes. */
  onChange?: (files: File[]) => void;
  /** Accepted MIME types or file extensions (e.g. "image/*,.pdf"). */
  accept?: string;
  /** Allow multiple file selection. @default false */
  multiple?: boolean;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Current upload state files (controlled). */
  files?: UploadFile[];
  /** Called when a file is removed. */
  onRemove?: (id: string) => void;
  /** Accessible label. */
  "aria-label"?: string;
  /** When true, the input is disabled. */
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FileUpload molecule — drag-and-drop and click-to-browse file input.
 *
 * Features: file type validation (via accept attribute), size limit, file list with progress.
 * Keyboard operable: Enter/Space on the drop zone opens file picker.
 * Screen reader announcements via aria-live.
 * All content is ReactNode — no innerHTML manipulation of any kind.
 */
export function FileUpload({
  onChange,
  accept,
  multiple = false,
  maxSize,
  files = [],
  onRemove,
  "aria-label": ariaLabel = "Upload files",
  disabled = false,
  className,
  ...props
}: FileUploadProps) {
  const instanceId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  /**
   * Validates a file against the accept pattern.
   * Handles MIME types (image/*), exact types (image/png), and extensions (.pdf).
   */
  function matchesAccept(file: File, acceptAttr: string): boolean {
    const patterns = acceptAttr.split(",").map((s) => s.trim()).filter(Boolean);
    return patterns.some((pattern) => {
      if (pattern.startsWith(".")) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase());
      }
      if (pattern.endsWith("/*")) {
        const category = pattern.slice(0, -2);
        return file.type.startsWith(category + "/");
      }
      return file.type === pattern;
    });
  }

  function validateAndEmit(rawFiles: File[]) {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of rawFiles) {
      if (accept && !matchesAccept(file, accept)) {
        errors.push(`${file.name}: file type not allowed`);
        continue;
      }
      if (maxSize != null && file.size > maxSize) {
        errors.push(`${file.name}: exceeds ${formatBytes(maxSize)} limit`);
        continue;
      }
      valid.push(file);
    }

    if (errors.length > 0) {
      setStatusMessage(errors.join(". "));
    } else {
      setStatusMessage(
        valid.length === 1
          ? `${valid[0]?.name ?? "File"} selected`
          : `${valid.length} files selected`,
      );
    }

    if (valid.length > 0) {
      onChange?.(valid);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    validateAndEmit(multiple ? dropped : dropped.slice(0, 1));
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    validateAndEmit(selected);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  const dropZoneId = `dropzone-${instanceId}`;

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {/* Polite status announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {/* Drop zone */}
      <div
        id={dropZoneId}
        role="button"
        aria-label={ariaLabel}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed px-6 py-8 text-center transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span aria-hidden="true" className="text-2xl text-muted-foreground">
          ^
        </span>
        <p className="text-sm font-medium text-foreground">
          {isDragging
            ? "Drop files here"
            : "Drag and drop files, or click to browse"}
        </p>
        {accept && (
          <p className="text-xs text-muted-foreground">Accepted: {accept}</p>
        )}
        {maxSize != null && (
          <p className="text-xs text-muted-foreground">
            Max size: {formatBytes(maxSize)}
          </p>
        )}
      </div>

      {/* Hidden native file input — no innerHTML manipulation */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={handleInputChange}
      />

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-label="Selected files">
          {files.map((f) => (
            <li
              key={f.id}
              className={cn(
                "flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm",
                f.error && "border-destructive",
              )}
            >
              <span aria-hidden="true" className="shrink-0 text-muted-foreground">
                {f.error ? "x" : f.progress === 100 ? "ok" : ".."}
              </span>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{f.name}</p>
                {f.error ? (
                  <p className="text-xs text-destructive">{f.error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(f.size)}
                  </p>
                )}
                {f.progress != null && f.progress < 100 && !f.error && (
                  <div
                    role="progressbar"
                    aria-valuenow={f.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Uploading ${f.name}`}
                    className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full bg-primary transition-[width] duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {onRemove && (
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => onRemove(f.id)}
                  className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span aria-hidden="true">x</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
