import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/invariant-browser",
  outputDir: "./test-results/invariant",
  fullyParallel: true,
  workers: 1,
  reporter: "list",
  timeout: 120_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: "http://localhost:5190",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev:showcase",
      url: "http://localhost:5190",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev:demo",
      url: "http://localhost:5191/demo",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "narrow", use: { viewport: { width: 320, height: 780 }, isMobile: true, hasTouch: true } },
    { name: "reduced-motion", use: { viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" } },
  ],
});
