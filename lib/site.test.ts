import { describe, expect, it } from "vitest";
import { getSiteOrigin } from "./site";

describe("getSiteOrigin", () => {
  it("returns window origin when basePath is empty", () => {
    expect(getSiteOrigin()).toBe(window.location.origin);
  });
});
