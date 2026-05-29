import { describe, expect, it } from "vitest";
import { computeMetrics, TARGET_DEFAULT } from "./metrics";
import type { SerializedEntry } from "./api/types";

function timed(
  date: string,
  gate: number,
  desk: number,
  extra: Partial<SerializedEntry> = {}
): SerializedEntry {
  return {
    date,
    type: "TIMED",
    gate,
    desk,
    reason: null,
    leftHome: null,
    mood: null,
    note: null,
    createdAt: "",
    updatedAt: "",
    ...extra,
  };
}

function note(date: string, text: string): SerializedEntry {
  return {
    date,
    type: "NOTE",
    gate: null,
    desk: null,
    reason: null,
    leftHome: null,
    mood: null,
    note: text,
    createdAt: "",
    updatedAt: "",
  };
}

describe("computeMetrics", () => {
  it("returns zeroes for an empty list", () => {
    const m = computeMetrics([]);
    expect(m.withDur).toEqual([]);
    expect(m.onTimeCount).toBe(0);
    expect(m.lateCount).toBe(0);
    expect(m.onTimePct).toBe(0);
    expect(m.curStreak).toBe(0);
    expect(m.best).toBe(0);
  });

  it("ignores NOTE entries", () => {
    const m = computeMetrics([
      timed("2026-05-11", 480, 484),
      note("2026-05-12", "team day"),
    ]);
    expect(m.withDur).toHaveLength(1);
  });

  it("computes on-time vs late against target", () => {
    const m = computeMetrics(
      [
        timed("2026-05-11", 480, 484),
        timed("2026-05-12", 478, 489),
        timed("2026-05-13", 477, 480),
      ],
      485
    );
    expect(m.onTimeCount).toBe(2);
    expect(m.lateCount).toBe(1);
    expect(m.onTimePct).toBe(67);
  });

  it("computes dur and averages", () => {
    const m = computeMetrics([
      timed("2026-05-11", 480, 486),
      timed("2026-05-12", 470, 480),
    ]);
    expect(m.avgDur).toBe(8);
    expect(m.avgDesk).toBe(483);
    expect(m.avgGate).toBe(475);
  });

  it("tracks current and best streak", () => {
    // late breaks streak in the middle, then 2 on-time
    const m = computeMetrics(
      [
        timed("2026-05-11", 480, 480),
        timed("2026-05-12", 480, 482),
        timed("2026-05-13", 480, 490), // late
        timed("2026-05-14", 480, 480),
        timed("2026-05-15", 480, 483),
      ],
      485
    );
    expect(m.best).toBe(2);
    expect(m.curStreak).toBe(2);
  });

  it("groups average by weekday (Mon-Fri)", () => {
    const m = computeMetrics([
      // 2026-05-11 is a Monday
      timed("2026-05-11", 480, 480),
      timed("2026-05-18", 480, 488),
    ]);
    const mon = m.byWd.find((d) => d.day === "Mon");
    expect(mon?.n).toBe(2);
    expect(mon?.avg).toBe(484);
  });

  it("counts and sorts reasons by frequency", () => {
    const m = computeMetrics([
      timed("2026-05-11", 480, 488, { reason: "traffic" }),
      timed("2026-05-12", 480, 489, { reason: "traffic" }),
      timed("2026-05-13", 480, 487, { reason: "rain" }),
    ]);
    expect(m.reasonDays).toBe(3);
    expect(m.reasons[0]).toEqual({ reason: "traffic", n: 2 });
    expect(m.reasons[1]).toEqual({ reason: "rain", n: 1 });
  });

  it("defaults target to TARGET_DEFAULT", () => {
    const m = computeMetrics([timed("2026-05-11", 480, 486)]);
    expect(m.target).toBe(TARGET_DEFAULT);
    expect(m.lateCount).toBe(1);
  });

  it("compares against desk when metric is desk (default)", () => {
    // gate=478 (early), desk=490 (late at 485). Should be late.
    const m = computeMetrics([timed("2026-05-11", 478, 490)], 485, "desk");
    expect(m.lateCount).toBe(1);
    expect(m.withDur[0].value).toBe(490);
  });

  it("compares against gate when metric is gate", () => {
    // gate=478, desk=490. Against gate target 480, gate is on-time.
    const m = computeMetrics([timed("2026-05-11", 478, 490)], 480, "gate");
    expect(m.onTimeCount).toBe(1);
    expect(m.lateCount).toBe(0);
    expect(m.withDur[0].value).toBe(478);
  });

  it("weekday averages reflect the selected metric", () => {
    const entries = [timed("2026-05-11", 470, 490)]; // Monday
    const deskM = computeMetrics(entries, 485, "desk");
    const gateM = computeMetrics(entries, 480, "gate");
    expect(deskM.byWd.find((d) => d.day === "Mon")?.avg).toBe(490);
    expect(gateM.byWd.find((d) => d.day === "Mon")?.avg).toBe(470);
  });
});
