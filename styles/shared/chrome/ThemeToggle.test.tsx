import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/styles/shared/chrome/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { renderWithProviders, screen } from "@/test/render";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-mode");
  });

  it("switches to dark mode and persists", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle compact />);

    await user.click(screen.getByRole("button", { name: "深色" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.themeMode).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "深色" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
