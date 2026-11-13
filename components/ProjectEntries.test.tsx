import { afterEach, beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { projects } from "@/data/projects";
import { demoCatalog } from "@/data/project-details";
import { locales } from "@/lib/i18n";
import { useProjectModalStore } from "@/lib/project-modal";
import { ActionType } from "@/styles/blueprint/swarm/interactions/actions.js";
import { createPortfolioInteractions } from "@/styles/blueprint/swarm/interactions/portfolio-actions.js";
import AtelierSelectedProjects from "@/styles/atelier/components/SelectedProjects";
import BlueprintWorkSection from "@/styles/blueprint/components/WorkSection";
import ClassicProjectsSection from "@/styles/classic/components/ProjectsSection";
import ParticleWorkSection from "@/styles/particle/components/WorkSection";
import LabSection from "@/styles/shared/chrome/LabSection";
import { act, renderWithProviders, screen } from "@/test/render";

const zh = locales.zh;
const TARGET = /施耐德 · POI 中低压配电/;

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

beforeEach(() => {
  act(() => useProjectModalStore.setState({ view: { kind: "closed" } }));
  setWidth(390); // keeps atelier's FlameWrap (canvas) out of jsdom
});

afterEach(() => setWidth(1280));

describe("project cards open the shared detail modal", () => {
  it("blueprint settled home", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BlueprintWorkSection />);
    await user.click(screen.getByRole("button", { name: TARGET }));
    expect(useProjectModalStore.getState().view).toEqual({
      kind: "project",
      id: "poiConfigTools",
    });
  });

  it("particle", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ParticleWorkSection />);
    await user.click(screen.getByRole("button", { name: TARGET }));
    expect(useProjectModalStore.getState().view).toEqual({
      kind: "project",
      id: "poiConfigTools",
    });
  });

  it("classic works section", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ClassicProjectsSection
        id="work"
        sectionIndex={zh.work.index}
        title={zh.work.title}
        subtitle={zh.work.subtitle}
        projects={projects}
        texts={zh.work.projects}
      />
    );
    await user.click(screen.getByRole("button", { name: TARGET }));
    expect(useProjectModalStore.getState().view).toEqual({
      kind: "project",
      id: "poiConfigTools",
    });
  });

  it("atelier selected projects", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AtelierSelectedProjects />);
    await user.click(screen.getByRole("button", { name: TARGET }));
    expect(useProjectModalStore.getState().view).toEqual({
      kind: "project",
      id: "poiConfigTools",
    });
  });

  it("the standalone lab section opens a demo straight from the page", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LabSection style="blueprint" />);

    const cards = screen.getAllByTestId("lab-card");
    expect(cards).toHaveLength(demoCatalog.length);
    await user.click(cards[0]);
    expect(useProjectModalStore.getState().view).toEqual({
      kind: "demo",
      slug: demoCatalog[0].slug,
      returnTo: { kind: "lab" },
    });
  });

  it("every work card renders in a single merged list", () => {
    renderWithProviders(<BlueprintWorkSection />);
    for (const project of projects) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(
            zh.work.projects[project.id].name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          ),
        })
      ).toBeTruthy();
    }
    // ASTRA 作品站卡片已下架，不应再出现
    expect(screen.queryByText(/ASTRA · 3D 星图作品站/)).toBeNull();
  });
});

interface WorkInteraction {
  id: string;
  elements: string[];
  after: string[];
  action: Record<string, unknown>;
}

describe("blueprint build-phase work interactions", () => {
  it("wires every drawn work item to a project modal", () => {
    const interactions = createPortfolioInteractions({
      nav: ["a", "b", "c", "d", "e"],
      primaryCta: "CTA",
      github: "GitHub",
      posts: [],
      projects: projects.map((p) => ({ id: p.id, title: p.id })),
      links: [],
    }) as unknown as WorkInteraction[];

    const work = interactions.filter((item) => item.id.startsWith("w"));
    expect(work).toHaveLength(projects.length);
    expect(work[0].elements).toEqual(["work-t", "work-b"]);
    expect(work[1].elements).toEqual(["work-t~1", "work-b~1"]);
    expect(work[1].after).toEqual(["d:work:0"]);
    expect(work[0].action).toEqual({
      type: ActionType.CUSTOM,
      id: "project",
      projectId: "poiConfigTools",
    });
    // 合并后所有作品都走详情弹框，不再有外链 repo action
    expect(work.every((item) => item.action.id === "project")).toBe(true);
  });

  it("routes the sixth nav item (lab) to the demo list action", () => {
    const interactions = createPortfolioInteractions({
      nav: ["a", "b", "c", "d", "e", "f"],
      primaryCta: "CTA",
      github: "GitHub",
      posts: [],
      projects: [],
      links: [],
    }) as unknown as WorkInteraction[];

    // nav0~1..nav0~5；第 3 个菜单「实验室」现在有自己的绘制场景段，走 SCROLL l-title。
    const nav = interactions.filter((item) => item.id.startsWith("nav0~"));
    expect(nav).toHaveLength(5);
    expect(nav[0].action).toEqual({ type: ActionType.SCROLL, target: "w-title" });
    expect(nav[1].action).toEqual({ type: ActionType.SCROLL, target: "l-title" });
    expect(nav[2].action).toEqual({ type: ActionType.SCROLL, target: "k-title" });
    expect(nav[4].action).toEqual({ type: ActionType.SCROLL, target: "d-title" });
  });

  it("keeps the five-item nav layout unchanged", () => {
    const interactions = createPortfolioInteractions({
      nav: ["a", "b", "c", "d", "e"],
      primaryCta: "CTA",
      github: "GitHub",
      posts: [],
      projects: [],
      links: [],
    }) as unknown as WorkInteraction[];

    const nav = interactions.filter((item) => item.id.startsWith("nav0~"));
    expect(nav).toHaveLength(4);
    expect(nav.map((item) => item.action.target)).toEqual([
      "w-title",
      "k-title",
      "b-title",
      "d-title",
    ]);
  });
});
