import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import StyleRail from "@/styles/shared/chrome/StyleRail";
import { fireEvent, renderWithProviders, screen, waitFor, within } from "@/test/render";

const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 390;

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  setViewportWidth(DESKTOP_WIDTH);
  document.body.style.overflow = "";
});

afterEach(() => {
  setViewportWidth(DESKTOP_WIDTH);
  document.body.style.overflow = "";
});

describe("StyleRail", () => {
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

  it("collapses into an edge handle that opens a five-style drawer on mobile", async () => {
    setViewportWidth(MOBILE_WIDTH);
    const user = userEvent.setup();
    renderWithProviders(<StyleRail />, { style: "atelier" });

    const handle = screen.getByRole("button", { name: "展开风格切换" });
    expect(handle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(handle);

    const dialog = await screen.findByRole("dialog", { name: "切换页面风格" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(handle).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getAllByRole("link")).toHaveLength(5);
    expect(within(dialog).getByRole("link", { name: /静奢/ })).toHaveAttribute(
      "aria-current",
      "page"
    );

    const classic = within(dialog).getByRole("link", { name: /经典/ });
    expect(classic).toHaveAttribute("href", "/classic");
    expect(classic).not.toHaveAttribute("target");
  });

  it("dismisses the drawer via overlay click, Escape and the close button", async () => {
    setViewportWidth(MOBILE_WIDTH);
    const user = userEvent.setup();
    renderWithProviders(<StyleRail />, { style: "atelier" });
    const handle = () =>
      screen.getByRole("button", { name: /展开风格切换|收起风格切换/ });

    await user.click(handle());
    const overlay = (await screen.findByRole("dialog")).parentElement;
    expect(overlay).not.toBeNull();
    fireEvent.mouseDown(overlay!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(handle());
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(handle());
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "收起风格切换" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks body scroll while open, restores it and returns focus to the handle", async () => {
    setViewportWidth(MOBILE_WIDTH);
    const user = userEvent.setup();
    renderWithProviders(<StyleRail />, { style: "atelier" });
    const handle = screen.getByRole("button", { name: "展开风格切换" });

    await user.click(handle);
    const dialog = await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");

    // Choosing the active style must not navigate, only close.
    await user.click(within(dialog).getByRole("link", { name: /静奢/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(handle).toHaveFocus();
  });

  it("closes the drawer when the viewport grows back to desktop", async () => {
    setViewportWidth(MOBILE_WIDTH);
    const user = userEvent.setup();
    renderWithProviders(<StyleRail />, { style: "atelier" });

    await user.click(screen.getByRole("button", { name: "展开风格切换" }));
    await screen.findByRole("dialog");

    setViewportWidth(DESKTOP_WIDTH);
    fireEvent(window, new Event("resize"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
