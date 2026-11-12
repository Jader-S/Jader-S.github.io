import { defineConfig, presetWind3 } from "unocss";
import { astraPreflight, astraRules, astraShortcuts } from "./styles/astra/uno";
import { atelierPreflight, atelierRules, atelierShortcuts } from "./styles/atelier/uno";
import {
  blueprintPreflight,
  blueprintRules,
  blueprintShortcuts,
} from "./styles/blueprint/uno";
import { classicPreflight, classicRules, classicShortcuts } from "./styles/classic/uno";
import {
  particlePreflight,
  particleRules,
  particleShortcuts,
} from "./styles/particle/uno";
import {
  sharedPreflight,
  sharedRules,
  sharedShortcuts,
} from "./styles/shared/uno";

/**
 * Uno merges shared + per-style packages.
 * Add a style: create `styles/<id>/uno.ts` and spread it here.
 */
export default defineConfig({
  content: {
    filesystem: [
      "app/**/*.{html,js,ts,jsx,tsx}",
      "components/**/*.{html,js,ts,jsx,tsx}",
      "styles/**/*.{html,js,ts,jsx,tsx}",
    ],
  },
  presets: [presetWind3()],
  theme: {
    colors: {
      background: "var(--color-background)",
      surface: "var(--color-surface)",
      theme: {
        DEFAULT: "var(--theme-accent)",
        light: "var(--theme-accent-light)",
      },
    },
    fontFamily: {
      sans: "var(--font-geist-sans), system-ui, sans-serif",
      serif: "var(--font-display), 'Noto Serif SC', 'Songti SC', serif",
      mono: "var(--font-geist-mono), monospace",
    },
  },
  shortcuts: {
    ...sharedShortcuts,
    ...atelierShortcuts,
    ...classicShortcuts,
    ...particleShortcuts,
    ...blueprintShortcuts,
    ...astraShortcuts,
  },
  rules: [
    ...sharedRules,
    ...atelierRules,
    ...classicRules,
    ...particleRules,
    ...blueprintRules,
    ...astraRules,
  ],
  preflights: [
    {
      getCSS: () => `
        ${sharedPreflight}
        ${atelierPreflight}
        ${classicPreflight}
        ${particlePreflight}
        ${blueprintPreflight}
        ${astraPreflight}
      `,
    },
  ],
});
