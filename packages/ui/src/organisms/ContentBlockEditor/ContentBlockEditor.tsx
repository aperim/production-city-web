"use client";

import { useState, useRef, useCallback, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { ContentBlock, ContentBlockType, MediaAsset } from "../../types/announcements";
import { ContentBlockRenderer } from "../../molecules/ContentBlockRenderer/ContentBlockRenderer";
import { ContentBlockPicker } from "../../molecules/ContentBlockPicker/ContentBlockPicker";

/** Props for the ContentBlockEditor organism. */
export interface ContentBlockEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Current content blocks. */
  blocks: ContentBlock[];
  /** Called when the block list changes. */
  onChange: (blocks: ContentBlock[]) => void;
  /** Open media picker callback. */
  onMediaSelect: () => void;
  /** Available media assets. */
  availableMedia: MediaAsset[];
  /** Error message. */
  error?: string;
}

/**
 * Block editor for composing announcement content blocks.
 *
 * Accessibility: Move up/down buttons are the PRIMARY reorder mechanism
 * (keyboard accessible). Drag-and-drop is an enhancement only.
 * ARIA live region announces position changes.
 */
function ContentBlockEditor({
  blocks,
  onChange,
  onMediaSelect: _onMediaSelect,
  availableMedia: _availableMedia,
  error,
  className,
  ...props
}: ContentBlockEditorProps) {
  const [liveMessage, setLiveMessage] = useState("");
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const moveBlock = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;

      const updated = [...blocks];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved!);

      // Update positions
      const reindexed = updated.map((b, i) => ({ ...b, position: i }));
      onChange(reindexed);

      setLiveMessage(
        `Block moved to position ${newIndex + 1} of ${blocks.length}`,
      );

      // Focus the block in its new position
      requestAnimationFrame(() => {
        const ref = blockRefs.current.get(moved!.id);
        ref?.focus();
      });
    },
    [blocks, onChange],
  );

  const removeBlock = useCallback(
    (index: number) => {
      const updated = blocks.filter((_, i) => i !== index);
      const reindexed = updated.map((b, i) => ({ ...b, position: i }));
      onChange(reindexed);
      setLiveMessage(`Block removed. ${reindexed.length} blocks remaining.`);

      // Move focus to the next block, or previous, or the picker
      requestAnimationFrame(() => {
        const focusTarget =
          reindexed[index] ?? reindexed[index - 1];
        if (focusTarget) {
          const ref = blockRefs.current.get(focusTarget.id);
          ref?.focus();
        }
      });
    },
    [blocks, onChange],
  );

  const addBlock = useCallback(
    (type: ContentBlockType) => {
      const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const position = blocks.length;

      let newBlock: ContentBlock;
      switch (type) {
        case "header":
          newBlock = { id, position, type: "header", level: "h2", text: "" };
          break;
        case "text":
          newBlock = { id, position, type: "text", markdown: "" };
          break;
        case "image":
          newBlock = { id, position, type: "image", src: "", alt: "" };
          break;
        case "image_text_left":
          newBlock = { id, position, type: "image_text_left", src: "", alt: "", markdown: "" };
          break;
        case "image_text_right":
          newBlock = { id, position, type: "image_text_right", src: "", alt: "", markdown: "" };
          break;
        case "spacer":
          newBlock = { id, position, type: "spacer", size: "md" };
          break;
      }

      onChange([...blocks, newBlock]);
      setLiveMessage(`${type} block added at position ${position + 1}.`);
    },
    [blocks, onChange],
  );

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* ARIA live region for reorder announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>

      <ContentBlockPicker onSelect={addBlock} />

      {blocks.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No content blocks yet. Use the toolbar above to add blocks.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el);
              else blockRefs.current.delete(block.id);
            }}
            tabIndex={-1}
            className="group rounded-lg border border-border bg-card p-3 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                {block.type} — {index + 1}/{blocks.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(index, "up")}
                  disabled={index === 0}
                  className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                  aria-label={`Move block up from position ${index + 1}`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, "down")}
                  disabled={index === blocks.length - 1}
                  className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
                  aria-label={`Move block down from position ${index + 1}`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="rounded border border-border px-1.5 py-0.5 text-xs text-red-400 hover:text-red-300 hover:border-red-800/50 transition-colors duration-150"
                  aria-label={`Remove block at position ${index + 1}`}
                >
                  ×
                </button>
              </div>
            </div>
            <ContentBlockRenderer block={block} />
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-800/50 bg-red-900/20 p-3" role="alert">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

export { ContentBlockEditor };
