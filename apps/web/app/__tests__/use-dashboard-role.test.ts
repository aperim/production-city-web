import { describe, expect, it } from "vitest";
import { resolveDashboardRole } from "../dashboard/use-dashboard-role";

describe("resolveDashboardRole", () => {
  it("returns admin when roles include admin", () => {
    expect(resolveDashboardRole(["staff", "admin"])).toBe("admin");
  });

  it("returns executive when roles include executive but not admin", () => {
    expect(resolveDashboardRole(["staff", "executive"])).toBe("executive");
  });

  it("returns guest when roles array is empty", () => {
    expect(resolveDashboardRole([])).toBe("guest");
  });

  it("returns guest when no recognized role is present", () => {
    expect(resolveDashboardRole(["unknown", "custom_role"])).toBe("guest");
  });

  it("returns staff for a staff-only user", () => {
    expect(resolveDashboardRole(["staff"])).toBe("staff");
  });

  it("returns government over client by priority", () => {
    expect(resolveDashboardRole(["client", "government"])).toBe("government");
  });

  it("returns first_nations when present with lower-priority roles", () => {
    expect(resolveDashboardRole(["staff", "first_nations"])).toBe("first_nations");
  });

  it("returns investor over vendor by priority", () => {
    expect(resolveDashboardRole(["vendor", "investor"])).toBe("investor");
  });

  it("returns partner over client", () => {
    expect(resolveDashboardRole(["client", "partner"])).toBe("partner");
  });

  it("maps super_admin to admin", () => {
    expect(resolveDashboardRole(["super_admin"])).toBe("admin");
  });

  it("maps super_admin correctly when combined with other roles", () => {
    expect(resolveDashboardRole(["staff", "super_admin"])).toBe("admin");
  });

  it("handles all 10 roles individually", () => {
    const allRoles = [
      "admin", "executive", "government", "investor", "partner",
      "first_nations", "vendor", "client", "staff", "guest",
    ];
    for (const role of allRoles) {
      expect(resolveDashboardRole([role])).toBe(role);
    }
  });
});
