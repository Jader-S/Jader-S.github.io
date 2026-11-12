import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import { I18nProvider } from "@/components/I18nProvider";
import SkipLink from "@/components/SkipLink";
import { localeInitScript } from "@/lib/i18n";
import { basePath } from "@/lib/site";
import { styleInitScript } from "@/lib/style";
import { themeInitScript } from "@/lib/theme";
import "@unocss/reset/tailwind.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "孙珺宇 Jader | 高级前端工程师",
  description:
    "孙珺宇（Jader）— 7 年前端工程师，专注性能治理与架构重构、数字孪生、复杂数据可视化与 AI 工程。现任施耐德电气前端技术负责人。",
  keywords: [
    "孙珺宇",
    "Jader",
    "前端工程师",
    "React",
    "Vue",
    "Three.js",
    "性能优化",
    "数字孪生",
    "AI Agent",
    "ASTRA",
  ],
  authors: [{ name: "Jader Sun", url: "https://github.com/Jader-S" }],
  openGraph: {
    title: "孙珺宇 Jader | 高级前端工程师",
    description: "7 年前端工程师，专注性能治理、数字孪生与 AI 工程。ASTRA 太空站作者。",
    type: "website",
    locale: "zh_CN",
    siteName: "Jader · ASTRA Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "孙珺宇 Jader | 高级前端工程师",
    description: "7 年前端工程师，专注性能治理、数字孪生与 AI 工程。ASTRA 太空站作者。",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: styleInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeInitScript }} />
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--font-display:var(--font-noto-serif-sc),var(--font-fraunces),serif}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${notoSerifSc.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <I18nProvider>
          <SkipLink />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
