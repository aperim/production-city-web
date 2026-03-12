import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import Page from "../page";

describe("Page", () => {
  it("renders without crashing", () => {
    const html = renderToString(createElement(Page));
    expect(html).toContain("Production City");
  });
});
