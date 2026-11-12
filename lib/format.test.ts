import { describe, expect, it } from "vitest";
import { formatCount } from "./format";

describe("formatCount", () => {
  it("keeps small numbers as-is", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("formats thousands with one decimal", () => {
    expect(formatCount(1000)).toBe("1.0k");
    expect(formatCount(1500)).toBe("1.5k");
    expect(formatCount(12500)).toBe("12.5k");
  });
});
