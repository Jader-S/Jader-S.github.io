"use client";

import dynamic from "next/dynamic";
import AppProviders from "@/styles/shared/providers/AppProviders";

const ClassicHome = dynamic(() => import("@/styles/classic"), {
  ssr: false,
});

export default function ClassicPage() {
  return (
    <AppProviders style="classic">
      <ClassicHome />
    </AppProviders>
  );
}
