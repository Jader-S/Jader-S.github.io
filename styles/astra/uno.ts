/**
 * Uno layer for the ASTRA style.
 *
 * ASTRA renders inside an iframe with its own CSS, so this package has no
 * component styles. It only provides the shared-chrome variables needed by
 * StyleRail (which floats above the iframe) when data-style="astra".
 * See styles/README.md — "Add a new style", step 5.
 */
export const astraShortcuts: Record<string, string> = {};

export const astraRules: Array<[string, Record<string, string>]> = [];

export const astraPreflight = `
html[data-style="astra"] {
  --color-background: #05060a;
  --color-surface: #0b0e14;
  --nav-bg: rgba(8, 11, 18, 0.86);
  --glass-bg: rgba(8, 11, 18, 0.72);
  --glass-border: rgba(120, 220, 255, 0.18);
  --theme-accent: #22d3ee;
  --theme-accent-light: #67e8f9;
  --divider: rgba(255, 255, 255, 0.12);
  --text-body: #dbeafe;
  --text-heading: #f0f9ff;
  --text-muted: #7dd3fc;
  --bg-active: rgba(34, 211, 238, 0.16);
}
`;
