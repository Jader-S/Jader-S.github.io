import type { NextConfig } from "next";
import { basePath, isGithubPages } from "./lib/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Parent dir (E:\Jader) has its own lockfile; pin tracing to this project.
  outputFileTracingRoot: process.cwd(),
  // Expose basePath to client components (GITHUB_PAGES alone is stripped from the browser bundle).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isGithubPages
    ? {
        output: "export",
        ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
