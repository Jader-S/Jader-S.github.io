import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PORTFOLIO_REPO_URL, buildSkillSharePrompt, copyText } from "./skillShare";

describe("buildSkillSharePrompt", () => {
  it("builds a Chinese prompt for atelier", () => {
    const prompt = buildSkillSharePrompt("atelier", "zh");
    expect(prompt).toContain(PORTFOLIO_REPO_URL);
    expect(prompt).toContain("静奢（atelier）");
    expect(prompt).toContain("/portfolio-atelier");
    expect(prompt).toContain(".cursor/skills/portfolio-atelier/SKILL.md");
  });

  it("builds an English prompt for classic", () => {
    const prompt = buildSkillSharePrompt("classic", "en");
    expect(prompt).toContain(PORTFOLIO_REPO_URL);
    expect(prompt).toContain("Classic");
    expect(prompt).toContain("/portfolio-classic");
    expect(prompt).toContain("Please scaffold my personal portfolio");
  });

  it("uses particle skill path for particle style", () => {
    const prompt = buildSkillSharePrompt("particle", "en");
    expect(prompt).toContain("styles/particle");
    expect(prompt).toContain("/portfolio-particle");
  });

  it("builds a Chinese prompt for blueprint", () => {
    const prompt = buildSkillSharePrompt("blueprint", "zh");
    expect(prompt).toContain("蓝图（blueprint）");
    expect(prompt).toContain("/portfolio-blueprint");
    expect(prompt).toContain(".cursor/skills/portfolio-blueprint/SKILL.md");
  });
});

describe("copyText", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: { writeText },
    });

    await expect(copyText("hello")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when clipboard fails", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error("denied")),
      },
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: execCommand,
    });

    await expect(copyText("fallback")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.body.querySelector("textarea")).toBeNull();
  });

  it("returns false when both strategies fail", async () => {
    vi.stubGlobal("navigator", { clipboard: undefined });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: vi.fn(() => {
        throw new Error("unsupported");
      }),
    });

    await expect(copyText("nope")).resolves.toBe(false);
  });
});
