import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Space_Grotesk } from "next/font/google";
import { basePath } from "@/lib/site";
import { blueprintStyle } from "@/styles/blueprint/meta";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: blueprintStyle.title,
  icons: {
    icon: `${basePath}${blueprintStyle.favicon}`,
  },
};

export default function BlueprintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${spaceGrotesk.variable} ${sourceSans.variable} ${ibmPlexMono.variable}`}
    >
      {children}
    </div>
  );
}
