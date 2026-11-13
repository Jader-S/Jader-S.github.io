import { afterEach, beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { enterpriseProjects, githubProjects } from "@/data/projects";
import { locales } from "@/lib/i18n";
import { useProjectModalStore } from "@/lib/project-modal";
import { ActionType } from "@/styles/blueprint/swarm/interactions/actions.js";
import { createPortfolioInteractions } from "@/styles/blueprint/swarm/interactions/portfolio-actions.js";
import AtelierSelectedProjects from "@/styles/atelier/components/SelectedProjects";
import BlueprintWorkSection from "@/styles/blueprint/components/WorkSection";
import ClassicProjectsSection from "@/styles/classic/components/ProjectsSection";
import ParticleWorkSection from "@/styles/particle/components/WorkSection";
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

  it("classic enterprise section", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ClassicProjectsSection
        id="enterprise"
        sectionIndex={zh.enterprise.index}
        title={zh.enterprise.title}
        subtitle={zh.enterprise.subtitle}
        projects={enterpriseProjects}
        texts={zh.enterprise.projects}
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

  it("the lab button opens the demo index", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BlueprintWorkSection />);
    await user.click(screen.getByRole("button", { name: /实验室/ }));
    expect(useProjectModalStore.getState().view).toEqual({ kind: "demos" });
  });
});

interface WorkInteraction {
  id: string;
  elements: string[];
  after: string[];
  action: Record<string, unknown>;
}

describe("blueprint build-phase work interactions", () => {
  it("wires every drawn work item to a project modal or repo action", () => {
    const interactions = createPortfolioInteractions({
      nav: ["a", "b", "c", "d", "e"],
      primaryCta: "CTA",
      github: "GitHub",
      posts: [],
      projects: [
        ...enterpriseProjects.map((p) => ({ id: p.id, title: p.id })),
        ...githubProjects.map((p) => ({ id: p.id, title: p.id, link: p.link })),
      ],
      links: [],
    }) as unknown as WorkInteraction[];

    const work = interactions.filter((item) => item.id.startsWith("w"));
    expect(work).toHaveLength(5);
    expect(work[0].elements).toEqual(["work-t", "work-b"]);
    expect(work[1].elements).toEqual(["work-t~1", "work-b~1"]);
    expect(work[1].after).toEqual(["d:work:0"]);
    expect(work[0].action).toEqual({
      type: ActionType.CUSTOM,
      id: "project",
      projectId: "poiConfigTools",
    });
    expect(work[3].action).toEqual({
      type: ActionType.CUSTOM,
      id: "repo",
      href: "https://github.com/Jader-S/Jader-S.github.io",
    });
  });
});
