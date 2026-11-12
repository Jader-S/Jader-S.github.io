import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import CookieConsent from "@/styles/atelier/components/CookieConsent";
import { renderWithProviders, screen, waitFor, within } from "@/test/render";

const STORAGE_KEY = "portfolio-cookie-consent";

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows dialog when consent is unset", async () => {
    renderWithProviders(<CookieConsent />);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("我们使用 Cookie")).toBeInTheDocument();
  });

  it("hides after accept and stores choice", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CookieConsent />);

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "全部接受" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe("accepted");
  });

  it("stays hidden when consent already stored", async () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    const { container } = renderWithProviders(<CookieConsent />);

    await waitFor(() => {
      expect(container.querySelector('[role="dialog"]')).toBeNull();
    });
  });
});
