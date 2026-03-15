import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContentBlockEditor } from "./ContentBlockEditor";
import type { ContentBlock } from "../../types/announcements";

const textBlock: ContentBlock = {
  id: "1",
  position: 0,
  type: "text",
  markdown: "Hello **world**",
};

const headerBlock: ContentBlock = {
  id: "2",
  position: 1,
  type: "header",
  level: "h2",
  text: "Section Title",
};

describe("ContentBlockEditor", () => {
  it("renders empty state when no blocks", () => {
    render(
      <ContentBlockEditor
        blocks={[]}
        onChange={vi.fn()}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    expect(
      screen.getByText("No content blocks yet. Use the toolbar above to add blocks."),
    ).toBeInTheDocument();
  });

  it("renders existing blocks", () => {
    render(
      <ContentBlockEditor
        blocks={[textBlock, headerBlock]}
        onChange={vi.fn()}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    expect(screen.getByText("Section Title")).toBeInTheDocument();
  });

  it("adds a block when picker is used", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ContentBlockEditor
        blocks={[]}
        onChange={onChange}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    await user.click(screen.getByText("Header"));
    expect(onChange).toHaveBeenCalledOnce();
    const newBlocks = onChange.mock.calls[0]![0] as ContentBlock[];
    expect(newBlocks).toHaveLength(1);
    expect(newBlocks[0]!.type).toBe("header");
  });

  it("removes a block", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ContentBlockEditor
        blocks={[textBlock, headerBlock]}
        onChange={onChange}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    const removeButtons = screen.getAllByLabelText(/Remove block/);
    await user.click(removeButtons[0]!);
    expect(onChange).toHaveBeenCalledOnce();
    const newBlocks = onChange.mock.calls[0]![0] as ContentBlock[];
    expect(newBlocks).toHaveLength(1);
  });

  it("moves a block up via keyboard-accessible button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ContentBlockEditor
        blocks={[textBlock, headerBlock]}
        onChange={onChange}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    const upButtons = screen.getAllByLabelText(/Move block up/);
    // Move the second block (header) up
    await user.click(upButtons[1]!);
    expect(onChange).toHaveBeenCalledOnce();
    const newBlocks = onChange.mock.calls[0]![0] as ContentBlock[];
    expect(newBlocks[0]!.id).toBe("2");
    expect(newBlocks[1]!.id).toBe("1");
  });

  it("moves a block down", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ContentBlockEditor
        blocks={[textBlock, headerBlock]}
        onChange={onChange}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    const downButtons = screen.getAllByLabelText(/Move block down/);
    await user.click(downButtons[0]!);
    expect(onChange).toHaveBeenCalledOnce();
    const newBlocks = onChange.mock.calls[0]![0] as ContentBlock[];
    expect(newBlocks[0]!.id).toBe("2");
  });

  it("disables move up for first block", () => {
    render(
      <ContentBlockEditor
        blocks={[textBlock, headerBlock]}
        onChange={vi.fn()}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    const upButtons = screen.getAllByLabelText(/Move block up/);
    expect(upButtons[0]).toBeDisabled();
  });

  it("disables move down for last block", () => {
    render(
      <ContentBlockEditor
        blocks={[textBlock, headerBlock]}
        onChange={vi.fn()}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    const downButtons = screen.getAllByLabelText(/Move block down/);
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });

  it("has ARIA live region for reorder announcements", () => {
    const { container } = render(
      <ContentBlockEditor
        blocks={[textBlock]}
        onChange={vi.fn()}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
      />,
    );
    const liveRegion = container.querySelector("[aria-live='polite']");
    expect(liveRegion).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(
      <ContentBlockEditor
        blocks={[textBlock]}
        onChange={vi.fn()}
        onMediaSelect={vi.fn()}
        availableMedia={[]}
        error="Failed to save"
      />,
    );
    expect(screen.getByText("Failed to save")).toBeInTheDocument();
  });
});
