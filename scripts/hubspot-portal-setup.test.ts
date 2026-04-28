import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const script = readFileSync(resolve("scripts/hubspot-portal-setup.sh"), "utf8");

describe("hubspot portal setup script", () => {
  it("checks required local tools before calling HubSpot", () => {
    expect(script).toContain('command -v "$command_name"');
    expect(script).toContain("require_command curl");
    expect(script).toContain("require_command jq");
  });

  it("fails visibly instead of continuing after unexpected API statuses", () => {
    expect(script).toContain("fail_api_status");
    expect(script).not.toContain("WARNING: unexpected status");
    expect(script).not.toContain("WARNING: status");
  });

  it("skips existing persona lists before attempting creation", () => {
    expect(script).toContain('if [[ -n "$existing" ]]; then');
    expect(script).toContain("already exists (listId:");
  });

  it("checks for an existing mirrored form before creating a new one", () => {
    expect(script).toContain('existing_form_id=$(find_existing_form_id');
    expect(script).toContain("already exists (formId:");
  });
});
