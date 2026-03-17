import { describe, expect, it } from "vitest";
import { handleLegacyRedirect } from "../legacy-redirects";

describe("handleLegacyRedirect", () => {
  function makeUrl(path: string): URL {
    return new URL(`https://production.city${path}`);
  }

  // --- Static redirects ---

  it("redirects /dashboard/announcements to /dashboard/administration/communications", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/announcements"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications",
    );
  });

  it("redirects /dashboard/announcements/new to /dashboard/administration/communications/new", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/announcements/new"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications/new",
    );
  });

  it("redirects /dashboard/categories to /dashboard/administration/communications?view=categories", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/categories"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications?view=categories",
    );
  });

  it("redirects /dashboard/tags to /dashboard/administration/communications?view=tags", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/tags"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications?view=tags",
    );
  });

  it("redirects /dashboard/subscriptions-admin to /dashboard/administration/communications?view=subscriptions", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/subscriptions-admin"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications?view=subscriptions",
    );
  });

  it("redirects /dashboard/users to /dashboard/administration/users", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/users"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/users",
    );
  });

  it("redirects /dashboard/invitations to /dashboard/administration/users?view=invitations", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/invitations"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/users?view=invitations",
    );
  });

  it("redirects /dashboard/approvals to /dashboard/administration/users?view=approvals", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/approvals"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/users?view=approvals",
    );
  });

  it("redirects /dashboard/audit-log to /dashboard/administration/security", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/audit-log"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/security",
    );
  });

  it("redirects /dashboard/eoi to /dashboard/partnerships/eoi", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/eoi"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/partnerships/eoi",
    );
  });

  // --- Dynamic announcement redirects ---

  it("redirects /dashboard/announcements/:id to /dashboard/administration/communications/:id", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/announcements/abc-123"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications/abc-123",
    );
  });

  it("redirects /dashboard/announcements/:id/edit to /dashboard/administration/communications/:id/edit", () => {
    const response = handleLegacyRedirect(makeUrl("/dashboard/announcements/abc-123/edit"));
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/communications/abc-123/edit",
    );
  });

  // --- Non-legacy paths ---

  it("returns null for non-legacy paths", () => {
    expect(handleLegacyRedirect(makeUrl("/dashboard"))).toBeNull();
    expect(handleLegacyRedirect(makeUrl("/dashboard/profile"))).toBeNull();
    expect(handleLegacyRedirect(makeUrl("/dashboard/administration/users"))).toBeNull();
    expect(handleLegacyRedirect(makeUrl("/"))).toBeNull();
  });

  // --- Query parameter preservation ---

  it("preserves query parameters in redirect", () => {
    const url = makeUrl("/dashboard/users");
    url.searchParams.set("page", "2");
    const response = handleLegacyRedirect(url);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/dashboard/administration/users?page=2",
    );
  });

  it("merges query parameters for redirects with built-in query strings", () => {
    const url = makeUrl("/dashboard/categories");
    url.searchParams.set("sort", "name");
    const response = handleLegacyRedirect(url);
    const location = response!.headers.get("Location")!;
    expect(location).toContain("view=categories");
    expect(location).toContain("sort=name");
  });
});
