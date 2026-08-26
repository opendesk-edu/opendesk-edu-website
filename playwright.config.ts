import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "fs";

// Use the system Chromium when present (common on dev hosts where the
// Playwright-bundled browser revision isn't downloaded). Falls back to the
// bundled browser otherwise. In CI we always use the bundled/installed browser.
const systemChromium = "/usr/bin/chromium";
const useSystemChromium = !process.env.CI && existsSync(systemChromium);

const isCI = !!process.env.CI;
// A distinct port in CI avoids clashing with any stray process on the shared
// self-hosted runner; locally we use the conventional 3000.
const port = isCI ? "3001" : "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(useSystemChromium
      ? { launchOptions: { executablePath: systemChromium, args: ["--no-sandbox"] } }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Serve a production build: HTTP-status assertions are only meaningful
    // against a stable server, and this also tests the real deployed behavior
    // (SSG with dynamicParams=false + static not-found boundary).
    command: `npm run build && npm run start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 300 * 1000,
  },
});
