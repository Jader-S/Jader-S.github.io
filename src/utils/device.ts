/**
 * Detect WebGL2 support. If false, the UI switches to a 2D fallback.
 */
export function detectWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('webgl2');
    return !!ctx;
  } catch {
    return false;
  }
}

function safeMatch(query: string): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return false; // jsdom / old webview
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

export function detectReducedMotion(): boolean {
  return safeMatch('(prefers-reduced-motion: reduce)');
}

export function detectMobile(): boolean {
  return safeMatch('(max-width: 768px)');
}

export function detectPortrait(): boolean {
  return safeMatch('(orientation: portrait)') || safeMatch('(max-aspect-ratio: 4/5)');
}