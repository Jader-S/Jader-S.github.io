import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import StyleRail from "@/styles/shared/chrome/StyleRail";
import { renderWithProviders, screen } from "@/test/render";

describe("StyleRail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("marks the current style and links to another style in the same tab", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderWithProviders(<StyleRail />, { style: "atelier" });

    expect(screen.getByRole("navigation", { name: "页面风格" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "静奢" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    const classicLink = screen.getByRole("link", { name: "经典" });
    expect(classicLink).toHaveAttribute("href", "/classic");
    expect(classicLink).not.toHaveAttribute("target");

    // The active tab must not reload/navigate; real cross-style navigation is
    // covered by e2e (rails.spec.ts) since jsdom cannot follow a document load.
    await user.click(screen.getByRole("link", { name: "静奢" }));
    expect(open).not.toHaveBeenCalled();
  });
});
