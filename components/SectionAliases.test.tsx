import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { locales } from "@/lib/i18n";
import { projects } from "@/data/projects";
import AtelierSelectedProjects from "@/styles/atelier/components/SelectedProjects";
import ClassicProjectsSection from "@/styles/classic/components/ProjectsSection";

const zh = locales.zh;

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

// Keeps atelier's FlameWrap (canvas) out of jsdom.
beforeEach(() => setWidth(390));
afterEach(() => setWidth(1280));

describe("merged #work sections keep legacy anchors", () => {
  it("atelier exposes #work with invisible #selected and #work-index aliases", () => {
    renderWithProviders(<AtelierSelectedProjects />);
    const work = document.querySelector("#work");
    expect(work).toBeTruthy();
    for (const alias of ["selected", "work-index"]) {
      const node = document.querySelector(`#${alias}`);
      expect(node).toBeTruthy();
      expect(work?.contains(node)).toBe(true);
    }
  });

  it("classic exposes #work with invisible #enterprise and #github aliases", () => {
    renderWithProviders(
      <ClassicProjectsSection
        id="work"
        aliasIds={["enterprise", "github"]}
        sectionIndex={zh.work.index}
        title={zh.work.title}
        subtitle={zh.work.subtitle}
        projects={projects}
        texts={zh.work.projects}
      />
    );
    const work = document.querySelector("#work");
    expect(work).toBeTruthy();
    for (const alias of ["enterprise", "github"]) {
      const node = document.querySelector(`#${alias}`);
      expect(node).toBeTruthy();
      expect(work?.contains(node)).toBe(true);
    }
  });

  it("emits no alias when aliasIds is absent", () => {
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
    expect(document.querySelector("#work")).toBeTruthy();
    expect(document.querySelector("#enterprise")).toBeNull();
    expect(document.querySelector("#github")).toBeNull();
  });
});
