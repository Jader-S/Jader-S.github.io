"use client";

import dynamic from "next/dynamic";
import AppProviders from "@/styles/shared/providers/AppProviders";

const ParticleHome = dynamic(() => import("@/styles/particle"), {
  ssr: false,
});

export default function ParticlePage() {
  return (
    <AppProviders style="particle">
      <ParticleHome />
    </AppProviders>
  );
}
