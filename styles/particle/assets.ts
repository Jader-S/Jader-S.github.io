import { basePath } from "@/lib/site";

export type ParticleSectionId =
  | "top"
  | "about"
  | "work"
  | "skills"
  | "blog"
  | "experience";

export const PARTICLE_SECTION_IDS: ParticleSectionId[] = [
  "top",
  "about",
  "work",
  "skills",
  "blog",
  "experience",
];

export interface SectionAssetConfig {
  /** Fixed asset — skips random pick */
  src?: string;
  /** Random among these when set; else global pool */
  candidates?: string[];
}

function asset(path: string): string {
  return `${basePath}${path}`;
}

/** Global silhouette pool (random fallback). */
export const PARTICLE_POOL = [
  asset("/particle/brackets-code.svg"),
  asset("/particle/nodes-graph.svg"),
  asset("/particle/layers-stack.svg"),
  asset("/particle/work-grid.svg"),
  asset("/particle/work-flow.svg"),
  asset("/particle/blog-lines.svg"),
  asset("/particle/timeline-steps.svg"),
  asset("/particle/portrait-mark.svg"),
];

export const SECTION_ASSETS: Record<ParticleSectionId, SectionAssetConfig> = {
  top: { src: asset("/particle/portrait-mark.svg") },
  about: {
    candidates: [
      asset("/particle/brackets-code.svg"),
      asset("/particle/nodes-graph.svg"),
    ],
  },
  work: {
    candidates: [asset("/particle/work-grid.svg"), asset("/particle/work-flow.svg")],
  },
  skills: {
    candidates: [
      asset("/particle/layers-stack.svg"),
      asset("/particle/brackets-code.svg"),
      asset("/particle/nodes-graph.svg"),
    ],
  },
  blog: {
    candidates: [
      asset("/particle/blog-lines.svg"),
      asset("/particle/layers-stack.svg"),
    ],
  },
  experience: {
    candidates: [
      asset("/particle/timeline-steps.svg"),
      asset("/particle/nodes-graph.svg"),
    ],
  },
};

export function resolveSectionAsset(
  sectionId: ParticleSectionId,
  avoid?: string
): string {
  const config = SECTION_ASSETS[sectionId];
  if (config.src) return config.src;

  const pool =
    config.candidates && config.candidates.length > 0
      ? config.candidates
      : PARTICLE_POOL;

  if (pool.length === 1) return pool[0];

  const filtered = avoid ? pool.filter((item) => item !== avoid) : pool;
  const choices = filtered.length > 0 ? filtered : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}
