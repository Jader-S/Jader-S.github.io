/** Particle — Uno shortcuts, rules, and CSS variables. */
export const particleShortcuts = {
  "particle-shell": "relative h-[100dvh] min-h-0 w-full overflow-hidden",
  "particle-stage": "pointer-events-none absolute inset-0 z-0 overflow-hidden",
  "particle-column":
    "relative z-10 h-full min-h-0 min-w-0 overflow-y-auto overscroll-y-contain bg-[var(--particle-scrim)]",
  // Desktop snap is JS-driven (eased scrollTop); avoid CSS snap fighting the animator.
  "particle-snap-column": "particle-column",
  "particle-section":
    "relative mx-auto flex min-h-[64vh] w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8 lg:min-h-[100dvh] lg:max-w-4xl lg:px-12 lg:py-16",
  "particle-eyebrow":
    "mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-faint",
  "particle-title":
    "font-serif text-[clamp(1.65rem,3.2vw,2.6rem)] font-medium tracking-tight text-heading leading-[1.12]",
  "particle-body": "mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base",
  "particle-chip":
    "font-mono text-[11px] tracking-wide text-muted border border-divider px-2.5 py-1",
  "particle-link":
    "focus-ring inline-flex items-center gap-2 text-sm text-heading transition-colors hover:text-theme",
  "particle-nav-link":
    "focus-ring rounded-sm px-2 py-1 text-[12px] tracking-wide text-muted transition-colors hover:text-heading",
} as const;

export const particleRules: [string, Record<string, string>][] = [
  [
    "particle-stage-glow",
    {
      background:
        "radial-gradient(ellipse 70% 55% at 50% 45%, var(--particle-glow), transparent 70%)",
    },
  ],
];

export const particlePreflight = `
  /* Particle — light */
  html[data-style="particle"][data-theme="light"],
  html[data-style="particle"]:not([data-theme]) {
    color-scheme: light;
    --color-background: #ebe8e2;
    --color-surface: #e2ddd4;
    --text-heading: #1a1714;
    --text-body: #3d3832;
    --text-muted: #625a52;
    --text-faint: #8a8178;
    --border-subtle: rgba(26, 23, 20, 0.12);
    --border-medium: rgba(26, 23, 20, 0.18);
    --glass-bg: rgba(255, 255, 255, 0.5);
    --glass-bg-hover: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(26, 23, 20, 0.1);
    --tag-bg: transparent;
    --nav-bg: rgba(235, 232, 226, 0.82);
    --nav-bg-solid: rgba(235, 232, 226, 0.96);
    --nav-active: rgba(45, 106, 122, 0.12);
    --nav-hover: rgba(26, 23, 20, 0.04);
    --theme-accent: #2d6a7a;
    --theme-accent-light: #3d8a9c;
    --theme-muted: rgba(45, 106, 122, 0.12);
    --selection-bg: rgba(45, 106, 122, 0.2);
    --focus-ring-color: rgba(45, 106, 122, 0.55);
    --particle-glow: rgba(45, 106, 122, 0.16);
    --particle-canvas-bg: #ebe8e2;
    --particle-scrim: rgba(235, 232, 226, 0.78);
  }

  /* Particle — dark */
  html[data-style="particle"][data-theme="dark"] {
    color-scheme: dark;
    --color-background: #0c0e12;
    --color-surface: #141820;
    --text-heading: #eef1f4;
    --text-body: #c2c8d0;
    --text-muted: #8b939e;
    --text-faint: #6a727c;
    --border-subtle: rgba(238, 241, 244, 0.1);
    --border-medium: rgba(238, 241, 244, 0.16);
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-bg-hover: rgba(255, 255, 255, 0.06);
    --glass-border: rgba(255, 255, 255, 0.08);
    --tag-bg: transparent;
    --nav-bg: rgba(12, 14, 18, 0.78);
    --nav-bg-solid: rgba(12, 14, 18, 0.94);
    --nav-active: rgba(94, 184, 198, 0.14);
    --nav-hover: rgba(255, 255, 255, 0.04);
    --theme-accent: #5eb8c6;
    --theme-accent-light: #8fd4de;
    --theme-muted: rgba(94, 184, 198, 0.12);
    --selection-bg: rgba(94, 184, 198, 0.28);
    --focus-ring-color: rgba(94, 184, 198, 0.55);
    --particle-glow: rgba(94, 184, 198, 0.14);
    --particle-canvas-bg: #0c0e12;
    --particle-scrim: rgba(12, 14, 18, 0.72);
  }

  html[data-style="particle"] body {
    background-color: var(--color-background);
    color: var(--text-body);
    overflow-x: hidden;
  }

  html[data-style="particle"] .particle-column,
  html[data-style="particle"] .particle-snap-column {
    scroll-behavior: auto;
    -webkit-overflow-scrolling: touch;
  }

  html[data-style="particle"] .particle-nav-link[data-active="true"] {
    color: var(--text-heading);
  }
`;
