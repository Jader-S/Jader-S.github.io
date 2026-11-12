import { describe, expect, it } from "vitest";
import SkipLink from "@/components/SkipLink";
import { renderWithProviders, screen } from "@/test/render";

describe("SkipLink", () => {
  it("points at main content with localized label", () => {
    renderWithProviders(<SkipLink />);
    const link = screen.getByRole("link", { name: "跳到主要内容" });
    expect(link).toHaveAttribute("href", "#main-content");
  });
});
