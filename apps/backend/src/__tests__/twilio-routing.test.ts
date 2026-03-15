/**
 * Tests for Twilio sender route prefix matching.
 */

import { describe, it, expect } from "vitest";
import { selectSenderRoute, type SenderRoute } from "../lib/twilio-routing.js";

const routes: SenderRoute[] = [
  { phoneNumber: "+12125550001", prefixes: ["+1"], isDefault: true },
  { phoneNumber: "+61400000000", prefixes: ["+61", "+62"], isDefault: false },
  { phoneNumber: "+8613800000000", prefixes: ["+86"], isDefault: false },
];

describe("selectSenderRoute", () => {
  it("matches US number to +1 prefix", () => {
    const result = selectSenderRoute("+14155552671", routes);
    expect(result?.phoneNumber).toBe("+12125550001");
  });

  it("matches Australian number to +61 prefix", () => {
    const result = selectSenderRoute("+61400123456", routes);
    expect(result?.phoneNumber).toBe("+61400000000");
  });

  it("matches Indonesian number to +62 prefix", () => {
    const result = selectSenderRoute("+628123456789", routes);
    expect(result?.phoneNumber).toBe("+61400000000");
  });

  it("matches Chinese number to +86 prefix", () => {
    const result = selectSenderRoute("+8613900000000", routes);
    expect(result?.phoneNumber).toBe("+8613800000000");
  });

  it("falls back to default for unmatched prefix", () => {
    const result = selectSenderRoute("+447700900000", routes);
    expect(result?.phoneNumber).toBe("+12125550001");
    expect(result?.isDefault).toBe(true);
  });

  it("returns null when no match and no default", () => {
    const noDefault: SenderRoute[] = [
      { phoneNumber: "+61400000000", prefixes: ["+61"], isDefault: false },
    ];
    const result = selectSenderRoute("+447700900000", noDefault);
    expect(result).toBeNull();
  });

  it("selects longest prefix match", () => {
    const overlapping: SenderRoute[] = [
      { phoneNumber: "+12125550001", prefixes: ["+1"], isDefault: true },
      { phoneNumber: "+14155550001", prefixes: ["+1415"], isDefault: false },
    ];
    const result = selectSenderRoute("+14155552671", overlapping);
    expect(result?.phoneNumber).toBe("+14155550001");
  });
});
