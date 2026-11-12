/** Blueprint — Uno shortcuts, rules, and CSS variables. */
export const blueprintShortcuts = {
  "blueprint-shell": "relative min-h-[100dvh] w-full",
  "blueprint-section":
    "relative mx-auto flex min-h-[64vh] w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8 lg:min-h-[100dvh] lg:max-w-4xl lg:px-12 lg:py-16",
  "blueprint-eyebrow":
    "mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-faint",
  "blueprint-title":
    "blueprint-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold tracking-tight text-heading leading-[1.1]",
  "blueprint-body":
    "mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base",
  "blueprint-chip":
    "font-mono text-[11px] tracking-wide text-muted border border-divider px-2.5 py-1",
  "blueprint-link":
    "focus-ring inline-flex items-center gap-2 text-sm text-heading transition-colors hover:text-theme",
  "blueprint-nav-link":
    "focus-ring rounded-sm px-2 py-1 text-[12px] tracking-wide text-muted transition-colors hover:text-heading",
  "blueprint-grid": "blueprint-grid-bg",
} as const;

export const blueprintRules: [string, Record<string, string>][] = [
  [
    "blueprint-grid-bg",
    {
      "background-image":
        "linear-gradient(var(--blueprint-grid) 1px, transparent 1px), linear-gradient(90deg, var(--blueprint-grid) 1px, transparent 1px)",
      "background-size": "32px 32px",
      "background-position": "center top",
    },
  ],
  [
    "blueprint-display",
    {
      "font-family": "var(--font-blueprint-display)",
    },
  ],
  [
    "blueprint-ink-reveal",
    {
      animation: "blueprint-ink 0.7s ease both",
    },
  ],
];

export const blueprintPreflight = `
  /* Blueprint — light (cold paper) */
  html[data-style="blueprint"][data-theme="light"],
  html[data-style="blueprint"]:not([data-theme]) {
    color-scheme: light;
    --color-background: #e8ecf1;
    --color-surface: #dde3ea;
    --text-heading: #1a2332;
    --text-body: #3a4556;
    --text-muted: #5c6778;
    --text-faint: #8b93a1;
    --border-subtle: rgba(26, 35, 50, 0.12);
    --border-medium: rgba(26, 35, 50, 0.18);
    --glass-bg: rgba(255, 255, 255, 0.55);
    --glass-bg-hover: rgba(255, 255, 255, 0.72);
    --glass-border: rgba(26, 35, 50, 0.1);
    --tag-bg: transparent;
    --nav-bg: rgba(232, 236, 241, 0.86);
    --nav-bg-solid: rgba(232, 236, 241, 0.96);
    --nav-active: rgba(47, 111, 126, 0.12);
    --nav-hover: rgba(26, 35, 50, 0.04);
    --theme-accent: #2f6f7e;
    --theme-accent-light: #3d8a9c;
    --theme-muted: rgba(47, 111, 126, 0.12);
    --selection-bg: rgba(47, 111, 126, 0.2);
    --focus-ring-color: rgba(47, 111, 126, 0.55);
    --blueprint-grid: rgba(26, 35, 50, 0.06);
    --font-blueprint-display: var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif;
  }

  /* Blueprint — dark (ink navy) */
  html[data-style="blueprint"][data-theme="dark"] {
    color-scheme: dark;
    --color-background: #0e141b;
    --color-surface: #16202a;
    --text-heading: #e8ecf1;
    --text-body: #c2c9d2;
    --text-muted: #8b93a1;
    --text-faint: #6a727c;
    --border-subtle: rgba(232, 236, 241, 0.1);
    --border-medium: rgba(232, 236, 241, 0.16);
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-bg-hover: rgba(255, 255, 255, 0.06);
    --glass-border: rgba(255, 255, 255, 0.08);
    --tag-bg: transparent;
    --nav-bg: rgba(14, 20, 27, 0.82);
    --nav-bg-solid: rgba(14, 20, 27, 0.94);
    --nav-active: rgba(94, 184, 198, 0.14);
    --nav-hover: rgba(255, 255, 255, 0.04);
    --theme-accent: #5eb8c6;
    --theme-accent-light: #8fd4de;
    --theme-muted: rgba(94, 184, 198, 0.12);
    --selection-bg: rgba(94, 184, 198, 0.28);
    --focus-ring-color: rgba(94, 184, 198, 0.55);
    --blueprint-grid: rgba(232, 236, 241, 0.05);
    --font-blueprint-display: var(--font-space-grotesk), var(--font-geist-sans), system-ui, sans-serif;
  }

  html[data-style="blueprint"] body {
    background-color: var(--color-background);
    color: var(--text-body);
    overflow-x: hidden;
  }

  html[data-style="blueprint"] .blueprint-nav-link[data-active="true"] {
    color: var(--text-heading);
  }

  @keyframes blueprint-ink {
    from {
      opacity: 0;
      clip-path: inset(0 100% 0 0);
    }
    to {
      opacity: 1;
      clip-path: inset(0 0 0 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    html[data-style="blueprint"] .blueprint-ink-reveal {
      animation: none;
    }
  }
`;
