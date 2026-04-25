import { describe, it, expect } from "vitest";
import { Level } from "../src/levels.js";

describe("Level constants", () => {
  it("EMERGENCY is 0 (highest severity)", () => {
    expect(Level.EMERGENCY).toBe(0);
  });

  it("ALERT is 1", () => {
    expect(Level.ALERT).toBe(1);
  });

  it("DEBUG is 7 (lowest severity)", () => {
    expect(Level.DEBUG).toBe(7);
  });

  it("severity order is ascending from EMERGENCY to DEBUG", () => {
    expect(Level.EMERGENCY).toBeLessThan(Level.ALERT);
    expect(Level.ALERT).toBeLessThan(Level.CRITICAL);
    expect(Level.CRITICAL).toBeLessThan(Level.ERROR);
    expect(Level.ERROR).toBeLessThan(Level.WARNING);
    expect(Level.WARNING).toBeLessThan(Level.NOTICE);
    expect(Level.NOTICE).toBeLessThan(Level.INFO);
    expect(Level.INFO).toBeLessThan(Level.DEBUG);
  });
});
