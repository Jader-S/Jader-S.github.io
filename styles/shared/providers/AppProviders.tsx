"use client";

import type { ReactNode } from "react";
import StyleRail from "@/styles/shared/chrome/StyleRail";
import SkillShareRail from "@/styles/shared/chrome/SkillShareRail";
import { StyleProvider } from "@/styles/shared/providers/StyleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { StyleMode } from "@/styles/registry";

export default function AppProviders({
  style,
  children,
  hideChrome = false,
}: {
  style: StyleMode;
  children: ReactNode;
  /** When true, skip StyleRail / SkillShareRail (e.g. blueprint build phase owns chrome). */
  hideChrome?: boolean;
}) {
  return (
    <ThemeProvider>
      <StyleProvider style={style}>
        {children}
        {!hideChrome ? (
          <>
            <StyleRail />
            <SkillShareRail />
          </>
        ) : null}
      </StyleProvider>
    </ThemeProvider>
  );
}
