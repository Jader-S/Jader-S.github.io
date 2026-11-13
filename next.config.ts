import type { NextConfig } from "next";
import { basePath, isGithubPages } from "./lib/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // dev 与 build 分离产物目录：`next build` 会清空重建 .next，若 dev 也用它会互相破坏，
  // 并反复触发批量删除防护。dev(NODE_ENV=development) → .next-dev；build/start → .next。
  // 两者可并存：日常迭代只跑 dev，无需 build；生产验收另起端口跑 start 互不影响。
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
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
