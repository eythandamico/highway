import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const consumerDir = process.env.HIGHWAY_CONSUMER_DIR;
const consumerPort = process.env.HIGHWAY_CONSUMER_PORT || "5192";
const consumerURL = `http://127.0.0.1:${consumerPort}`;

export default defineConfig({
  testDir: "./tests/package-browser",
  outputDir: "./test-results/packages",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: consumerURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `npm exec -- vite --host 127.0.0.1 --port ${consumerPort} --strictPort`,
      cwd: consumerDir || "examples/highway-vite",
      url: consumerURL,
      reuseExistingServer: !consumerDir && !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev:showcase -- --force",
      url: "http://localhost:5190",
      reuseExistingServer: false,
      env: { HIGHWAY_TEST_CACHE_DIR: resolve("node_modules/.vite-package-tests") },
      timeout: 120_000,
    },
  ],
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "reduced-motion", use: { viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" } },
  ],
});
