import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { EoiStats } from "./EoiStats";

describe("EoiStats", () => {
  it("renders total and status counts", () => {
    const html = renderToString(
      createElement(EoiStats, {
        byCategory: { general: 5 },
        byStatus: { new: 3, contacted: 2 },
        total: 5,
      }),
    );
    expect(html).toContain("5 total");
    expect(html).toContain("3");
    expect(html).toContain("new");
  });

  it("renders loading state", () => {
    const html = renderToString(
      createElement(EoiStats, {
        byCategory: {},
        byStatus: {},
        total: 0,
        loading: true,
      }),
    );
    expect(html).toContain("animate-pulse");
  });

  it("uses custom labels", () => {
    const html = renderToString(
      createElement(EoiStats, {
        byCategory: { general: 5 },
        byStatus: { new: 3 },
        total: 5,
        statusLabels: { new: "New submissions" },
        categoryLabels: { general: "General inquiries" },
      }),
    );
    expect(html).toContain("New submissions");
    expect(html).toContain("General inquiries");
  });
});
