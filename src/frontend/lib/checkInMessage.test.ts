import { describe, expect, it } from "vitest";
import { buildCheckInMessage } from "./checkInMessage";

describe("buildCheckInMessage", () => {
  it("formats with all fields", () => {
    expect(
      buildCheckInMessage({
        boss: "Scott",
        gateMin: 484,
        deskMin: 488,
        reason: "traffic at exit",
      })
    ).toBe(
      "Good morning Scott, quick check-in for today. Time to gate: 8:04, time to desk: 8:08. Reason: traffic at exit."
    );
  });

  it("uses em-dash for null times", () => {
    expect(
      buildCheckInMessage({
        boss: "Sam",
        gateMin: null,
        deskMin: null,
        reason: null,
      })
    ).toBe("Good morning Sam, quick check-in for today. Time to gate: —, time to desk: —.");
  });

  it("omits reason when null", () => {
    expect(
      buildCheckInMessage({
        boss: "Sam",
        gateMin: 480,
        deskMin: 485,
        reason: null,
      })
    ).toBe(
      "Good morning Sam, quick check-in for today. Time to gate: 8:00, time to desk: 8:05."
    );
  });

  it("falls back to 'Scott' when boss is empty / whitespace", () => {
    expect(
      buildCheckInMessage({
        boss: "",
        gateMin: 480,
        deskMin: 485,
        reason: null,
      })
    ).toContain("Good morning Scott");
    expect(
      buildCheckInMessage({
        boss: "   ",
        gateMin: 480,
        deskMin: 485,
        reason: null,
      })
    ).toContain("Good morning Scott");
  });
});
