/**
 * Shared project detail / demo modal state.
 *
 * An external zustand store (not React Context) on purpose: the blueprint
 * build-phase engine dispatches actions from outside the React tree, and
 * ASTRA's R3F Canvas uses a separate reconciler. A command-style API works
 * from all of them.
 */
import { create } from "zustand";
import type { DemoSlug, ProjectId } from "@/data/project-details";
import { useBlogModalStore } from "./blog-modal";

export type ProjectModalReturn = { kind: "project"; id: ProjectId } | { kind: "demos" };

export type ProjectModalView =
  | { kind: "closed" }
  | { kind: "project"; id: ProjectId }
  | { kind: "demos" }
  | { kind: "demo"; slug: DemoSlug; returnTo: ProjectModalReturn };

interface ProjectModalStore {
  view: ProjectModalView;
  openProject: (id: ProjectId) => void;
  openDemoIndex: () => void;
  openDemo: (slug: DemoSlug, returnTo?: ProjectModalReturn) => void;
  back: () => void;
  close: () => void;
}

/** The two modals share z-index 9999; opening one always dismisses the other. */
function closeBlogModal() {
  useBlogModalStore.getState().closeBlog();
}

export const useProjectModalStore = create<ProjectModalStore>((set) => ({
  view: { kind: "closed" },
  openProject: (id) => {
    closeBlogModal();
    set({ view: { kind: "project", id } });
  },
  openDemoIndex: () => {
    closeBlogModal();
    set({ view: { kind: "demos" } });
  },
  openDemo: (slug, returnTo) => {
    closeBlogModal();
    set((state) => ({
      view: {
        kind: "demo",
        slug,
        returnTo:
          returnTo ??
          (state.view.kind === "project"
            ? { kind: "project", id: state.view.id }
            : { kind: "demos" }),
      },
    }));
  },
  back: () =>
    set((state) => ({
      view: state.view.kind === "demo" ? state.view.returnTo : { kind: "closed" },
    })),
  close: () => set({ view: { kind: "closed" } }),
}));

/** Command-style API — safe to call from canvas actions, R3F and plain buttons. */
export function openProject(id: ProjectId) {
  useProjectModalStore.getState().openProject(id);
}

export function openDemoIndex() {
  useProjectModalStore.getState().openDemoIndex();
}

export function openDemo(slug: DemoSlug, returnTo?: ProjectModalReturn) {
  useProjectModalStore.getState().openDemo(slug, returnTo);
}

export function backProjectModal() {
  useProjectModalStore.getState().back();
}

export function closeProjectModal() {
  useProjectModalStore.getState().close();
}
