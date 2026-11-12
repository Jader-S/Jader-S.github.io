import type { Metadata } from "next";
import { basePath } from "@/lib/site";
import { atelierStyle } from "@/styles/atelier/meta";

export const metadata: Metadata = {
  title: atelierStyle.title,
  icons: {
    icon: `${basePath}${atelierStyle.favicon}`,
  },
};

export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
