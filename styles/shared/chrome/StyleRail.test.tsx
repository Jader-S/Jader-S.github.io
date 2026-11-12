import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import StyleRail from "@/styles/shared/chrome/StyleRail";
import { renderWithProviders, screen } from "@/test/render";

describe("StyleRail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("marks the current style and opens another style in a new window", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderWithProviders(<StyleRail />, { style: "atelier" });

    expect(screen.getByRole("navigation", { name: "页面风格" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "静奢" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    await user.click(screen.getByRole("link", { name: "经典" }));
    expect(open).toHaveBeenCalledWith("/classic", "_blank", "noopener,noreferrer");
  });
});
