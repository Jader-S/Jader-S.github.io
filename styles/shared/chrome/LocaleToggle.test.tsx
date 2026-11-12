import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import LocaleToggle from "@/styles/shared/chrome/LocaleToggle";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n";
import { renderWithProviders, screen } from "@/test/render";

describe("LocaleToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "zh-CN";
    document.documentElement.dataset.locale = "zh";
  });

  it("switches to English and updates html lang", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocaleToggle compact />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(document.documentElement.lang).toBe("en");
    expect(document.documentElement.dataset.locale).toBe("en");
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("en");
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
