import React from "react";
import { SUN_SEAL_PATH_D } from "../scene/sun-seal-path.js";

/**
 * Opening mark: 九叠篆「孙」.
 * Path from jiudiezhuan.com glyph jdz-8058-1 (孙/孫 · sūn); fill follows theme via currentColor.
 * @param {{className?: string}} props
 * @returns {React.ReactElement}
 */
export function SunSeal({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 300"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Glyph path from jiudiezhuan.com — 孙; stroke thickens the filled corridors */}
      <path
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        d={SUN_SEAL_PATH_D}
      />
    </svg>
  );
}
