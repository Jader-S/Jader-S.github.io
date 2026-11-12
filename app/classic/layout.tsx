import type { Metadata } from "next";
import { basePath } from "@/lib/site";
import { classicStyle } from "@/styles/classic/meta";

export const metadata: Metadata = {
  title: classicStyle.title,
  icons: {
    icon: `${basePath}${classicStyle.favicon}`,
  },
};

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
