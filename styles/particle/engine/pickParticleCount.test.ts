import { describe, expect, it } from "vitest";
import { pickParticleCount } from "./ParticleEngine";

describe("pickParticleCount", () => {
  it("scales particle budget by viewport width", () => {
    expect(pickParticleCount(375)).toBe(5000);
    expect(pickParticleCount(767)).toBe(5000);
    expect(pickParticleCount(768)).toBe(10000);
    expect(pickParticleCount(1279)).toBe(10000);
    expect(pickParticleCount(1280)).toBe(16000);
  });
});
