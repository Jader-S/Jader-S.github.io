import { describe, expect, it } from "vitest";
import { phaseFromMorph } from "./easing";

describe("phaseFromMorph", () => {
  it("returns idle at boundaries", () => {
    expect(phaseFromMorph(0)).toBe("idle");
    expect(phaseFromMorph(1)).toBe("idle");
    expect(phaseFromMorph(-0.1)).toBe("idle");
    expect(phaseFromMorph(1.2)).toBe("idle");
  });

  it("maps mid-range morph into explode/transit/reform", () => {
    expect(phaseFromMorph(0.1)).toBe("explode");
    expect(phaseFromMorph(0.31)).toBe("explode");
    expect(phaseFromMorph(0.32)).toBe("transit");
    expect(phaseFromMorph(0.61)).toBe("transit");
    expect(phaseFromMorph(0.62)).toBe("reform");
    expect(phaseFromMorph(0.99)).toBe("reform");
  });
});
