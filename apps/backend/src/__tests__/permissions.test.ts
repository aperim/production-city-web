/**
 * Tests for permission resolution logic.
 * Covers: matchPermission, resolveDashboardRole, resolveUserPermissions, computeVisibleFeatures, canAccessFeature
 */

import { describe, it, expect } from "vitest";
import {
  matchPermission,
  resolveDashboardRole,
  resolveUserPermissions,
  computeVisibleFeatures,
  canAccessFeature,
  ROLE_PERMISSIONS,
  isValidFeatureId,
} from "../lib/permissions.js";

describe("matchPermission", () => {
  it("matches exact permission", () => {
    expect(matchPermission("hr:read", "hr:read")).toBe(true);
  });

  it("rejects non-matching permission", () => {
    expect(matchPermission("hr:read", "hr:write")).toBe(false);
  });

  it("matches wildcard permission", () => {
    expect(matchPermission("hr:*", "hr:read")).toBe(true);
    expect(matchPermission("hr:*", "hr:admin")).toBe(true);
  });

  it("global wildcard matches anything", () => {
    expect(matchPermission("*", "hr:read")).toBe(true);
    expect(matchPermission("*", "anything:at:all")).toBe(true);
  });

  it("self-scoped permission matches base", () => {
    expect(matchPermission("hr:read:self", "hr:read")).toBe(true);
  });

  it("own-scoped permission matches base", () => {
    expect(matchPermission("productions:read:own", "productions:read")).toBe(true);
  });

  it("rejects wrong resource even with wildcard action", () => {
    expect(matchPermission("hr:*", "legal:read")).toBe(false);
  });

  it("rejects partial prefix match", () => {
    expect(matchPermission("hr", "hr:read")).toBe(false);
  });
});

describe("resolveDashboardRole", () => {
  it("detects admin from wildcard", () => {
    expect(resolveDashboardRole(["*"])).toBe("admin");
  });

  it("detects admin from dashboard:admin", () => {
    expect(resolveDashboardRole(["dashboard:admin", "user:read"])).toBe("admin");
  });

  it("detects executive from dashboard:executive", () => {
    expect(resolveDashboardRole(["dashboard:executive", "hr:read"])).toBe("executive");
  });

  it("detects guest from dashboard:guest", () => {
    expect(resolveDashboardRole(["dashboard:guest"])).toBe("guest");
  });

  it("falls back to guest for unknown permissions", () => {
    expect(resolveDashboardRole(["some:other:perm"])).toBe("guest");
  });

  it("falls back to guest for empty permissions", () => {
    expect(resolveDashboardRole([])).toBe("guest");
  });

  it("detects all 10 roles", () => {
    const roles = [
      "admin", "executive", "staff", "client", "vendor",
      "investor", "guest", "government", "partner", "first_nations",
    ];
    for (const role of roles) {
      const detected = resolveDashboardRole([`dashboard:${role}`]);
      expect(detected).toBe(role);
    }
  });
});

describe("resolveUserPermissions", () => {
  it("returns base permissions for known role", () => {
    const perms = resolveUserPermissions("guest", []);
    expect(perms).toContain("dashboard:guest");
    expect(perms).toContain("events:browse");
    expect(perms).toContain("education:browse");
  });

  it("merges custom permissions with role base", () => {
    const perms = resolveUserPermissions("staff", ["facilities:book"]);
    expect(perms).toContain("dashboard:staff");
    expect(perms).toContain("facilities:book");
  });

  it("deduplicates permissions", () => {
    const perms = resolveUserPermissions("guest", ["dashboard:guest"]);
    const count = perms.filter((p) => p === "dashboard:guest").length;
    expect(count).toBe(1);
  });

  it("returns only custom perms for unknown role", () => {
    const perms = resolveUserPermissions("unknown_role", ["custom:perm"]);
    expect(perms).toEqual(["custom:perm"]);
  });
});

describe("canAccessFeature", () => {
  const feature = {
    id: "company_ops.hr.directory",
    path: "/dashboard/company/hr/directory",
    roles: ["admin", "executive", "staff"],
    permissions: ["hr:read"],
    status: "planned",
    phase: "company_formation",
  };

  it("admin bypasses all checks", () => {
    expect(canAccessFeature("admin", [], feature)).toBe(true);
  });

  it("executive with matching permission", () => {
    expect(canAccessFeature("executive", ["hr:read"], feature)).toBe(true);
  });

  it("staff with self-scoped permission", () => {
    expect(canAccessFeature("staff", ["hr:read:self"], feature)).toBe(true);
  });

  it("guest denied (role not in feature.roles)", () => {
    expect(canAccessFeature("guest", ["dashboard:guest"], feature)).toBe(false);
  });

  it("vendor denied (role not in feature.roles)", () => {
    expect(canAccessFeature("vendor", ["vendors:read:self"], feature)).toBe(false);
  });

  it("staff denied without matching permission", () => {
    expect(canAccessFeature("staff", ["dashboard:staff"], feature)).toBe(false);
  });
});

describe("computeVisibleFeatures", () => {
  it("admin sees all 502 features", () => {
    const visible = computeVisibleFeatures("admin", []);
    expect(visible.length).toBe(502);
  });

  it("guest sees minimal set", () => {
    const visible = computeVisibleFeatures("guest", []);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThan(50);
  });

  it("executive sees more than guest", () => {
    const execVisible = computeVisibleFeatures("executive", []);
    const guestVisible = computeVisibleFeatures("guest", []);
    expect(execVisible.length).toBeGreaterThan(guestVisible.length);
  });

  it("staff with custom permission sees extra features", () => {
    const baseVisible = computeVisibleFeatures("staff", []);
    const customVisible = computeVisibleFeatures("staff", ["facilities:book"]);
    expect(customVisible.length).toBeGreaterThanOrEqual(baseVisible.length);
  });

  it("returns only strings", () => {
    const visible = computeVisibleFeatures("investor", []);
    visible.forEach((id) => expect(typeof id).toBe("string"));
  });

  it("all 10 roles return non-empty feature lists", () => {
    const roles = Object.keys(ROLE_PERMISSIONS);
    expect(roles.length).toBe(10);
    for (const role of roles) {
      const visible = computeVisibleFeatures(role, []);
      expect(visible.length).toBeGreaterThan(0);
    }
  });

  it("performance: resolves 502 features in under 50ms for each role", () => {
    const roles = Object.keys(ROLE_PERMISSIONS);
    for (const role of roles) {
      const start = performance.now();
      computeVisibleFeatures(role, []);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
    }
  });
});

describe("isValidFeatureId", () => {
  it("recognises valid feature ID", () => {
    expect(isValidFeatureId("home.overview.executive")).toBe(true);
  });

  it("rejects invalid feature ID", () => {
    expect(isValidFeatureId("nonexistent.feature.xyz")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidFeatureId("")).toBe(false);
  });
});
