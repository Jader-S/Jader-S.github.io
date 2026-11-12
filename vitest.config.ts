import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Create jsdom once per worker instead of once per file (Vitest default forks).
    pool: "vmThreads",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out", "e2e"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "lib/**/*.{ts,tsx}",
        "components/I18nProvider.tsx",
        "components/ThemeProvider.tsx",
        "components/SkipLink.tsx",
        "styles/registry.ts",
        "styles/shared/chrome/**/*.{ts,tsx}",
        "styles/atelier/components/CookieConsent.tsx",
        "styles/particle/engine/easing.ts",
      ],
      exclude: [
        "**/*.{test,spec}.{ts,tsx}",
        "**/types.ts",
        "lib/i18n/locales/**",
        "lib/hooks/**",
        "lib/cardOrbit.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
