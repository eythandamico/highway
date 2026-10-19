import { expect, test, type Frame, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

type RegistryEntry = {
  id: string;
  name: string;
  group: string;
  previewId: string;
};

type CatalogueEntry = { id: string; name: string; group: string };

const registry = JSON.parse(
  readFileSync(new URL("../../components/library/invariant-registry.json", import.meta.url), "utf8"),
) as RegistryEntry[];
const aliases: Record<string, string> = { "inv-button": "button", "inv-toggle": "switch" };
const foundationEntries: CatalogueEntry[] = [
  { id: "button", name: "Button", group: "Actions" },
  { id: "fields", name: "Form fields", group: "Inputs" },
  { id: "select", name: "Accessible select", group: "Inputs" },
  { id: "date", name: "Date input", group: "Inputs" },
  { id: "switch", name: "Switch / Toggle", group: "Inputs" },
  { id: "dialog", name: "Form dialog", group: "Overlays" },
  { id: "sheet", name: "Sheet", group: "Overlays" },
  { id: "menu", name: "Dropdown menu", group: "Overlays" },
  { id: "card", name: "Raised surface", group: "Display" },
  { id: "status", name: "Status & feedback", group: "Display" },
  { id: "avatars", name: "Generated avatars", group: "Identity" },
  { id: "gradients", name: "Gradients & blur", group: "Materials" },
  { id: "navigation", name: "Office navigation", group: "Yardwork" },
  { id: "bookings", name: "Bookings chart", group: "Yardwork" },
  { id: "theme", name: "Scoped appearance", group: "Theming" },
];
const catalogue = [
  ...foundationEntries,
  ...registry.filter((entry) => !aliases[entry.id]).map(({ id, name, group }) => ({
    id,
    name: name.split(",")[0],
    group,
  })),
].sort((first, second) => first.group.localeCompare(second.group) || first.name.localeCompare(second.name));

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

async function waitForShowcaseHydration(page: Page) {
  await page.waitForFunction(() => {
    const input = document.querySelector<HTMLInputElement>("#component-search");
    return input && Object.entries(input).some(([key, value]) =>
      key.startsWith("__reactProps$") && typeof (value as { onChange?: unknown }).onChange === "function",
    );
  });
  const search = page.getByRole("textbox", { name: "Search components" });
  const componentNav = page.getByRole("navigation", { name: "Component library" });
  await search.fill("__preview_ready__");
  await expect(page.getByText("No components match. Try another name.", { exact: true })).toBeVisible();
  await search.clear();
  await expect(componentNav.getByRole("link")).toHaveCount(63);
  return { search, componentNav };
}

async function loadShowcase(page: Page, componentId = "inv-segmented-control") {
  await page.goto(`/showcase?component=${componentId}`);
  const { componentNav } = await waitForShowcaseHydration(page);
  const canonicalId = aliases[componentId] ?? componentId;
  const legacyAlias = Boolean(aliases[componentId]);
  const entry = registry.find((candidate) => candidate.id === componentId);
  const shouldFrame = Boolean(entry && !legacyAlias);
  const selected = catalogue.find((candidate) => candidate.id === canonicalId);
  if (selected) {
    await expect(page.getByRole("heading", { name: selected.name, exact: true })).toBeVisible();
  }
  await expect(componentNav.locator('[aria-current="page"]')).toHaveAttribute(
    "href",
    `/showcase?component=${canonicalId}`,
  );

  if (shouldFrame) {
    const { frameLocator, frame } = await currentPreviewFrame(page);
    await expect(frameLocator).toBeVisible();
    await expect(frame.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
    return { frameLocator, frame, componentNav };
  }

  await expect(page.locator(".library-preview")).toBeVisible();
  return { frameLocator: null, frame: null, componentNav };
}

async function expectToggleKeyboardBehavior(toggle: Locator) {
  for (const key of ["Space", "Enter"] as const) {
    const initialState = await toggle.getAttribute("aria-checked");
    await toggle.focus();
    await toggle.press(key);
    await expect(toggle).toHaveAttribute("aria-checked", initialState === "true" ? "false" : "true");
  }
}

test("unified catalogue has 63 sorted entries, with legacy aliases resolved to shared components", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Catalogue discovery and aliases run once on desktop.");
  expect(registry).toHaveLength(50);
  expect(new Set(registry.map((entry) => entry.id)).size).toBe(50);
  expect(new Set(registry.map((entry) => entry.previewId)).size).toBe(50);
  expect(foundationEntries).toHaveLength(15);
  expect(catalogue).toHaveLength(63);
  expect(new Set(catalogue.map((entry) => entry.id)).size).toBe(63);

  const { componentNav } = await loadShowcase(page, "button");
  const links = componentNav.getByRole("link");
  const componentIds = await links.evaluateAll((elements) => elements.map((element) =>
    new URL((element as HTMLAnchorElement).href).searchParams.get("component"),
  ));
  expect(componentIds).toEqual(catalogue.map((entry) => entry.id));
  await expect(page.getByText("One library. Invariant by design.")).toBeVisible();
  await expect(componentNav.getByRole("link", { name: "Switch / Toggle", exact: true })).toBeVisible();
  await expect(componentNav.getByRole("link", { name: "Form fields", exact: true })).toBeVisible();
  await expect(componentNav.getByRole("link", { name: "Accessible select", exact: true })).toBeVisible();
  await expect(componentNav.locator('a[href*="inv-button"]')).toHaveCount(0);
  await expect(componentNav.locator('a[href*="inv-toggle"]')).toHaveCount(0);

  for (const [alias, canonical] of Object.entries(aliases)) {
    await page.goto(`/showcase?component=${alias}`);
    const resolved = await waitForShowcaseHydration(page);
    const canonicalEntry = catalogue.find((entry) => entry.id === canonical);
    await expect(page.getByRole("heading", { name: canonicalEntry!.name, exact: true })).toBeVisible();
    await expect(resolved.componentNav.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      `/showcase?component=${canonical}`,
    );
    await expect(page.locator("iframe.library-invariant-preview")).toHaveCount(0);
  }
});

test("all 50 original Invariant previews remain available across the catalogue and direct preview routes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Exhaustive preview loading runs once on desktop.");
  test.setTimeout(180_000);
  await loadShowcase(page);
  const componentNav = page.getByRole("navigation", { name: "Component library" });
  const visited = new Set<string>();

  for (const entry of registry.filter((candidate) => !aliases[candidate.id])) {
    await componentNav.locator(`a[href="/showcase?component=${entry.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`component=${entry.id}$`));
    const { frameLocator, frame } = await currentPreviewFrame(page);
    await expect(frameLocator).toHaveAttribute("src", new RegExp(`component=${entry.previewId}(?:&|$)`));
    await expect.poll(() => new URL(frame.url()).searchParams.get("component")).toBe(entry.previewId);
    await expect(frame.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
    await expect(frame.locator("body")).not.toContainText("Preview unavailable");
    visited.add(entry.id);
  }

  for (const id of Object.keys(aliases)) {
    const entry = registry.find((candidate) => candidate.id === id)!;
    await page.goto(`/invariant-preview/index.html?component=${entry.previewId}&theme=light`);
    await expect(page.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Preview unavailable");
    visited.add(entry.id);
  }

  expect(visited.size).toBe(50);
  expect([...visited].sort()).toEqual(registry.map((entry) => entry.id).sort());
});

test("unified catalogue search filters names across both component sets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Catalogue search is covered once on desktop.");
  await loadShowcase(page);
  const search = page.getByRole("textbox", { name: "Search components" });
  const links = page.getByRole("navigation", { name: "Component library" }).getByRole("link");

  await search.fill("toggle");
  await expect(links).toHaveCount(2);
  expect(await links.allTextContents()).toEqual(["Switch / Toggle", "SearchToggle"]);

  await search.fill("search");
  const matchingEntries = catalogue.filter((entry) => `${entry.name} ${entry.group}`.toLowerCase().includes("search"));
  await expect(links).toHaveCount(matchingEntries.length);
  expect(await links.allTextContents()).toEqual(matchingEntries.map((entry) => entry.name));

  await search.fill("no-matching-component");
  await expect(links).toHaveCount(0);
  await expect(page.getByText("No components match. Try another name.", { exact: true })).toBeVisible();

  await search.clear();
  await expect(links).toHaveCount(63);
});

test("segmented control preview updates its selected state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Component interaction contracts run once on desktop.");
  const { frame } = await loadShowcase(page, "inv-segmented-control");
  const all = frame!.locator('button[data-tab-id="all"]');
  const archived = frame!.locator('button[data-tab-id="archived"]');
  const selectedColor = await all.evaluate((button) => getComputedStyle(button).color);
  const idleColor = await archived.evaluate((button) => getComputedStyle(button).color);
  expect(selectedColor).not.toBe(idleColor);
  await archived.click();
  await expect.poll(() => archived.evaluate((button) => getComputedStyle(button).color)).toBe(selectedColor);
  await expect.poll(() => all.evaluate((button) => getComputedStyle(button).color)).toBe(idleColor);
});

test("canonical Switch and the legacy Toggle adapter support Space and Enter", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Keyboard switch contracts run once on desktop.");

  for (const id of ["switch", "inv-toggle"]) {
    const { frame } = await loadShowcase(page, id);
    expect(frame).toBeNull();
    await expectToggleKeyboardBehavior(page.getByRole("switch", { name: "Show reminders" }));
  }

  await page.goto("/invariant-preview/index.html?component=toggle&theme=light");
  await expect(page.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
  const legacySwitch = page.getByRole("switch").first();
  await expect(legacySwitch).toHaveAttribute("aria-checked", "false");
  await expectToggleKeyboardBehavior(legacySwitch);
});

test("shared Button blocks activation while disabled or loading, including its Invariant adapter", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Button state contracts run once on desktop.");

  const { frame } = await loadShowcase(page, "button");
  expect(frame).toBeNull();
  const button = page.getByRole("button", { name: "Add something good" });
  const clicks = page.getByRole("status");
  await button.click();
  await expect(clicks).toHaveText("1 preview clicks");
  const regularSize = await button.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });

  const disabled = page.getByRole("switch", { name: "Disabled" });
  await disabled.click();
  await expect(disabled).toHaveAttribute("aria-checked", "true");
  await expect(button).toBeDisabled();
  await button.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(clicks).toHaveText("1 preview clicks");
  await disabled.click();

  const loading = page.getByRole("switch", { name: "Loading" });
  await loading.click();
  await expect(loading).toHaveAttribute("aria-checked", "true");
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect.poll(() => button.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  })).toEqual(regularSize);
  await button.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(clicks).toHaveText("1 preview clicks");

  await page.goto("/invariant-preview/index.html?component=button&theme=light");
  await expect(page.locator('main[aria-label="Interactive component preview"]')).toBeVisible();
  const adapterButton = page.getByRole("button", { name: "Button" });
  const adapterToggles = page.getByRole("switch");
  await expect(adapterToggles).toHaveCount(2);
  await adapterToggles.nth(0).press("Space");
  await expect(adapterButton).toHaveAttribute("aria-busy", "true");
  await expect(adapterButton).toBeDisabled();
  await adapterButton.evaluate((element) => (element as HTMLButtonElement).click());
  await adapterToggles.nth(0).press("Space");
  await adapterToggles.nth(1).press("Space");
  await expect(adapterButton).toBeDisabled();
  await adapterButton.evaluate((element) => (element as HTMLButtonElement).click());
  await adapterToggles.nth(1).press("Space");
  await expect(adapterButton).toBeEnabled();
});

test("Invariant RadioGroup selects with ArrowDown and its associated labels", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Radio keyboard and label behavior runs once on desktop.");
  await page.goto("/invariant-preview/index.html?component=radio-group&theme=light");
  await expect(page.locator('main[aria-label="Interactive component preview"]')).toBeVisible();

  const free = page.getByRole("radio", { name: "Free" });
  const pro = page.getByRole("radio", { name: "Pro" });
  const team = page.getByRole("radio", { name: "Team" });
  await expect(pro).toHaveAttribute("aria-checked", "true");
  await pro.focus();
  await pro.press("ArrowDown");
  await expect(team).toHaveAttribute("aria-checked", "true");

  await page.getByText("Free", { exact: true }).click();
  await expect(free).toHaveAttribute("aria-checked", "true");
  await expect(team).toHaveAttribute("aria-checked", "false");
});

test("Invariant Checkbox toggles by Space and its visible label", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Checkbox keyboard and label behavior runs once on desktop.");
  await page.goto("/invariant-preview/index.html?component=checkbox&theme=light");
  await expect(page.locator('main[aria-label="Interactive component preview"]')).toBeVisible();

  const agreement = page.getByRole("checkbox", { name: "I agree to the terms" });
  const updates = page.getByRole("checkbox", { name: "Send me updates" });
  const locked = page.getByRole("checkbox", { name: "Locked by policy" });
  await expect(agreement).toHaveAttribute("aria-checked", "false");
  await expect(updates).toHaveAttribute("aria-checked", "true");
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveAttribute("aria-checked", "false");
  await agreement.focus();
  await agreement.press("Space");
  await expect(agreement).toHaveAttribute("aria-checked", "true");
  await page.getByText("Send me updates", { exact: true }).click();
  await expect(updates).toHaveAttribute("aria-checked", "false");
  const lockedLabel = page.getByText("Locked by policy", { exact: true });
  const lockedLabelBounds = await lockedLabel.boundingBox();
  if (!lockedLabelBounds) throw new Error("Disabled checkbox label is not visible");
  await page.mouse.click(
    lockedLabelBounds.x + lockedLabelBounds.width / 2,
    lockedLabelBounds.y + lockedLabelBounds.height / 2,
  );
  await expect(locked).toHaveAttribute("aria-checked", "false");
});

test("modal preview traps focus, closes with Escape, and restores focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Focus management contract runs once on desktop.");

  const { frame } = await loadShowcase(page, "inv-modal");
  const trigger = frame!.getByRole("button", { name: "Open Modal" });
  await trigger.focus();
  await trigger.click();

  const dialog = frame!.getByRole("dialog", { name: "Settings" });
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
  await frame!.getByRole("button", { name: "Open Modal" }).click();

  const dialog = frame!.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[placeholder="Your name"]')).toHaveAccessibleName("Display name");
  await expect(dialog.locator('input[placeholder="you@example.com"]')).toHaveAccessibleName("Email");
});

test("host and iframe share the canonical light and dark design tokens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Token parity runs once on desktop.");
  const { frameLocator, frame } = await loadShowcase(page);
  if (!frameLocator || !frame) throw new Error("Token parity requires an Invariant preview frame");
  const themeButton = page.getByRole("button", { name: "Toggle light and dark theme" });
  const theme = () => frame.locator("html").getAttribute("data-theme");
  const tokenNames = ["--inv-bg", "--inv-surface", "--inv-heading", "--inv-accent", "--inv-font-body", "--inv-text-base", "--inv-space-md"];
  const readTokens = (context: Page | Frame) => context.locator("html").evaluate((_element, names) => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;visibility:hidden;";
    document.body.appendChild(probe);
    const values: Record<string, string> = {};
    for (const name of names) {
      if (name === "--inv-bg" || name === "--inv-surface" || name === "--inv-accent") {
        probe.style.backgroundColor = `var(${name})`;
        values[name] = getComputedStyle(probe).backgroundColor;
      } else if (name === "--inv-heading") {
        probe.style.color = `var(${name})`;
        values[name] = getComputedStyle(probe).color;
      } else if (name === "--inv-font-body") {
        probe.style.fontFamily = `var(${name})`;
        values[name] = getComputedStyle(probe).fontFamily;
      } else if (name === "--inv-text-base") {
        probe.style.fontSize = `var(${name})`;
        values[name] = getComputedStyle(probe).fontSize;
      } else {
        probe.style.padding = `var(${name})`;
        values[name] = getComputedStyle(probe).paddingTop;
      }
    }
    probe.remove();
    return values;
  }, tokenNames);
  const expectTokenParity = async () => {
    const [hostTokens, iframeTokens] = await Promise.all([readTokens(page), readTokens(frame)]);
    expect(hostTokens).toEqual(iframeTokens);
  };

  await expectTokenParity();
  const initialTheme = await theme();
  const initialBackground = (await readTokens(frame))["--inv-bg"];
  await themeButton.click();
  const nextTheme = initialTheme === "dark" ? "light" : "dark";
  await expect(frameLocator).toHaveAttribute("src", new RegExp(`theme=${nextTheme}`));
  await expect.poll(theme).toBe(nextTheme);
  await expect.poll(async () => {
    const [hostTokens, iframeTokens] = await Promise.all([readTokens(page), readTokens(frame)]);
    return JSON.stringify(hostTokens) === JSON.stringify(iframeTokens);
  }).toBe(true);
  expect((await readTokens(frame))["--inv-bg"]).not.toBe(initialBackground);

  await themeButton.click();
  await expect(frameLocator).toHaveAttribute("src", new RegExp(`theme=${initialTheme}`));
  await expect.poll(theme).toBe(initialTheme);
  await expectTokenParity();
});

test("mobile showcase keeps the preview and controls within the viewport", async ({ page }, testInfo) => {
  test.skip(!["phone", "narrow"].includes(testInfo.project.name), "Mobile layout contract runs at phone widths.");
  const { frameLocator, frame } = await loadShowcase(page);

  const shellOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(shellOverflow).toBeLessThanOrEqual(1);
  const frameWidth = await frameLocator!.evaluate((element) => element.getBoundingClientRect().width);
  expect(frameWidth).toBeLessThanOrEqual(testInfo.project.name === "narrow" ? 321 : 391);
  const previewViewport = await frame!.evaluate(() => ({
    width: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(previewViewport.documentWidth - previewViewport.width).toBeLessThanOrEqual(1);

  const archived = frame!.locator('button[data-tab-id="archived"]');
  await archived.click();
  await expect(archived).toBeVisible();
});

test("Invariant preview transitions respect reduced-motion preference", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "This contract runs under reduced motion.");
  const { frame } = await loadShowcase(page);
  await expect.poll(() => frame!.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const transitionDuration = await frame!.locator('button[data-tab-id="all"]').evaluate((button) => getComputedStyle(button).transitionDuration);
  expect(transitionDuration.split(",").every((duration) => duration.trim() === "0s")).toBe(true);
});
