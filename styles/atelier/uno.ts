/** Atelier (静奢) — Uno shortcuts, rules, and CSS variables. */
export const atelierShortcuts = {
  "section-shell": "relative px-4 py-[clamp(4.5rem,12vw,9rem)] sm:px-6 md:px-8",
  "section-shell-mute": "section-shell bg-surface",
  "section-inner": "mx-auto w-full max-w-[1080px]",
  "section-title":
    "font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-medium tracking-tight text-heading leading-[1.15]",
  "section-subtitle": "max-w-xl text-[15px] leading-relaxed text-muted sm:text-base",
  "section-eyebrow":
    "mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-faint",
  "tech-tag":
    "font-mono text-[11px] tracking-wide text-muted transition-colors duration-250 group-hover:text-theme",
  "tech-chip":
    "font-mono text-[11px] tracking-wide text-muted border border-divider px-2.5 py-1 transition-[color,border-color,background-color] duration-250 hover:border-theme/40 hover:text-theme hover:bg-[var(--theme-muted)]",
  "text-link":
    "focus-ring relative inline-flex items-center gap-2 text-sm text-heading",
  "text-link-muted":
    "focus-ring relative inline-flex items-center gap-2 text-sm text-muted hover:text-heading",
  "text-link-arrow":
    "inline-block transition-transform duration-300 ease-[var(--ease-atelier)]",
  "nav-link":
    "focus-ring relative rounded-sm px-2.5 py-1.5 text-[13px] tracking-wide transition-colors duration-250",
  "index-row":
    "focus-ring relative grid grid-cols-1 items-baseline gap-2 py-5 pl-0 transition-[padding,background-color] duration-300 hover:bg-[var(--row-hover)] hover:pl-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:gap-6 sm:py-6 sm:hover:pl-4",
  "hero-glow": "hero-radial-glow",
  "hero-glow-secondary": "hero-radial-glow-2",
  "page-noise": "page-noise-overlay",
  "pointer-aura": "pointer-aura-base",
  "pointer-aura-wide": "pointer-aura-layer-wide",
  "pointer-aura-core": "pointer-aura-layer-core",
  "pointer-aura-ring": "pointer-aura-layer-ring",
  "hero-mesh": "hero-mesh-wash",
} as const;

export const atelierRules: [string, Record<string, string>][] = [
  [
    "hero-radial-glow",
    {
      background:
        "radial-gradient(ellipse 55% 45% at 78% 72%, var(--hero-glow), transparent 70%)",
    },
  ],
  [
    "hero-radial-glow-2",
    {
      background:
        "radial-gradient(ellipse 40% 35% at 12% 28%, var(--hero-glow-2), transparent 65%)",
    },
  ],
  [
    "hero-mesh-wash",
    {
      background: "var(--hero-mesh)",
      opacity: "1",
    },
  ],
  [
    "page-noise-overlay",
    {
      "background-image":
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
      opacity: "var(--noise-opacity)",
      "pointer-events": "none",
    },
  ],
  [
    "pointer-aura-base",
    {
      opacity: "1",
    },
  ],
  [
    "pointer-aura-layer-wide",
    {
      background:
        "radial-gradient(circle 48vmax at var(--pointer-x, 50%) var(--pointer-y, 35%), var(--pointer-glow-wide), transparent 58%)",
      "mix-blend-mode": "var(--pointer-blend)",
    },
  ],
  [
    "pointer-aura-layer-core",
    {
      background:
        "radial-gradient(circle 14vmax at var(--pointer-x, 50%) var(--pointer-y, 35%), var(--pointer-glow-core), transparent 62%)",
      "mix-blend-mode": "var(--pointer-blend)",
      opacity: "0.85",
    },
  ],
  [
    "pointer-aura-layer-ring",
    {
      background:
        "radial-gradient(circle 7vmax at var(--pointer-x, 50%) var(--pointer-y, 35%), transparent 42%, var(--pointer-glow-ring) 52%, transparent 68%)",
      "mix-blend-mode": "var(--pointer-blend)",
      opacity: "0.55",
    },
  ],
];

