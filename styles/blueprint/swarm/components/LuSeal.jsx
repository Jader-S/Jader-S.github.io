import React from "react";
import { LU_SEAL_PATH_D } from "../scene/lu-seal-path.js";

/**
 * Opening mark: 九叠篆「卢」.
 * Path from jiudiezhuan.com glyph jdz-8211-1; fill follows theme via currentColor.
 * @param {{className?: string}} props
 * @returns {React.ReactElement}
 */
export function LuSeal({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 300"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Glyph path from jiudiezhuan.com — 卢; stroke thickens the filled corridors */}
      <path
        stroke="currentColor"
        strokeWidth="10"
        strokeLinejoin="round"
        d={LU_SEAL_PATH_D}
      />
    </svg>
  );
}
