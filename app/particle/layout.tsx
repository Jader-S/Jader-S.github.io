import type { Metadata } from "next";
import { basePath } from "@/lib/site";
import { particleStyle } from "@/styles/particle/meta";

export const metadata: Metadata = {
  title: particleStyle.title,
  icons: {
    icon: `${basePath}${particleStyle.favicon}`,
  },
};

export default function ParticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
