import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { EoiDetailPanel } from "./EoiDetailPanel";

const sampleEoi = {
  id: "eoi-1",
  category: "producer",
  status: "new",
  locale: "en",
  name: "Jane Doe",
  email: "jane@example.com",
  message: "Interested in partnership",
  metadata: { company: "Test Co" },
  sourcePage: "/creative",
  sourceCategory: "film",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: "q1",
  consentVersion: "1.0",
  privacyAcceptedAt: "2026-03-10T10:00:00Z",
  marketingOptIn: true,
  confirmationSentAt: "2026-03-10T10:01:00Z",
  createdAt: "2026-03-10T10:00:00Z",
  updatedAt: "2026-03-10T10:00:00Z",
  archivedAt: null,
};

describe("EoiDetailPanel", () => {
  it("renders nothing when closed", () => {
    const html = renderToString(
      createElement(EoiDetailPanel, { open: false, onClose: () => {}, eoi: null }),
    );
    expect(html).toBe("");
  });

  it("renders all fields when open", () => {
    const html = renderToString(
      createElement(EoiDetailPanel, { open: true, onClose: () => {}, eoi: sampleEoi }),
    );
    expect(html).toContain("Jane Doe");
    expect(html).toContain("jane@example.com");
    expect(html).toContain("producer");
    expect(html).toContain("Interested in partnership");
    expect(html).toContain("google"); // UTM source
    expect(html).toContain("1.0"); // consent version
  });

  it("shows status dropdown when canUpdateStatus", () => {
    const html = renderToString(
      createElement(EoiDetailPanel, {
        open: true,
        onClose: () => {},
        eoi: sampleEoi,
        canUpdateStatus: true,
        onStatusUpdate: () => {},
      }),
    );
    expect(html).toContain("Update status");
    expect(html).toContain("<select");
  });

  it("hides status dropdown when not canUpdateStatus", () => {
    const html = renderToString(
      createElement(EoiDetailPanel, {
        open: true,
        onClose: () => {},
        eoi: sampleEoi,
        canUpdateStatus: false,
      }),
    );
    expect(html).not.toContain("Update status");
  });
});
