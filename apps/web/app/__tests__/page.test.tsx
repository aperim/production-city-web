import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";

// Mock vinext server shims
vi.mock("vinext/shims/headers", () => ({
  headers: () => Promise.resolve(new Map([["X-Locale", "en"]])),
}));

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
  it("renders without crashing", async () => {
    const result = await Page();
    const html = renderToString(result);
    expect(html).toContain("Production City");
  });
});
