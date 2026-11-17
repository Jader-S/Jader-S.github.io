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
import { closeOtherModals, registerModal } from "./modal-registry";

/**
 * Where a demo's back button returns to.
 * - project: the project detail it was opened from
 * - demos: the in-page demo index (fallback when no #lab section is mounted)
 * - lab: the standalone #lab page section — closing the modal lands right back on it
 */
export type ProjectModalReturn =
  | { kind: "project"; id: ProjectId }
  | { kind: "demos" }
  | { kind: "lab" };

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

/**
 * Two modals share z-index 9999; opening one always dismisses the other.
 * Mutual exclusion goes through the neutral registry (not a direct import of
 * blog-modal) so the two stores never form an import cycle.
 */
function closeSelf() {
  useProjectModalStore.getState().close();
}

export const useProjectModalStore = create<ProjectModalStore>((set) => ({
  view: { kind: "closed" },
  openProject: (id) => {
    closeOtherModals(closeSelf);
    set({ view: { kind: "project", id } });
  },
  openDemoIndex: () => {
    closeOtherModals(closeSelf);
    set({ view: { kind: "demos" } });
  },
  openDemo: (slug, returnTo) => {
    closeOtherModals(closeSelf);
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
    set((state) => {
      if (state.view.kind !== "demo") return { view: { kind: "closed" } };
      // A demo opened from the #lab section returns to the page itself, not to
      // another modal — this removes the "project → demo list" detour.
      if (state.view.returnTo.kind === "lab") {
        return { view: { kind: "closed" } };
      }
      return { view: state.view.returnTo };
    }),
  close: () => set({ view: { kind: "closed" } }),
}));

registerModal(closeSelf);

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
