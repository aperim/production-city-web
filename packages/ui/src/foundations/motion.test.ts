import { describe, expect, it } from "vitest";
import { getMotionDuration, motionDurationsMs, motionEasings } from "./motion";

describe("motion foundation", () => {
  it("uses the approved short-duration motion scale", () => {
    expect(motionDurationsMs).toEqual({
      instant: 0,
      hover: 100,
      enter: 150,
      exit: 150,
      emphasize: 200,
    });
  });

  it("exports the standard easing curves", () => {
    expect(motionEasings.standard).toBe("cubic-bezier(0.2, 0, 0, 1)");
    expect(motionEasings.emphasized).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });

  it("collapses motion to zero when reduced motion is requested", () => {
    expect(getMotionDuration("enter")).toBe(150);
    expect(getMotionDuration("enter", true)).toBe(0);
  });
});
