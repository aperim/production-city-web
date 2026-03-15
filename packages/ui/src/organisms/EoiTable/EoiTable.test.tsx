import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { EoiTable } from "./EoiTable";

const items = [
  { id: "1", name: "Jane Doe", email: "jane@example.com", category: "producer", status: "new", locale: "en", sourcePage: "/", createdAt: "2026-03-10T10:00:00Z" },
  { id: "2", name: "John Smith", email: "john@example.com", category: "creative", status: "contacted", locale: "zh", sourcePage: "/creative", createdAt: "2026-03-09T14:30:00Z" },
];

const basePagination = { page: 1, totalPages: 1, total: 2, limit: 10 };
const noop = () => {};

describe("EoiTable", () => {
  it("renders table rows with correct data", () => {
    const html = renderToString(
      createElement(EoiTable, {
        items,
        pagination: basePagination,
        onPageChange: noop,
        onSearch: noop,
        onCategoryFilter: noop,
        onStatusFilter: noop,
      }),
    );
    expect(html).toContain("Jane Doe");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("producer");
    expect(html).toContain("John Smith");
  });

  it("renders empty state", () => {
    const html = renderToString(
      createElement(EoiTable, {
        items: [],
        pagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
        onPageChange: noop,
        onSearch: noop,
        onCategoryFilter: noop,
        onStatusFilter: noop,
      }),
    );
    expect(html).toContain("No expressions of interest found");
  });

  it("renders loading state", () => {
    const html = renderToString(
      createElement(EoiTable, {
        items: [],
        pagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
        onPageChange: noop,
        onSearch: noop,
        onCategoryFilter: noop,
        onStatusFilter: noop,
        loading: true,
      }),
    );
    expect(html).toContain("Loading...");
  });

  it("renders pagination controls for multiple pages", () => {
    const html = renderToString(
      createElement(EoiTable, {
        items,
        pagination: { page: 2, totalPages: 5, total: 50, limit: 10 },
        onPageChange: noop,
        onSearch: noop,
        onCategoryFilter: noop,
        onStatusFilter: noop,
      }),
    );
    expect(html).toContain("Page 2 of 5");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
  });

  it("renders search input and filter dropdowns", () => {
    const html = renderToString(
      createElement(EoiTable, {
        items,
        pagination: basePagination,
        onPageChange: noop,
        onSearch: noop,
        onCategoryFilter: noop,
        onStatusFilter: noop,
      }),
    );
    expect(html).toContain("Search by name or email");
    expect(html).toContain("All categories");
    expect(html).toContain("All statuses");
  });
});
