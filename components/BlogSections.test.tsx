import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { blogPosts } from "@/data/blogs";
import { useBlogModalStore } from "@/lib/blog-modal";
import AtelierBlogSection from "@/styles/atelier/components/BlogSection";
import BlueprintBlogSection from "@/styles/blueprint/components/BlogSection";
import ClassicBlogSection from "@/styles/classic/components/BlogSection";
import ParticleBlogSection from "@/styles/particle/components/BlogSection";
import type { StyleMode } from "@/styles/registry";
import { act, renderWithProviders, screen } from "@/test/render";

const sections: Array<{
  name: string;
  theme: StyleMode;
  Component: () => React.JSX.Element;
}> = [
  { name: "blueprint", theme: "blueprint", Component: BlueprintBlogSection },
  { name: "atelier", theme: "atelier", Component: AtelierBlogSection },
  { name: "classic", theme: "classic", Component: ClassicBlogSection },
  { name: "particle", theme: "particle", Component: ParticleBlogSection },
];

beforeEach(() => {
  act(() => useBlogModalStore.setState({ view: { kind: "closed" } }));
});

describe.each(sections)("$name blog section", ({ theme, Component }) => {
  it("opens the in-page modal instead of navigating to a blog route", async () => {
    const user = userEvent.setup();
    const post = blogPosts.find((item) => item.theme === theme);
    expect(post).toBeDefined();

    renderWithProviders(<Component />);

    const trigger = screen.getByRole("button", { name: new RegExp(post!.title) });
    // No <a href> left: clicking cannot change the URL.
    expect(trigger).not.toHaveAttribute("href");
    expect(screen.queryByRole("link", { name: new RegExp(post!.title) })).toBeNull();

    await user.click(trigger);
    expect(useBlogModalStore.getState().view).toEqual({
      kind: "post",
      slug: post!.slug,
    });
  });
});
