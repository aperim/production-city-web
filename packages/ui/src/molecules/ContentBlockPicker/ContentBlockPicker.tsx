"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { ContentBlockType } from "../../types/announcements";

/** Props for the ContentBlockPicker molecule. */
export interface ContentBlockPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Called when a block type is selected. */
  onSelect: (type: ContentBlockType) => void;
  /** Whether the picker is disabled. */
  disabled?: boolean;
}

interface BlockOption {
  type: ContentBlockType;
  label: string;
  icon: string;
}

const blockOptions: BlockOption[] = [
  { type: "header", label: "Header", icon: "H" },
  { type: "text", label: "Text", icon: "T" },
  { type: "image", label: "Image", icon: "I" },
  { type: "image_text_left", label: "Image + Text Left", icon: "LT" },
  { type: "image_text_right", label: "Image + Text Right", icon: "TR" },
  { type: "spacer", label: "Spacer", icon: "—" },
];

/**
 * Toolbar/palette for selecting content block types to add to an announcement.
 */
function ContentBlockPicker({
  onSelect,
  disabled = false,
  className,
  ...props
}: ContentBlockPickerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-lg border border-border bg-card p-2",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
      aria-label="Add content block"
      {...props}
    >
      {blockOptions.map((opt) => (
        <button
          key={opt.type}
          type="button"
          onClick={() => onSelect(opt.type)}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          title={`Add ${opt.label} block`}
        >
          <span className="font-mono text-xs w-5 text-center" aria-hidden="true">
            {opt.icon}
          </span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export { ContentBlockPicker };