export const atelierPreflight = `
  /* Atelier — light (default) */
  html[data-style="atelier"][data-theme="light"],
  html[data-style="atelier"]:not([data-theme]),
  html:not([data-style])[data-theme="light"],
  html:not([data-style]):not([data-theme]) {
    color-scheme: light;
    --color-background: #eef1f5;
    --color-surface: #e4e9f0;
    --text-heading: #14151a;
    --text-body: #3a3e46;
    --text-muted: #5f6670;
    --text-faint: #848b96;
    --border-subtle: rgba(20, 21, 26, 0.12);
    --border-medium: rgba(20, 21, 26, 0.18);
    --glass-bg: rgba(255, 255, 255, 0.55);
    --glass-bg-hover: rgba(255, 255, 255, 0.75);
    --glass-border: rgba(20, 21, 26, 0.1);
    --tag-bg: transparent;
    --nav-bg: rgba(238, 241, 245, 0.78);
    --nav-bg-solid: rgba(238, 241, 245, 0.94);
    --nav-active: rgba(143, 115, 85, 0.12);
    --nav-hover: rgba(20, 21, 26, 0.04);
    --hero-glow: rgba(143, 115, 85, 0.18);
    --hero-glow-2: rgba(90, 120, 150, 0.12);
    --hero-mesh:
      radial-gradient(ellipse 80% 60% at 85% 15%, rgba(143, 115, 85, 0.14), transparent 55%),
      radial-gradient(ellipse 70% 50% at 10% 80%, rgba(100, 130, 160, 0.12), transparent 50%),
      linear-gradient(165deg, rgba(255, 255, 255, 0.55), transparent 45%);
    --pointer-glow: rgba(143, 115, 85, 0.2);
    --pointer-glow-wide: rgba(143, 115, 85, 0.22);
    --pointer-glow-core: rgba(196, 150, 100, 0.35);
    --pointer-glow-ring: rgba(143, 115, 85, 0.45);
    --pointer-blend: multiply;
    --noise-opacity: 0.07;
    --band-bg: rgba(255, 255, 255, 0.55);
    --row-hover: rgba(143, 115, 85, 0.08);
    --theme-accent: #8f7355;
    --theme-accent-light: #a68968;
    --theme-muted: rgba(143, 115, 85, 0.12);
    --selection-bg: rgba(143, 115, 85, 0.18);
    --focus-ring-color: rgba(143, 115, 85, 0.55);
  }

  /* Atelier — dark */
  html[data-style="atelier"][data-theme="dark"],
  html:not([data-style])[data-theme="dark"] {
    color-scheme: dark;
    --color-background: #0e0f12;
    --color-surface: #16181d;
    --text-heading: #edeeef;
    --text-body: #c4c7cc;
    --text-muted: #8b919a;
    --text-faint: #6b7078;
    --border-subtle: rgba(237, 238, 239, 0.1);
    --border-medium: rgba(237, 238, 239, 0.16);
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-bg-hover: rgba(255, 255, 255, 0.06);
    --glass-border: rgba(255, 255, 255, 0.08);
    --tag-bg: transparent;
    --nav-bg: rgba(14, 15, 18, 0.72);
    --nav-bg-solid: rgba(14, 15, 18, 0.94);
    --nav-active: rgba(166, 137, 104, 0.16);
    --nav-hover: rgba(255, 255, 255, 0.04);
    --hero-glow: rgba(166, 137, 104, 0.16);
    --hero-glow-2: rgba(120, 140, 180, 0.1);
    --hero-mesh:
      radial-gradient(ellipse 80% 60% at 85% 15%, rgba(166, 137, 104, 0.14), transparent 55%),
      radial-gradient(ellipse 70% 50% at 8% 75%, rgba(80, 100, 140, 0.12), transparent 50%);
    --pointer-glow: rgba(166, 137, 104, 0.18);
    --pointer-glow-wide: rgba(166, 137, 104, 0.2);
    --pointer-glow-core: rgba(220, 180, 130, 0.28);
    --pointer-glow-ring: rgba(196, 168, 130, 0.4);
    --pointer-blend: screen;
    --noise-opacity: 0.055;
    --band-bg: rgba(255, 255, 255, 0.025);
    --row-hover: rgba(166, 137, 104, 0.08);
    --theme-accent: #a68968;
    --theme-accent-light: #c4a882;
    --theme-muted: rgba(166, 137, 104, 0.12);
    --selection-bg: rgba(166, 137, 104, 0.28);
    --focus-ring-color: rgba(166, 137, 104, 0.55);
  }

  html[data-style="atelier"] body,
  html:not([data-style]) body {
    background-color: var(--color-background);
    color: var(--text-body);
    overflow-x: hidden;
  }

  .text-link::after,
  .text-link-muted::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s var(--ease-atelier);
    opacity: 0.7;
  }
  .text-link:hover::after,
  .text-link-muted:hover::after,
  .text-link:focus-visible::after,
  .text-link-muted:focus-visible::after {
    transform: scaleX(1);
  }
  .text-link:hover .text-link-arrow,
  .text-link-muted:hover .text-link-arrow {
    transform: translateX(4px);
  }
  .nav-link::after {
    content: "";
    position: absolute;
    left: 0.6rem;
    right: 0.6rem;
    bottom: 0.15rem;
    height: 1px;
    background: var(--theme-accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s var(--ease-atelier);
  }
  .nav-link:hover::after,
  .nav-link[data-active="true"]::after {
    transform: scaleX(1);
  }
  .project-band {
    transition: background-color 0.4s var(--ease-atelier);
  }
  .project-glass:hover .project-band,
  .project-band:hover {
    background-color: var(--row-hover);
  }
`;
