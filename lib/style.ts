import { basePath } from "@/lib/site";
import {
  DEFAULT_STYLE,
  STYLE_IDS,
  STYLE_PATHS,
  isStyleMode,
  type StyleMode,
} from "@/styles/registry";

export type { StyleMode };
export { DEFAULT_STYLE, STYLE_IDS, STYLE_PATHS, isStyleMode } from "@/styles/registry";

/** @deprecated Prefer STYLE_IDS */
export const STYLE_MODES = STYLE_IDS;

export const STYLE_STORAGE_KEY = "portfolio-style";

export function getStyleHref(mode: StyleMode): string {
  return `${basePath}${STYLE_PATHS[mode]}`;
}

/** Normalize pathname (strip basePath) then map to style, or null if not a style route. */
export function styleFromPathname(pathname: string): StyleMode | null {
  let path = pathname;
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
    path = path.slice(basePath.length) || "/";
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  for (const id of STYLE_IDS) {
    if (path === STYLE_PATHS[id]) return id;
  }
  return null;
}

export function getStoredStyle(): StyleMode {
  if (typeof window === "undefined") return DEFAULT_STYLE;
  const stored = localStorage.getItem(STYLE_STORAGE_KEY);
  return isStyleMode(stored) ? stored : DEFAULT_STYLE;
}

export function applyStyle(mode: StyleMode) {
  document.documentElement.dataset.style = mode;
  localStorage.setItem(STYLE_STORAGE_KEY, mode);
}

/** Open the target style in a new window/tab so plugins load in a fresh page. */
export function openStyleWindow(mode: StyleMode) {
  window.open(getStyleHref(mode), "_blank", "noopener,noreferrer");
}

/** FOUC-safe init: prefer route path, else last stored style. */
export const styleInitScript = `(function(){try{var k=${JSON.stringify(STYLE_STORAGE_KEY)};var base=${JSON.stringify(basePath)};var paths=${JSON.stringify(STYLE_PATHS)};var ids=${JSON.stringify(STYLE_IDS)};var path=location.pathname;if(base&&(path===base||path.indexOf(base+"/")===0))path=path.slice(base.length)||"/";if(path.length>1&&path.slice(-1)==="/")path=path.slice(0,-1);var mode;for(var i=0;i<ids.length;i++){if(path===paths[ids[i]]){mode=ids[i];break}}if(!mode){var m=localStorage.getItem(k);mode=ids.indexOf(m)>=0?m:${JSON.stringify(DEFAULT_STYLE)}}document.documentElement.dataset.style=mode;if(ids.some(function(id){return path===paths[id]}))try{localStorage.setItem(k,mode)}catch(e){}}catch(e){document.documentElement.dataset.style=${JSON.stringify(DEFAULT_STYLE)}}})();`;
