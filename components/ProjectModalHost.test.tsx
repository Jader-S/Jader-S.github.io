import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import ProjectModalHost from "@/components/ProjectModalHost";
import { openBlogIndex, useBlogModalStore } from "@/lib/blog-modal";
import { openDemoIndex, openProject, useProjectModalStore } from "@/lib/project-modal";
import { act, fireEvent, renderWithProviders, screen, within } from "@/test/render";

// Real demos pull in echarts / R3F / WebGL; the modal only needs to prove it
// selects and mounts the right preview slot.
vi.mock("@/components/DemoPreview", () => ({
  default: ({ slug }: { slug: string }) => <div data-testid="demo-preview">{slug}</div>,
}));

beforeEach(() => {
  act(() => {
    useProjectModalStore.setState({ view: { kind: "closed" } });
    useBlogModalStore.setState({ view: { kind: "closed" } });
  });
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});

describe("ProjectModalHost", () => {
  it("stays hidden until a project, a demo or the lab is opened", () => {
    renderWithProviders(<ProjectModalHost />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders project details and the related demos", () => {
    renderWithProviders(<ProjectModalHost />);
    act(() => openProject("poiConfigTools"));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("heading", { level: 1 })).toHaveTextContent(
      "施耐德 · POI 中低压配电"
    );
    expect(within(dialog).getByText("项目背景")).toBeInTheDocument();
    expect(within(dialog).getByText(/72s → 2.1s/)).toBeInTheDocument();
    expect(within(dialog).getByText("React", { exact: true })).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: /配电树性能基准/ })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: /查看全部 Demo/ })
    ).toBeInTheDocument();
  });

  it("switches to an inline demo preview and returns to the project", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectModalHost />);
    act(() => openProject("smartMeeting"));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /会议编排/ }));
    expect(screen.getByTestId("demo-preview")).toHaveTextContent("conference-board");

    await user.click(screen.getByRole("button", { name: /返回项目详情/ }));
    expect(screen.getByRole("heading", { level: 1, name: /氪邦/ })).toBeInTheDocument();
  });

  it("lists all six demos in the lab view", () => {
    renderWithProviders(<ProjectModalHost />);
    act(() => openDemoIndex());

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { level: 1 })).toHaveTextContent(
      "实验室"
    );
    expect(within(dialog).getByText(/共 6 个/)).toBeInTheDocument();
    expect(
      within(dialog).getAllByRole("button", {
        name: /Demo|看板|放大镜|工厂|大屏|基准|动画/,
      })
    ).toHaveLength(6);
  });

  it("closes on Escape, the close button and overlay click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectModalHost />);

    act(() => openProject("aerospaceLine"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => openProject("aerospaceLine"));
    await user.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => openProject("aerospaceLine"));
    const overlay = screen.getByRole("dialog").parentElement;
    expect(overlay).not.toBeNull();
    fireEvent.mouseDown(overlay!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks body scroll while open and restores it on close", () => {
    document.body.style.overflow = "scroll";
    renderWithProviders(<ProjectModalHost />);

    act(() => openProject("poiConfigTools"));
    expect(document.body.style.overflow).toBe("hidden");

    act(() => useProjectModalStore.getState().close());
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("dismisses the blog modal when a project detail is opened", () => {
    act(() => openBlogIndex());
    expect(useBlogModalStore.getState().view.kind).toBe("index");

    act(() => openProject("poiConfigTools"));
    expect(useBlogModalStore.getState().view.kind).toBe("closed");
    expect(useProjectModalStore.getState().view.kind).toBe("project");
  });
});
