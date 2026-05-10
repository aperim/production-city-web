import { describe, it, expect } from "vitest";
import { notificationMessage } from "../notification-message";

describe("notificationMessage", () => {
  it.each([
    ["approval_needed", "New user pending approval"],
    ["invitation_accepted", "Invitation accepted"],
    ["user_activated", "User account activated"],
    ["approval", "Action required: approval pending"],
    ["mention", "You were mentioned"],
    ["update", "You have a new update"],
    ["system", "System notification"],
  ] as const)('type "%s" → "%s"', (type, expected) => {
    expect(notificationMessage({ type })).toBe(expected);
  });

  it("unknown type returns generic message, never raw string", () => {
    const raw = "some_future_type";
    const result = notificationMessage({ type: raw });
    expect(result).toBe("You have a new notification");
    expect(result).not.toBe(raw);
  });
});
