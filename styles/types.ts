/**
 * Contract for a portfolio visual style package under `styles/<id>/`.
 * Keep packages independent; only register shared contracts here.
 */
export type StyleMode = "atelier" | "classic" | "particle" | "blueprint" | "astra";

/** Visual language for shared chrome (toggles, style rail). */
export type ChromeVariant = "atelier" | "classic";

export interface StyleDefinition {
  id: StyleMode;
  /** URL path segment, e.g. `/atelier` */
  path: string;
  /** Favicon under `public/` */
  favicon: string;
  /** Document title */
  title: string;
  /** i18n key under `t.style` */
  labelKey: "atelier" | "classic" | "particle" | "blueprint" | "astra";
  /** Shared chrome look (StyleRail / ThemeToggle / LocaleToggle) */
  chrome: ChromeVariant;
}
