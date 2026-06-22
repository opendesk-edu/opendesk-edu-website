import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    passWithNoTests: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      enabled: true,
      include: ["src/**"],
      exclude: ["src/test/**", "src/**/*.test.*", "src/**/__tests__/**", "src/**/*.d.ts", "src/proxy.ts"],
      reporter: ["text", "text-summary"],
      thresholds: {
        lines: 72,
        functions: 64,
        branches: 62,
        statements: 70,
      },
    },
  },
});
