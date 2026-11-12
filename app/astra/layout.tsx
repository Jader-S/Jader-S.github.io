import type { Metadata } from "next";
import { basePath } from "@/lib/site";
import { astraStyle } from "@/styles/astra/meta";

export const metadata: Metadata = {
  title: astraStyle.title,
  icons: {
    icon: `${basePath}${astraStyle.favicon}`,
  },
};

export default function AstraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
