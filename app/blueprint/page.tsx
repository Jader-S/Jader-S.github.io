"use client";

import dynamic from "next/dynamic";
import AppProviders from "@/styles/shared/providers/AppProviders";

const BlueprintHome = dynamic(() => import("@/styles/blueprint"), {
  ssr: false,
});

export default function BlueprintPage() {
  return (
    <AppProviders style="blueprint" hideChrome>
      <BlueprintHome />
    </AppProviders>
  );
}
