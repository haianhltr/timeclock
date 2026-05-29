import { describe, expect, it } from "vitest";
import { fmt, fmt2, toMin } from "./dates";

describe("dates", () => {
  it("toMin parses 'h:mm'", () => {
    expect(toMin("8:04")).toBe(484);
    expect(toMin("0:00")).toBe(0);
    expect(toMin(null)).toBeNull();
    expect(toMin("nope")).toBeNull();
  });

  it("fmt formats minutes without zero-padding the hour", () => {
    expect(fmt(484)).toBe("8:04");
    expect(fmt(0)).toBe("0:00");
    expect(fmt(null)).toBe("--:--");
  });

  it("fmt2 zero-pads both fields for input[type=time]", () => {
    expect(fmt2(484)).toBe("08:04");
    expect(fmt2(0)).toBe("00:00");
    expect(fmt2(null)).toBe("");
  });
});
