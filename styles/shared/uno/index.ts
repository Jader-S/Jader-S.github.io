/** Shared Uno shortcuts used by all styles + app shell. */
export const sharedShortcuts = {
  "text-heading": "text-[var(--text-heading)]",
  "text-body": "text-[var(--text-body)]",
  "text-muted": "text-[var(--text-muted)]",
  "text-faint": "text-[var(--text-faint)]",
  "border-divider": "border-[var(--border-subtle)]",
  "bg-active": "bg-[var(--nav-active)]",
  "bg-hover": "bg-[var(--nav-hover)]",
  "theme-text": "text-theme",
  "focus-ring": "outline-none",
  "skip-link":
    "fixed left-4 top-4 z-[100] -translate-y-20 rounded-sm bg-theme px-4 py-2 text-sm font-medium text-white opacity-0 transition-transform focus-visible:translate-y-0 focus-visible:opacity-100 focus-ring",
} as const;

export const sharedRules: [string, Record<string, string>][] = [
  ["animate-fade-in", { animation: "atelierFade 0.8s var(--ease-atelier) forwards" }],
  ["animate-rise", { animation: "atelierRise 0.85s var(--ease-atelier) forwards" }],
  ["animate-slide-up", { animation: "slideUp 0.7s ease-out forwards" }],
  ["animate-delay-100", { "animation-delay": "100ms" }],
  ["animate-delay-200", { "animation-delay": "200ms" }],
  ["animate-delay-300", { "animation-delay": "300ms" }],
  ["animate-delay-400", { "animation-delay": "400ms" }],
  ["text-balance", { "text-wrap": "balance" }],
  ["text-pretty", { "text-wrap": "pretty" }],
  [
    "line-clamp-2",
    {
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-line-clamp": "2",
      "-webkit-box-orient": "vertical",
    },
  ],
  [
    "line-clamp-3",
    {
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-line-clamp": "3",
      "-webkit-box-orient": "vertical",
    },
  ],
];

export const sharedPreflight = `
  :root {
    --ease-atelier: cubic-bezier(0.22, 1, 0.36, 1);
  }

  html {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  a:focus:not(:focus-visible),
  button:focus:not(:focus-visible),
  .focus-ring:focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
  }
  .focus-ring:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--color-background),
      0 0 0 4px var(--focus-ring-color);
  }
  ::selection {
    background-color: var(--selection-bg);
    color: var(--text-heading);
  }
  [id] {
    scroll-margin-top: 5.5rem;
  }
  @media (max-width: 767px) {
    [id] {
      scroll-margin-top: 4.25rem;
    }
  }
  html[data-viewport="mobile"] body {
    -webkit-tap-highlight-color: transparent;
  }
  @keyframes atelierFade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes atelierRise {
    0% { opacity: 0; transform: translateY(12px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes slideUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;
