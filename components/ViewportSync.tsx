"use client";

import { useEffect } from "react";
import { useViewport } from "@/lib/hooks/useViewport";

/** 将视口状态同步到 <html data-viewport>，供 CSS 选择器使用 */
export default function ViewportSync() {
  const { viewport } = useViewport();

  useEffect(() => {
    document.documentElement.dataset.viewport = viewport;
    return () => {
      delete document.documentElement.dataset.viewport;
    };
  }, [viewport]);

  return null;
}
