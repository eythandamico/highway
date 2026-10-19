import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

type RegistryEntry = {
  id: string;
  name: string;
  group: string;
  previewId: string;
};

const registry = JSON.parse(
  readFileSync(new URL("../../components/library/invariant-registry.json", import.meta.url), "utf8"),
) as RegistryEntry[];

test.beforeEach(async ({ page }) => {
  const localOrigin = new URL("http://localhost:5190").origin;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === localOrigin) {
      await route.continue();
    } else if (url.origin === "https://images.unsplash.com") {
      await route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1 1\"><rect width=\"1\" height=\"1\" fill=\"#ddd\"/></svg>",
      });
    } else {
      await route.abort("blockedbyclient");
    }
  });
});

async function currentPreviewFrame(page: Page) {
  const frameLocator = page.locator("iframe.library-invariant-preview");
  const handle = await frameLocator.elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error("Invariant preview iframe did not create a document");
  return { frameLocator, frame };
}

async function loadShowcase(page: Page, componentId = "inv-segmented-control") {
  await page.goto(`/showcase?collection=invariant&component=${componentId}`);
  // The preview document can mount before the app's RSC client finishes hydration.
  // Exercise the live filter once so subsequent link and theme actions are real UI events.
  await page.waitForFunction(() => {
    const input = document.querySelector<HTMLInputElement>("#component-search");
    return input && Object.entries(input).some(([key, value]) =>
      key.startsWith("__reactProps$") && typeof (value as { onChange?: unknown }).onChange === "function",
    );
  });
  const search = page.getByRole("textbox", { name: "Search components" });
  const catalogue = page.getByRole("navigation", { name: "Component library" });
  await search.fill("__preview_ready__");
  await expect(page.getByRole("status")).toContainText("No components match");
  await search.clear();
  await expect(catalogue.getByRole("link")).toHaveCount(50);
  const { frameLocator, frame } = await currentPreviewFrame(page);
  await expect(frameLocator).toBeVisible();
  await expect(frame.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
  return { frameLocator, frame };
}

test("Invariant collection exposes all 50 unique components and loads every isolated preview", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The exhaustive catalogue traversal runs once on desktop.");
  test.setTimeout(180_000);

  expect(registry).toHaveLength(50);
  expect(new Set(registry.map((entry) => entry.id)).size).toBe(50);
  expect(new Set(registry.map((entry) => entry.previewId)).size).toBe(50);

  await loadShowcase(page);
  const catalogue = page.getByRole("navigation", { name: "Component library" });
  const links = catalogue.getByRole("link");
  await expect(links).toHaveCount(50);
  expect(await links.allTextContents()).toEqual(registry.map((entry) => entry.name.split(",")[0]));
  await expect(page.getByRole("heading", { name: "SegmentedControl", exact: true })).toBeVisible();

  for (const entry of registry) {
    const linkName = entry.name.split(",")[0];
    await catalogue.getByRole("link", { name: linkName, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`component=${entry.id}$`));
    const selectedPreview = await currentPreviewFrame(page);
    await expect(selectedPreview.frameLocator).toHaveAttribute("src", new RegExp(`component=${entry.previewId}(?:&|$)`));
    await expect.poll(() => new URL(selectedPreview.frame.url()).searchParams.get("component")).toBe(entry.previewId);
    await expect(selectedPreview.frame.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
    await expect(selectedPreview.frame.locator("body")).not.toContainText("Preview unavailable");
  }
});

test("Invariant catalogue search filters and restores the component collection", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Catalogue search is covered once on desktop.");
  await loadShowcase(page);
  const search = page.getByRole("textbox", { name: "Search components" });
  const links = page.getByRole("navigation", { name: "Component library" }).getByRole("link");

  await search.fill("search");
  const matchingEntries = registry.filter((entry) => `${entry.name} ${entry.group}`.toLowerCase().includes("search"));
  await expect(links).toHaveCount(matchingEntries.length);
  expect(await links.allTextContents()).toEqual(matchingEntries.map((entry) => entry.name.split(",")[0]));

  await search.fill("no-matching-component");
  await expect(links).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("No components match");

  await search.clear();
  await expect(links).toHaveCount(50);
});

