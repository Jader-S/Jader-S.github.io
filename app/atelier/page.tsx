"use client";

import dynamic from "next/dynamic";
import AppProviders from "@/styles/shared/providers/AppProviders";

const AtelierHome = dynamic(() => import("@/styles/atelier"), {
  ssr: false,
});

export default function AtelierPage() {
  return (
    <AppProviders style="atelier">
      <AtelierHome />
    </AppProviders>
  );
}
