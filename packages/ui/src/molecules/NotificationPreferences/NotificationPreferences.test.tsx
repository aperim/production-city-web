import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { NotificationPreferences } from "./NotificationPreferences";

const prefs = [
  { channel: "admin:eoi", label: "New EOI", enabled: true },
  { channel: "admin:approvals", label: "Approvals", enabled: false },
];

describe("NotificationPreferences", () => {
  it("renders all channel labels", () => {
    const html = renderToString(createElement(NotificationPreferences, { preferences: prefs }));
    expect(html).toContain("New EOI");
    expect(html).toContain("Approvals");
  });

  it("renders title and description", () => {
    const html = renderToString(
      createElement(NotificationPreferences, {
        preferences: prefs,
        title: "Custom title",
        description: "Custom desc",
      }),
    );
    expect(html).toContain("Custom title");
    expect(html).toContain("Custom desc");
  });

  it("reflects enabled/disabled state via aria-checked", () => {
    const html = renderToString(createElement(NotificationPreferences, { preferences: prefs }));
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('aria-checked="false"');
  });
});
