import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FeatureGate } from "../dashboard/components/FeatureGate";

// The FeatureGate uses DASHBOARD_ROUTES and FEATURE_INDEX from generated files.
// For testing, we verify behavior with real generated data.

describe("FeatureGate", () => {
  // Use a feature ID that exists in the generated routes
  const existingFeatureId = "company_ops.hr.directory";
  const allFeatureIds = [existingFeatureId];

  it("renders ComingSoonPage for planned features (not children)", () => {
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: existingFeatureId, visibleFeatureIds: allFeatureIds },
        createElement("div", null, "Active content"),
      ),
    );
    // Team Directory is "planned" in the registry, so ComingSoonPage should render
    expect(html).toContain("Team Directory");
    expect(html).not.toContain("Active content");
  });

  it("returns null for unknown feature ID", () => {
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: "nonexistent.feature.id", visibleFeatureIds: allFeatureIds },
        createElement("div", null, "Should not render"),
      ),
    );
    expect(html).toBe("");
  });

  it("returns null when feature is not in visible list", () => {
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: existingFeatureId, visibleFeatureIds: [] },
        createElement("div", null, "Should not render"),
      ),
    );
    expect(html).toBe("");
  });

  it("renders feature label and description for planned features", () => {
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: existingFeatureId, visibleFeatureIds: allFeatureIds },
        createElement("div", null, "Active content"),
      ),
    );
    // Team Directory is "planned" in the registry
    expect(html).toContain("Team Directory");
    // Should contain the description from feature index
    expect(html).toContain("directory");
  });

  it("shows related features from same subsection", () => {
    // Give visibility to multiple HR features
    const hrFeatures = [
      "company_ops.hr.directory",
      "company_ops.hr.org_chart",
      "company_ops.hr.recruitment",
    ];
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: "company_ops.hr.directory", visibleFeatureIds: hrFeatures },
        createElement("div", null, "Active content"),
      ),
    );
    // Should show related features section
    expect(html).toContain("Related Features");
  });

  it("does not show the gated feature in related features", () => {
    const hrFeatures = [
      "company_ops.hr.directory",
      "company_ops.hr.org_chart",
    ];
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: "company_ops.hr.directory", visibleFeatureIds: hrFeatures },
        createElement("div", null, "Active content"),
      ),
    );
    // The "Organisation Chart" should be in related, but not "Team Directory" link
    // The feature path for directory is /dashboard/company/hr/directory
    // Check that the self-link doesn't appear in related features list
    // The feature name "Team Directory" appears in the main section, but the related
    // feature link to /dashboard/company/hr/directory should not exist
    const relatedSection = html.split("Related Features")[1];
    if (relatedSection) {
      expect(relatedSection).not.toContain("/dashboard/company/hr/directory");
    }
  });

  it("does not leak unauthorized feature IDs", () => {
    // Only directory is visible, but we're asking for org_chart
    const html = renderToString(
      createElement(
        FeatureGate,
        { featureId: "company_ops.hr.org_chart", visibleFeatureIds: ["company_ops.hr.directory"] },
        createElement("div", null, "Should not render"),
      ),
    );
    expect(html).toBe("");
  });
});
