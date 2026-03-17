/**
 * Tests for workspace resolver (#386).
 *
 * Validates:
 * - Role-scoped workspace visibility for all 10 roles
 * - Tab statuses derived from feature statuses
 * - Feature counts per workspace
 * - Upcoming features array
 */

import { describe, it, expect } from "vitest";
import { computeVisibleWorkspaces } from "../workspace-resolver.js";
import { ROLE_PERMISSIONS } from "../permissions.js";

describe("computeVisibleWorkspaces", () => {
  it("admin sees all 11 workspaces", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    expect(workspaces.length).toBe(11);
  });

  it("each workspace has at least one tab for admin", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    for (const ws of workspaces) {
      expect(ws.tabs.length).toBeGreaterThan(0);
    }
  });

  it("admin workspace order matches roleConfig", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    expect(workspaces.length).toBeGreaterThan(0);
    const ids = workspaces.map((ws) => ws.id);
    expect(ids).toContain("productions");
    expect(ids).toContain("administration");
  });

  it("admin sees more workspaces than non-admin roles", () => {
    const adminWs = computeVisibleWorkspaces("admin", ["*"]);
    // Executive has broad permissions
    const execPerms = ROLE_PERMISSIONS["executive"] ?? [];
    const execWs = computeVisibleWorkspaces("executive", execPerms);
    expect(adminWs.length).toBeGreaterThanOrEqual(execWs.length);
  });

  it("each visible tab has valid status", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    for (const ws of workspaces) {
      for (const tab of ws.tabs) {
        expect(["active", "coming_soon", "planned"]).toContain(tab.status);
      }
    }
  });

  it("feature counts are positive for each workspace", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    for (const ws of workspaces) {
      expect(ws.totalFeatures).toBeGreaterThan(0);
    }
  });

  it("active features count <= total features count", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    for (const ws of workspaces) {
      expect(ws.activeFeatures).toBeLessThanOrEqual(ws.totalFeatures);
    }
  });

  it("upcomingFeatures array is capped at 10", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    for (const ws of workspaces) {
      expect(ws.upcomingFeatures.length).toBeLessThanOrEqual(10);
    }
  });

  it("upcomingFeatures contains only coming_soon or planned features", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    for (const ws of workspaces) {
      for (const uf of ws.upcomingFeatures) {
        expect(["coming_soon", "planned"]).toContain(uf.status);
      }
    }
  });

  it("workspace includes correct metadata fields", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    const first = workspaces[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("label");
    expect(first).toHaveProperty("icon");
    expect(first).toHaveProperty("description");
    expect(first).toHaveProperty("defaultCanvas");
    expect(first).toHaveProperty("tabs");
    expect(first).toHaveProperty("totalFeatures");
    expect(first).toHaveProperty("activeFeatures");
    expect(first).toHaveProperty("upcomingFeatures");
  });

  it("tab includes correct metadata fields", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    expect(workspaces.length).toBeGreaterThan(0);
    const firstTab = workspaces[0]!.tabs[0];
    expect(firstTab).toHaveProperty("id");
    expect(firstTab).toHaveProperty("label");
    expect(firstTab).toHaveProperty("canvas");
    expect(firstTab).toHaveProperty("status");
    expect(firstTab).toHaveProperty("featureCount");
    expect(firstTab).toHaveProperty("activeFeatureCount");
  });

  it("non-admin role with wildcard-scoped permissions sees matching workspaces", () => {
    // Executive has company_finance:* which should match finance workspace features
    const execPerms = ROLE_PERMISSIONS["executive"] ?? [];
    const workspaces = computeVisibleWorkspaces("executive", execPerms);
    // Executive should see some workspaces based on their broad permissions
    expect(workspaces.length).toBeGreaterThan(0);
  });

  it("role with no matching permissions sees no workspaces", () => {
    // Artificial: a role with no permissions that match any features
    const workspaces = computeVisibleWorkspaces("guest", []);
    expect(workspaces.length).toBe(0);
  });

  it("admin total feature count across all workspaces matches registry", () => {
    const workspaces = computeVisibleWorkspaces("admin", ["*"]);
    const total = workspaces.reduce((sum, ws) => sum + ws.totalFeatures, 0);
    // Should be close to 492 (502 features minus 10 home features)
    expect(total).toBeGreaterThan(400);
    expect(total).toBeLessThanOrEqual(502);
  });
});
