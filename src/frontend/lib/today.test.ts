import { describe, expect, it } from "vitest";
import { todayIso } from "./today";

describe("todayIso", () => {
  it("formats local-date as YYYY-MM-DD", () => {
    expect(todayIso(new Date(2026, 4, 29))).toBe("2026-05-29");
  });
  it("zero-pads single-digit month/day", () => {
    expect(todayIso(new Date(2026, 0, 3))).toBe("2026-01-03");
  });
});
