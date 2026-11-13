import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import BlogModalHost from "@/components/BlogModalHost";
import { getBlogContent } from "@/data/blog-content";
import { blogPosts } from "@/data/blogs";
import { openBlog, openBlogIndex, useBlogModalStore } from "@/lib/blog-modal";
import { act, fireEvent, renderWithProviders, screen } from "@/test/render";

const sortedPosts = [...blogPosts].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0
);

beforeEach(() => {
  act(() => useBlogModalStore.setState({ view: { kind: "closed" } }));
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});

describe("BlogModalHost", () => {
  it("stays hidden until a post or the index is opened", () => {
    renderWithProviders(<BlogModalHost />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders post title, date and MDX body when openBlog is called", async () => {
    renderWithProviders(<BlogModalHost />);
    const post = sortedPosts[0];

    act(() => openBlog(post.slug));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(post.title);
    expect(screen.getByText(post.date)).toBeInTheDocument();
    expect(getBlogContent(post.slug).length).toBeGreaterThan(100);
    // The markdown body actually rendered (not just the title).
    expect(dialog.querySelectorAll("h2").length).toBeGreaterThan(0);
  });

  it("closes on Escape, the close button and overlay click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BlogModalHost />);

    act(() => openBlog(sortedPosts[0].slug));
    const dialog = await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => openBlog(sortedPosts[0].slug));
    await user.click(await screen.findByRole("button", { name: "关闭" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => openBlog(sortedPosts[0].slug));
    const overlay = (await screen.findByRole("dialog")).parentElement;
    expect(overlay).not.toBeNull();
    fireEvent.mouseDown(overlay!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(dialog).not.toBeInTheDocument();
  });

  it("index mode lists every post and drills into one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BlogModalHost />);

    act(() => openBlogIndex());
    await screen.findByRole("dialog");
    expect(screen.getByText(`共 ${blogPosts.length} 篇`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "技术日志" })).toBeInTheDocument();

    const target = sortedPosts[0];
    await user.click(screen.getByRole("button", { name: new RegExp(target.title) }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(target.title);

    // Back to the full index from a post.
    await user.click(screen.getByRole("button", { name: /全部日志/ }));
    expect(screen.getByText(`共 ${blogPosts.length} 篇`)).toBeInTheDocument();
  });

  it("locks body scroll while open and restores it on close", async () => {
    document.body.style.overflow = "scroll";
    renderWithProviders(<BlogModalHost />);

    act(() => openBlog(sortedPosts[0].slug));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");

    act(() => useBlogModalStore.getState().closeBlog());
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("shows a fallback for an unknown slug", async () => {
    renderWithProviders(<BlogModalHost />);
    act(() => openBlog("does-not-exist"));
    await screen.findByRole("dialog");
    expect(screen.getByText("找不到这篇日志。")).toBeInTheDocument();
  });
});
