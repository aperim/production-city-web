import { describe, expect, it } from "vitest";
import { handleLegacyRedirect } from "../legacy-redirects";

describe("handleLegacyRedirect", () => {
  function makeUrl(path: string): URL {
    return new URL(`https://production.city${path}`);
  }

  it("redirects /dashboard/users to /dashboard/admin/users/manage", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/users"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(301);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/admin/users/manage",
    );
  });

  it("redirects /dashboard/invitations to /dashboard/admin/users/manage", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/invitations"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(301);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/admin/users/manage",
    );
  });

  it("redirects /dashboard/approvals to /dashboard/admin/users/manage", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/approvals"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(301);
  });

  it("redirects /dashboard/audit-log to /dashboard/admin/audit/logs", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/audit-log"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(301);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/admin/audit/logs",
    );
  });

  it("redirects /dashboard/announcements to /dashboard/comms/internal/announcements", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/announcements"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(301);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/comms/internal/announcements",
    );
  });

  it("returns null for non-legacy paths", () => {
    expect(handleLegacyRedirect(makeUrl("/dashboard"))).toBeNull();
    expect(handleLegacyRedirect(makeUrl("/dashboard/profile"))).toBeNull();
    expect(handleLegacyRedirect(makeUrl("/dashboard/admin/users/manage"))).toBeNull();
    expect(handleLegacyRedirect(makeUrl("/"))).toBeNull();
  });

  it("preserves query parameters in redirect", () => {
    const url = makeUrl("/dashboard/users");
    url.searchParams.set("page", "2");
    const response = handleLegacyRedirect(url);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/admin/users/manage?page=2",
    );
  });
});
