/**
 * Tests for AnnouncementEditorCanvas organism.
 * TDD: written before implementation.
 *
 * @see Issue #443
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementEditorCanvas } from "./AnnouncementEditorCanvas";

const baseProps = {
  categories: [{ id: "cat-1", name: "News", slug: "news" }],
  tags: [{ id: "tag-1", name: "Important", slug: "important" }],
  onSave: vi.fn(),
  onPublish: vi.fn(),
  onCancel: vi.fn(),
};

describe("AnnouncementEditorCanvas", () => {
  it("renders in create mode by default", () => {
    render(<AnnouncementEditorCanvas {...baseProps} />);
    expect(screen.getByLabelText("Title")).toBeDefined();
    expect(screen.getByLabelText("Summary")).toBeDefined();
    expect(screen.getByRole("button", { name: /save/i })).toBeDefined();
  });

  it("renders in edit mode with existing data", () => {
    render(
      <AnnouncementEditorCanvas
        {...baseProps}
        announcementId="ann-123"
        initialData={{
          title: "Existing Title",
          summary: "Existing Summary",
          contentBlocks: [],
          visibility: "public",
          categoryIds: ["cat-1"],
          tagIds: [],
          roleIds: [],
        }}
      />,
    );
    const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
    expect(titleInput.value).toBe("Existing Title");
  });

  it("calls onSave with stripped CRLF data", () => {
    const onSave = vi.fn();
    render(<AnnouncementEditorCanvas {...baseProps} onSave={onSave} />);
    const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Title\r\nWith\nCRLF" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSave).toHaveBeenCalled();
    const savedData = onSave.mock.calls[0]![0];
    expect(savedData.title).toBe("TitleWithCRLF");
  });

  it("shows validation errors on publish without required fields", () => {
    render(<AnnouncementEditorCanvas {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    expect(screen.getByText("Title is required")).toBeDefined();
  });

  it("calls onCancel when cancel clicked", () => {
    const onCancel = vi.fn();
    render(<AnnouncementEditorCanvas {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("renders loading state", () => {
    render(<AnnouncementEditorCanvas {...baseProps} loading />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("accepts custom className", () => {
    const { container } = render(
      <AnnouncementEditorCanvas {...baseProps} className="custom" />,
    );
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});
