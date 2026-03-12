import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { App } from "../App.js";

describe("App", () => {
  it("renders without crashing", () => {
    const html = renderToString(createElement(App));
    expect(html).toContain("Production City");
  });
});
