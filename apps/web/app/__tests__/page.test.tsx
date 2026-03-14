import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

// Mock the i18n context to avoid needing a full I18nProvider
vi.mock("../i18n/context", () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en",
    direction: "ltr",
    setLocale: vi.fn(),
  }),
}));

// Mock the api-client to avoid fetch calls
vi.mock("../lib/api-client", () => ({
  submitEoi: vi.fn(),
}));

import Page from "../page";

describe("Page", () => {
  it("renders without crashing", () => {
    const html = renderToString(createElement(Page));
    expect(html).toContain("Production City");
  });
});
