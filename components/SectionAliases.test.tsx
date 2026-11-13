import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { locales } from "@/lib/i18n";
import { enterpriseProjects, githubProjects } from "@/data/projects";
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
  it("atelier exposes #work and the invisible #selected alias", () => {
    renderWithProviders(<AtelierSelectedProjects />);
    const work = document.querySelector("#work");
    const alias = document.querySelector("#selected");
    expect(work).toBeTruthy();
    expect(alias).toBeTruthy();
    expect(work?.contains(alias)).toBe(true);
  });

  it("classic exposes #work and the invisible #enterprise alias", () => {
    renderWithProviders(
      <ClassicProjectsSection
        id="work"
        aliasId="enterprise"
        sectionIndex={zh.enterprise.index}
        title={zh.enterprise.title}
        subtitle={zh.enterprise.subtitle}
        projects={enterpriseProjects}
        texts={zh.enterprise.projects}
      />
    );
    const work = document.querySelector("#work");
    const alias = document.querySelector("#enterprise");
    expect(work).toBeTruthy();
    expect(alias).toBeTruthy();
    expect(work?.contains(alias)).toBe(true);
  });

  it("does not emit an alias when aliasId is absent", () => {
    renderWithProviders(
      <ClassicProjectsSection
        id="github"
        sectionIndex={zh.github.index}
        title={zh.github.title}
        subtitle={zh.github.subtitle}
        projects={githubProjects}
        texts={zh.github.projects}
        showLinks
      />
    );
    expect(document.querySelector("#github")).toBeTruthy();
    expect(document.querySelector("#enterprise")).toBeNull();
  });
});
