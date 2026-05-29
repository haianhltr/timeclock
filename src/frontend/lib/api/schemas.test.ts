import { describe, expect, it } from "vitest";
import {
  configUpdateSchema,
  createEntrySchema,
  updateEntrySchema,
} from "./schemas";

describe("createEntrySchema", () => {
  it("accepts a minimal TIMED entry", () => {
    const parsed = createEntrySchema.parse({
      date: "2026-05-29",
      type: "TIMED",
      gate: 478,
      desk: 484,
    });
    expect(parsed.type).toBe("TIMED");
  });

  it("accepts a TIMED entry with optional fields", () => {
    const parsed = createEntrySchema.parse({
      date: "2026-05-29",
      type: "TIMED",
      gate: 480,
      desk: 495,
      reason: "traffic at exit",
      leftHome: 450,
      mood: 4,
    });
    if (parsed.type !== "TIMED") throw new Error("narrowing");
    expect(parsed.reason).toBe("traffic at exit");
    expect(parsed.mood).toBe(4);
  });

  it("rejects a TIMED entry missing gate/desk", () => {
    expect(() =>
      createEntrySchema.parse({ date: "2026-05-29", type: "TIMED" })
    ).toThrow();
  });

  it("accepts a NOTE entry", () => {
    const parsed = createEntrySchema.parse({
      date: "2026-05-19",
      type: "NOTE",
      note: "6:30am team meeting",
    });
    expect(parsed.type).toBe("NOTE");
  });

  it("rejects bad date format", () => {
    expect(() =>
      createEntrySchema.parse({
        date: "05/29/2026",
        type: "TIMED",
        gate: 480,
        desk: 485,
      })
    ).toThrow();
  });

  it("rejects out-of-range mood", () => {
    expect(() =>
      createEntrySchema.parse({
        date: "2026-05-29",
        type: "TIMED",
        gate: 480,
        desk: 485,
        mood: 6,
      })
    ).toThrow();
  });
});

describe("updateEntrySchema", () => {
  it("accepts an empty patch", () => {
    expect(updateEntrySchema.parse({})).toEqual({});
  });

  it("accepts a single-field patch", () => {
    expect(updateEntrySchema.parse({ reason: "rain" })).toEqual({
      reason: "rain",
    });
  });

  it("rejects unknown fields (strict)", () => {
    expect(() =>
      updateEntrySchema.parse({ type: "TIMED" } as unknown as object)
    ).toThrow();
  });
});

describe("configUpdateSchema", () => {
  it("accepts an empty patch", () => {
    expect(configUpdateSchema.parse({})).toEqual({});
  });

  it("accepts all fields", () => {
    expect(
      configUpdateSchema.parse({
        targetDesk: 500,
        targetGate: 490,
        boss: "Sam",
        accentHex: "#3f9d6e",
      })
    ).toEqual({
      targetDesk: 500,
      targetGate: 490,
      boss: "Sam",
      accentHex: "#3f9d6e",
    });
  });

  it("rejects malformed hex", () => {
    expect(() => configUpdateSchema.parse({ accentHex: "red" })).toThrow();
    expect(() => configUpdateSchema.parse({ accentHex: "#abc" })).toThrow();
  });

  it("rejects empty boss string", () => {
    expect(() => configUpdateSchema.parse({ boss: "" })).toThrow();
  });

  it("rejects unknown fields (strict)", () => {
    expect(() =>
      configUpdateSchema.parse({ accent: "#000000" } as unknown as object)
    ).toThrow();
    expect(() =>
      configUpdateSchema.parse({ targetMin: 480 } as unknown as object)
    ).toThrow();
  });
});
