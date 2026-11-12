/** Classic (经典) — Uno shortcuts, rules, and CSS variables. */
export const classicShortcuts = {
  "glass-card":
    "rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl backdrop-saturate-150",
  "glass-card-interactive":
    "glass-card transition-[border-color,background-color,transform,box-shadow] duration-300 hover:border-theme/25 hover:bg-[var(--glass-bg-hover)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)]",
  "classic-section-shell": "relative px-4 py-16 sm:px-6 sm:py-20 md:py-28",
  "classic-section-shell-frost":
    "classic-section-shell isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:z-0 before:border-y before:border-[var(--glass-border)] before:bg-[var(--section-frost-bg)] before:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] before:backdrop-blur-2xl before:backdrop-saturate-150 before:content-empty",
  "classic-section-inner": "relative z-10 mx-auto max-w-6xl",
  "classic-section-title":
    "text-2xl font-bold tracking-tight text-heading sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight",
  "classic-section-subtitle":
    "text-sm leading-relaxed text-muted sm:text-base md:text-lg",
  "classic-tech-tag":
    "rounded-md border border-[var(--glass-border)] bg-[var(--tag-bg)] px-2.5 py-1 text-xs text-muted backdrop-blur-md transition-[border-color,color,background-color] duration-200 hover:border-theme/35 hover:bg-[var(--glass-bg-hover)] hover:text-theme-light",
  "btn-primary":
    "inline-flex w-full items-center justify-center rounded-full bg-theme/90 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(13,148,136,0.25)] backdrop-blur-md transition-[opacity,transform,background-color] duration-200 hover:bg-theme hover:opacity-95 hover:scale-[1.02] focus-ring sm:w-auto sm:px-7",
  "btn-ghost":
    "inline-flex w-full items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-3 text-sm font-semibold text-body shadow-sm backdrop-blur-xl backdrop-saturate-150 transition-[border-color,color,background-color] duration-200 hover:border-theme/40 hover:bg-[var(--glass-bg-hover)] hover:text-theme-light focus-ring sm:w-auto sm:px-7",
  "stat-card":
    "glass-card relative overflow-hidden p-4 sm:p-5 md:p-6 before:content-empty before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-theme/40",
  "bg-grid-pattern": "bg-grid-lines",
  "bg-grid": "bg-[length:48px_48px]",
  "hero-overlay": "hero-gradient-overlay",
} as const;

export const classicRules: [string, Record<string, string>][] = [
  [
    "bg-grid-lines",
    {
      "background-image":
        "linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)",
    },
  ],
  [
    "hero-gradient-overlay",
    {
      background:
        "linear-gradient(to bottom, transparent, var(--hero-overlay-mid), var(--hero-overlay-end))",
    },
  ],
];

export const classicPreflight = `
  /* Classic — dark */
  html[data-style="classic"][data-theme="dark"] {
    color-scheme: dark;
    --color-background: #050508;
    --color-surface: #0c0c14;
    --text-heading: #f8fafc;
    --text-body: #e2e8f0;
    --text-muted: #94a3b8;
    --text-faint: #64748b;
    --border-subtle: rgba(255, 255, 255, 0.1);
    --border-medium: rgba(255, 255, 255, 0.16);
    --glass-bg: rgba(8, 12, 20, 0.28);
    --glass-bg-hover: rgba(12, 18, 28, 0.4);
    --glass-border: rgba(255, 255, 255, 0.14);
    --tag-bg: rgba(255, 255, 255, 0.06);
    --nav-bg: rgba(5, 5, 8, 0.35);
    --nav-bg-solid: rgba(5, 5, 8, 0.48);
    --nav-active: rgba(255, 255, 255, 0.12);
    --nav-hover: rgba(255, 255, 255, 0.06);
    --grid-color: rgba(255, 255, 255, 0.03);
    --hero-overlay-mid: rgba(5, 5, 8, 0.04);
    --hero-overlay-end: rgba(5, 5, 8, 0.18);
    --section-frost-bg: rgba(6, 8, 14, 0.55);
    --vanta-bg: #050508;
    --theme-accent: #14b8a6;
    --theme-accent-light: #5eead4;
    --theme-muted: rgba(20, 184, 166, 0.15);
    --selection-bg: rgba(20, 184, 166, 0.35);
    --focus-ring-color: rgba(20, 184, 166, 0.6);
  }

  /* Classic — light（白天 waves） */
  html[data-style="classic"][data-theme="light"] {
    color-scheme: light;
    --color-background: #d8e2ec;
    --color-surface: #cfd9e4;
    --text-heading: #0f172a;
    --text-body: #1e293b;
    --text-muted: #475569;
    --text-faint: #64748b;
    --border-subtle: rgba(15, 23, 42, 0.1);
    --border-medium: rgba(15, 23, 42, 0.16);
    --glass-bg: rgba(255, 255, 255, 0.48);
    --glass-bg-hover: rgba(255, 255, 255, 0.66);
    --glass-border: rgba(15, 23, 42, 0.1);
    --tag-bg: rgba(15, 23, 42, 0.04);
    --nav-bg: rgba(216, 226, 236, 0.78);
    --nav-bg-solid: rgba(216, 226, 236, 0.94);
    --nav-active: rgba(13, 148, 136, 0.14);
    --nav-hover: rgba(15, 23, 42, 0.05);
    --grid-color: rgba(15, 23, 42, 0.04);
    --hero-overlay-mid: transparent;
    --hero-overlay-end: transparent;
    --section-frost-bg: rgba(232, 238, 245, 0.58);
    --vanta-bg: #d8e2ec;
    --theme-accent: #0f766e;
    --theme-accent-light: #115e59;
    --theme-muted: rgba(15, 118, 110, 0.12);
    --selection-bg: rgba(15, 118, 110, 0.28);
    --focus-ring-color: rgba(15, 118, 110, 0.55);
  }

  html[data-style="classic"] body {
    background-color: transparent;
    color: var(--text-body);
    overflow-x: hidden;
  }

  html[data-viewport="mobile"] .glass-card-interactive:hover {
    transform: none;
  }
  html[data-style="classic"][data-theme="light"] .glass-card-interactive:hover {
    box-shadow: 0 12px 36px rgba(15, 23, 42, 0.1);
  }
  html[data-style="classic"][data-theme="dark"] .glass-card-interactive:hover {
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  }
`;
