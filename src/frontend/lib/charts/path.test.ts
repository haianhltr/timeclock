import { describe, expect, it } from "vitest";
import { smoothPath } from "./path";

describe("smoothPath", () => {
  it("returns empty string for no points", () => {
    expect(smoothPath([])).toBe("");
  });

  it("returns just M for a single point", () => {
    expect(smoothPath([{ x: 1, y: 2 }])).toBe("M 1 2");
  });

  it("emits one C segment for two points", () => {
    const d = smoothPath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(d.startsWith("M 0 0")).toBe(true);
    expect((d.match(/ C /g) || []).length).toBe(1);
  });

  it("emits N-1 C segments for N points", () => {
    const d = smoothPath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
      { x: 30, y: 5 },
    ]);
    expect((d.match(/ C /g) || []).length).toBe(3);
  });
});
