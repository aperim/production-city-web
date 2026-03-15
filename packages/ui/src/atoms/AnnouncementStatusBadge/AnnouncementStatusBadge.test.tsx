import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementStatusBadge } from "./AnnouncementStatusBadge";

describe("AnnouncementStatusBadge", () => {
  it("renders 'Draft' for draft status", () => {
    render(<AnnouncementStatusBadge status="draft" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders 'Published' for published status", () => {
    render(<AnnouncementStatusBadge status="published" />);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders 'Archived' for archived status", () => {
    render(<AnnouncementStatusBadge status="archived" />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("applies status-specific styling", () => {
    const { container } = render(
      <AnnouncementStatusBadge status="published" />,
    );
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-emerald");
  });

  it("merges custom className", () => {
    const { container } = render(
      <AnnouncementStatusBadge status="draft" className="custom-class" />,
    );
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("custom-class");
  });
});