test("segmented control and toggle previews update their selected state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Component interaction contracts run once on desktop.");

  const { frame } = await loadShowcase(page, "inv-segmented-control");
  const all = frame.locator('button[data-tab-id="all"]');
  const archived = frame.locator('button[data-tab-id="archived"]');
  const selectedColor = await all.evaluate((button) => getComputedStyle(button).color);
  const idleColor = await archived.evaluate((button) => getComputedStyle(button).color);
  expect(selectedColor).not.toBe(idleColor);
  await archived.click();
  await expect.poll(() => archived.evaluate((button) => getComputedStyle(button).color)).toBe(selectedColor);
  await expect.poll(() => all.evaluate((button) => getComputedStyle(button).color)).toBe(idleColor);

  const toggle = await loadShowcase(page, "inv-toggle");
  const previewSwitch = toggle.frame.getByRole("switch").first();
  await expect(previewSwitch).toHaveAttribute("aria-checked", "false");
  await previewSwitch.click();
  await expect(previewSwitch).toHaveAttribute("aria-checked", "true");
});

test("modal preview has dialog semantics, traps focus, closes with Escape, and restores focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Focus management contract runs once on desktop.");

  const { frame } = await loadShowcase(page, "inv-modal");
  const trigger = frame.getByRole("button", { name: "Open Modal" });
  await trigger.focus();
  await trigger.click();

  const dialog = frame.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  const closeButton = dialog.getByRole("button", { name: "Close" });
  await expect(closeButton).toBeFocused();

  const lastAction = dialog.getByRole("button", { name: "Save" });
  await lastAction.focus();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(lastAction).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("modal form labels provide accessible names to their inputs", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Form label semantics run once on desktop.");
  const { frame } = await loadShowcase(page, "inv-modal");
  await frame.getByRole("button", { name: "Open Modal" }).click();

  const dialog = frame.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[placeholder="Your name"]')).toHaveAccessibleName("Display name");
  await expect(dialog.locator('input[placeholder="you@example.com"]')).toHaveAccessibleName("Email");
});

test("library theme toggle updates the isolated preview in both light and dark modes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Theme synchronization runs once on desktop.");
  const { frameLocator, frame } = await loadShowcase(page);
  const themeButton = page.getByRole("button", { name: "Toggle light and dark theme" });
  const theme = () => frame.locator("html").getAttribute("data-theme");
  const background = () => frame.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--inv-bg").trim());

  const initialTheme = await theme();
  const initialBackground = await background();
  await themeButton.click();
  const nextTheme = initialTheme === "dark" ? "light" : "dark";
  await expect(frameLocator).toHaveAttribute("src", new RegExp(`theme=${nextTheme}`));
  await expect.poll(theme).toBe(nextTheme);
  const nextBackground = await background();
  expect(nextBackground).not.toBe(initialBackground);

  await themeButton.click();
  await expect(frameLocator).toHaveAttribute("src", new RegExp(`theme=${initialTheme}`));
  await expect.poll(theme).toBe(initialTheme);
  await expect.poll(background).toBe(initialBackground);
});

test("mobile showcase keeps the preview and controls within the viewport", async ({ page }, testInfo) => {
  test.skip(!["phone", "narrow"].includes(testInfo.project.name), "Mobile layout contract runs at phone widths.");
  const { frameLocator, frame } = await loadShowcase(page);

  const shellOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(shellOverflow).toBeLessThanOrEqual(1);
  const frameWidth = await frameLocator.evaluate((element) => element.getBoundingClientRect().width);
  expect(frameWidth).toBeLessThanOrEqual(testInfo.project.name === "narrow" ? 321 : 391);
  const previewViewport = await frame.evaluate(() => ({
    width: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(previewViewport.documentWidth - previewViewport.width).toBeLessThanOrEqual(1);

  const archived = frame.getByRole("button", { name: "Archived" });
  await archived.click();
  await expect(archived).toBeVisible();
});

test("preview transitions respect reduced-motion preference", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "This contract runs under reduced motion.");
  const { frame } = await loadShowcase(page);
  await expect.poll(() => frame.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const transitionDuration = await frame.locator('button[data-tab-id="all"]').evaluate((button) => getComputedStyle(button).transitionDuration);
  expect(transitionDuration.split(",").every((duration) => duration.trim() === "0s")).toBe(true);
});
