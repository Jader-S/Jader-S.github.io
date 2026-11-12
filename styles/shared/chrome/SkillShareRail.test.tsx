import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import SkillShareRail from "@/styles/shared/chrome/SkillShareRail";
import { renderWithProviders, screen, waitFor } from "@/test/render";

describe("SkillShareRail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("copies the skill prompt and shows success state", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText },
    });

    renderWithProviders(<SkillShareRail />, { style: "atelier" });

    await user.click(screen.getByRole("button", { name: "复制 Skill 提示词" }));

    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toHaveTextContent("已复制");
    });
    expect(writeText).toHaveBeenCalled();
    expect(writeText.mock.calls[0][0]).toContain(
      "https://github.com/Jader-S/astra-portfolio"
    );
  });
});
