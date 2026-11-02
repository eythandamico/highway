import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { componentPreviews, openDirectPreview, showcaseIdForPreviewId } from "./preview-routes";

type RegistryEntry = {
  id: string;
  name: string;
  group: string;
  previewId: string;
};

type CatalogueEntry = { id: string; name: string };

const registry = componentPreviews as RegistryEntry[];
const aliases: Record<string, string> = { "inv-button": "button", "inv-toggle": "switch" };
const componentCatalog = JSON.parse(
  readFileSync(new URL("../../catalog/components.json", import.meta.url), "utf8"),
) as { families: Array<{ name: string; primary: string; variants: Array<{ id: string; label: string; exports: string[]; compatibility: string[] }> }> };
const catalogue: CatalogueEntry[] = componentCatalog.families.map(({ name, primary }) => ({ id: primary, name }));

test.beforeEach(async ({ page }) => {
  const localOrigins = new Set([new URL("http://localhost:5190").origin, new URL("http://localhost:5191").origin]);
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (localOrigins.has(url.origin)) {
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
  await expect(page.getByText("No components found.", { exact: true })).toBeVisible();
  await search.clear();
  await expect(componentNav.getByRole("link")).toHaveCount(componentCatalog.families.length);
  return { search, componentNav };
}

async function loadShowcase(page: Page, componentId = "inv-segmented-control") {
  await page.goto(`/showcase?component=${componentId}`);
  const { componentNav } = await waitForShowcaseHydration(page);
  const canonicalId = aliases[componentId] ?? componentId;
  const selectedFamily = componentCatalog.families.find((family) => family.variants.some((variant) => variant.id === canonicalId));
  const navId = selectedFamily?.primary ?? canonicalId;
  if (selectedFamily) await expect(page.getByRole("heading", { name: selectedFamily.name, exact: true, level: 1 })).toBeVisible();
  await expect(componentNav.locator('[aria-current="page"]')).toHaveAttribute(
    "href",
    `/showcase?component=${navId}`,
  );
  const preview = page.locator("#component-preview .highway-preview");
  await expect(preview).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  return { preview, componentNav };
}

async function loadLightShowcaseCard(page: Page, testInfo: { project: { name: string } }) {
  test.skip(testInfo.project.name !== "desktop", "Glass material computation runs once on desktop.");
  await loadShowcase(page, "card");
  const root = page.locator("html");
  if (await root.evaluate((element) => element.classList.contains("dark"))) {
    await page.getByRole("button", { name: "Toggle light and dark theme" }).click();
  }
  await expect(root).not.toHaveClass(/\bdark\b/);
  const card = page.locator('.library-preview [data-slot="card"]');
  await expect(card).toBeVisible();
  return card;
}

async function readOpaqueCardColor(page: Page) {
  return page.evaluate(() => {
    const sample = document.createElement("div");
    sample.style.backgroundColor = "var(--card)";
    document.body.appendChild(sample);
    const color = getComputedStyle(sample).backgroundColor;
    sample.remove();
    return color;
  });
}

async function expectToggleKeyboardBehavior(toggle: Locator) {
  for (const key of ["Space", "Enter"] as const) {
    const initialState = await toggle.getAttribute("aria-checked");
    await toggle.focus();
    await toggle.press(key);
    await expect(toggle).toHaveAttribute("aria-checked", initialState === "true" ? "false" : "true");
  }
}

async function choosePreviewOption(page: Page, label: string, value: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: value, exact: true }).click();
}

test("showcase directory keeps grouped family routes sorted and resolves legacy aliases", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Catalogue discovery and aliases run once on desktop.");
  expect(registry).toHaveLength(50);
  expect(new Set(registry.map((entry) => entry.id)).size).toBe(50);
  expect(new Set(registry.map((entry) => entry.previewId)).size).toBe(50);
  expect(catalogue).toHaveLength(componentCatalog.families.length);
  expect(new Set(catalogue.map((entry) => entry.id)).size).toBe(componentCatalog.families.length);

  const { componentNav } = await loadShowcase(page, "button");
  const groupedEntries = await componentNav.locator(".component-group").evaluateAll((groups) => groups.map((group) => ({
    name: group.querySelector(".component-group-toggle span:nth-child(2)")?.textContent?.trim() ?? "",
    links: Array.from(group.querySelectorAll<HTMLAnchorElement>(".component-group-links a"), (link) => ({
      id: new URL(link.href).searchParams.get("component") ?? "",
      name: link.textContent?.trim() ?? "",
    })),
  })));
  expect(groupedEntries.map((group) => group.name)).toEqual([...groupedEntries.map((group) => group.name)].sort());
  for (const group of groupedEntries) {
    expect(group.links.map((link) => link.name)).toEqual([...group.links.map((link) => link.name)].sort());
  }
  const componentIds = groupedEntries.flatMap((group) => group.links.map((link) => link.id)).sort();
  expect(componentIds).toEqual(componentCatalog.families.map((family) => family.primary).sort());
  await expect(page.getByRole("heading", { name: "Buttons", exact: true, level: 1 })).toBeVisible();
  await expect(componentNav.getByRole("link", { name: "Buttons", exact: true })).toBeVisible();
  await expect(componentNav.locator('a[href*="inv-button"]')).toHaveCount(0);
  await expect(componentNav.locator('a[href*="inv-toggle"]')).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0);

  for (const [alias, canonical] of Object.entries(aliases)) {
    const resolved = await loadShowcase(page, alias);
    const canonicalFamily = componentCatalog.families.find((family) => family.primary === canonical);
    await expect(page.getByRole("heading", { name: canonicalFamily!.name, exact: true, level: 1 })).toBeVisible();
    await expect(resolved.componentNav.locator('[aria-current="page"]')).toHaveAttribute("href", `/showcase?component=${canonical}`);
  }
});

test("showcase Glass surface Card keeps its light glass wash, rim and blur", async ({ page }, testInfo) => {
  const card = await loadLightShowcaseCard(page, testInfo);
  const material = await card.evaluate((element) => {
    const before = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    return {
      surfaceColor: getComputedStyle(element).backgroundColor,
      wash: before.backgroundImage,
      finish: before.boxShadow,
      blur: before.backdropFilter,
      rim: after.backgroundImage,
    };
  });

  expect(material.surfaceColor).not.toBe(await readOpaqueCardColor(page));
  expect(material.wash).not.toBe("none");
  expect(material.finish).toContain("inset");
  expect(material.blur).toBe("blur(12px)");
  expect(material.rim).not.toBe("none");
});

test("showcase Glass surface Card becomes opaque for reduced transparency", async ({ page }, testInfo) => {
  const card = await loadLightShowcaseCard(page, testInfo);
  const opaqueCardColor = await readOpaqueCardColor(page);
  const mediaSession = await page.context().newCDPSession(page);
  await mediaSession.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches)).toBe(true);

  // Card background-color transitions when its raised material is replaced by the opaque fallback.
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(opaqueCardColor);
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element, "::before").backdropFilter)).toBe("none");
  await mediaSession.detach();
});

test("progressive blur recipes, edges, and foreground controls remain independent", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Progressive blur recipe and direction behavior runs once on desktop.");
  await loadShowcase(page, "progressive-blur");
  const effect = page.locator(".library-preview .fx-progressive");
  const layers = effect.locator(":scope > span");

  await expect(effect).toHaveAttribute("aria-hidden", "true");
  await expect(effect).toHaveAttribute("data-recipe", "header");
  await expect(effect).toHaveAttribute("data-edge", "top");
  await expect(layers).toHaveCount(3);
  expect(await layers.evaluateAll((spans) => spans.map((span) => getComputedStyle(span).backdropFilter)))
    .toEqual(["blur(4px)", "blur(10px)", "blur(20px)"]);
  const headerMasks = await layers.evaluateAll((spans) => spans.map((span) => getComputedStyle(span).maskImage));
  expect(headerMasks).toHaveLength(3);
  expect(headerMasks.every((mask) => mask.includes("linear-gradient"))).toBe(true);

  await choosePreviewOption(page, "Recipe", "rail");
  await expect(effect).toHaveAttribute("data-recipe", "rail");
  expect(await layers.evaluateAll((spans) => spans.map((span) => getComputedStyle(span).backdropFilter)))
    .toEqual(["blur(4px)", "blur(10px)", "blur(20px)"]);
  await choosePreviewOption(page, "Recipe", "panel");
  await expect(effect).toHaveAttribute("data-recipe", "panel");
  expect(await layers.evaluateAll((spans) => spans.map((span) => getComputedStyle(span).backdropFilter)))
    .toEqual(["blur(2px)", "blur(6px)", "blur(12px)"]);

  const directions = { top: "to bottom", bottom: "to top", left: "to right", right: "to left" };
  for (const [edge, direction] of Object.entries(directions)) {
    await choosePreviewOption(page, "Strong edge", edge);
    await expect(effect).toHaveAttribute("data-edge", edge);
    await expect.poll(() => effect.evaluate((element) => getComputedStyle(element).getPropertyValue("--fx-direction").trim()))
      .toBe(direction);
  }

  const foregroundAction = page.getByRole("button", { name: "Test foreground action" });
  await foregroundAction.click();
  await expect(page.getByRole("status")).toHaveText("Foreground action count: 1");
  await foregroundAction.click();
  await expect(page.getByRole("status")).toHaveText("Foreground action count: 2");
  expect(await effect.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
});

test("edge fade changes axis while remaining decorative and non-interactive", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Edge fade axis behavior runs once on desktop.");
  await loadShowcase(page, "edge-fade");
  const edgeFade = page.locator(".library-preview .fx-edge-fade");
  await expect(edgeFade).toHaveAttribute("aria-hidden", "true");
  await expect(edgeFade).toHaveAttribute("data-axis", "horizontal");
  expect(await edgeFade.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  const horizontal = await edgeFade.evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(horizontal).toContain("to right");

  await choosePreviewOption(page, "Fade axis", "vertical");
  await expect(edgeFade).toHaveAttribute("data-axis", "vertical");
  await expect.poll(() => edgeFade.evaluate((element) => getComputedStyle(element).backgroundImage)).not.toBe(horizontal);
});

test("media scrim keeps foreground actions usable and removes glass under reduced transparency", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Media foreground and reduced-transparency behavior runs once on desktop.");
  await loadShowcase(page, "media-scrim");
  const scrim = page.locator(".library-preview .fx-media-scrim");
  const foreground = page.locator(".library-preview .fx-media-foreground");
  const save = page.getByRole("button", { name: "Save example" });
  await expect(scrim).toHaveAttribute("aria-hidden", "true");
  await expect(foreground).toContainText("Keep the caption clear.");
  expect(await scrim.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  expect(await foreground.evaluate((element) => Number(getComputedStyle(element).zIndex))).toBeGreaterThan(0);

  await save.click();
  await expect(page.getByRole("button", { name: "Unsave example" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText("Example saved locally.");

  const mediaSession = await page.context().newCDPSession(page);
  await mediaSession.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches)).toBe(true);
  const savedAction = page.getByRole("button", { name: "Unsave example" });
  await expect.poll(() => savedAction.evaluate((element) => getComputedStyle(element).backdropFilter)).toBe("none");
  await expect.poll(() => savedAction.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(36, 36, 36)");
  await savedAction.click();
  await expect(page.getByRole("button", { name: "Save example" })).toHaveAttribute("aria-pressed", "false");
  await mediaSession.detach();
});

test("state icon changes both mounted glyphs and follows the reduced-motion preference", async ({ page }, testInfo) => {
  test.skip(!["desktop", "reduced-motion"].includes(testInfo.project.name), "StateIcon behavior runs on desktop and reduced-motion projects.");
  await loadShowcase(page, "state-icon");
  const toggle = page.getByRole("button", { name: "Toggle icon" });
  const status = page.getByRole("status");
  const icon = page.locator(".library-preview .state-icon");
  const glyphs = icon.locator(":scope > span");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(status).toHaveText("Play icon");
  await expect(glyphs).toHaveCount(2);
  await expect(glyphs.nth(0)).toHaveAttribute("data-visible", "true");
  await expect(glyphs.nth(1)).toHaveAttribute("data-visible", "false");

  if (testInfo.project.name === "reduced-motion") {
    expect(await glyphs.first().evaluate((element) => getComputedStyle(element).transitionProperty)).toBe("none");
  } else {
    await expect.poll(() => glyphs.first().evaluate((element) => getComputedStyle(element).transitionDuration))
      .toBe("0.2s, 0.2s, 0.2s");
  }

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(status).toHaveText("Pause icon");
  await expect(glyphs.nth(0)).toHaveAttribute("data-visible", "false");
  await expect(glyphs.nth(1)).toHaveAttribute("data-visible", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(status).toHaveText("Play icon");
});

test("visual effect previews fit phone and narrow showcase widths", async ({ page }, testInfo) => {
  test.skip(!["phone", "narrow"].includes(testInfo.project.name), "Effects layout is checked in phone and narrow viewport projects.");
  for (const id of ["progressive-blur", "edge-fade", "media-scrim"]) {
    await loadShowcase(page, id);
    const geometry = await page.evaluate(() => {
      const preview = document.querySelector<HTMLElement>(".library-preview")!;
      const visual = preview.querySelector<HTMLElement>(".fx-demo-stage, .fx-edge-demo, .fx-media-frame")!;
      return {
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        preview: preview.getBoundingClientRect().width,
        visual: visual.getBoundingClientRect().width,
        visualRight: visual.getBoundingClientRect().right,
      };
    });
    expect(geometry.document - geometry.viewport).toBeLessThanOrEqual(1);
    expect(geometry.preview).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.visual).toBeGreaterThan(0);
    expect(geometry.visualRight).toBeLessThanOrEqual(geometry.viewport + 1);
  }
});

test("progressive blur uses theme surface tint and opaque reduced-transparency fallback", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Effect theme and transparency computation runs once on desktop.");
  await loadShowcase(page, "progressive-blur");
  await choosePreviewOption(page, "Recipe", "panel");
  const root = page.locator("html");
  const themeButton = page.getByRole("button", { name: "Toggle light and dark theme" });
  if (await root.evaluate((element) => element.classList.contains("dark"))) await themeButton.click();
  await expect(root).not.toHaveClass(/\bdark\b/);

  const surfaceColor = () => page.evaluate(() => {
    const sample = document.createElement("div");
    sample.style.backgroundColor = "var(--surface)";
    document.body.appendChild(sample);
    const color = getComputedStyle(sample).backgroundColor;
    sample.remove();
    return color;
  });
  const lightSurface = await surfaceColor();
  const tint = page.locator(".library-preview .fx-progressive");
  await themeButton.click();
  await expect(root).toHaveClass(/\bdark\b/);
  const darkSurface = await surfaceColor();
  expect(darkSurface).not.toBe(lightSurface);

  const mediaSession = await page.context().newCDPSession(page);
  await mediaSession.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches)).toBe(true);
  const layers = tint.locator(":scope > span");
  await expect.poll(() => layers.evaluateAll((spans) => spans.map((span) => getComputedStyle(span).backdropFilter)))
    .toEqual(["none", "none", "none"]);
  await expect.poll(() => tint.evaluate((element) => getComputedStyle(element, "::after").backgroundImage)).toBe("none");
  await expect.poll(() => tint.evaluate((element) => getComputedStyle(element, "::after").backgroundColor)).toBe(darkSurface);
  expect(await tint.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  await mediaSession.detach();
});

test("Ask bar empty Enter does not send and a valid Enter produces a local reply", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Ask bar submission behavior runs once on desktop.");
  await loadShowcase(page, "ask-bar");
  const composer = page.locator('.library-preview form[aria-label="Ask anything composer"]');
  const input = page.getByRole("textbox", { name: "Ask anything" });
  await expect(composer).toBeVisible();
  await input.press("Enter");
  await expect(composer).toHaveAttribute("aria-busy", "false");
  await expect(page.getByRole("log", { name: "Conversation preview" })).toHaveCount(0);
  await expect(page.getByText("Local demo only. Enter sends; Escape dismisses the reply. No voice service is connected.")).toBeVisible();

  await input.fill("What should I work on next?");
  await input.press("Enter");
  const log = page.getByRole("log", { name: "Conversation preview" });
  await expect(log).toContainText("Demo reply: your message arrived.");
  await expect(log.locator('[data-role="assistant"]')).toHaveCount(1);
  await expect(page.locator(".ui-ask-reply-question")).toHaveText("What should I work on next?");
  await expect(input).toHaveValue("");
  await expect(page.locator('.library-preview .ui-ask-root [class*="orb"], .library-preview .ui-ask-root [data-orb]')).toHaveCount(0);
});

test("Ask bar pending state rejects duplicate submits", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Ask bar pending guard runs once on desktop.");
  await loadShowcase(page, "ask-bar");
  const composer = page.locator('.library-preview form[aria-label="Ask anything composer"]');
  const input = page.getByRole("textbox", { name: "Ask anything" });
  await input.fill("Only answer once");
  await input.press("Enter");
  await expect(composer).toHaveAttribute("aria-busy", "true");
  await expect(input).toBeDisabled();
  await expect(page.locator('.ui-ask-root [role="status"]')).toHaveText("Sending message…");

  // Re-submit through the real form while the preview callback is pending.
  await composer.evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
    (form as HTMLFormElement).requestSubmit();
  });
  const log = page.getByRole("log", { name: "Conversation preview" });
  await expect(log.locator('[data-role="assistant"]')).toHaveCount(1);
  await expect(log).toContainText("Demo reply: your message arrived.");
});

test("Ask bar retains a failed draft and retries successfully when re-enabled", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Ask bar failure and retry behavior runs once on desktop.");
  await loadShowcase(page, "ask-bar");
  const input = page.getByRole("textbox", { name: "Ask anything" });
  const failureToggle = page.getByRole("switch", { name: "Simulate failure" });
  const draft = "Keep this draft after failure";
  await failureToggle.click();
  await expect(failureToggle).toHaveAttribute("aria-checked", "true");
  await input.fill(draft);
  await input.press("Enter");

  await expect(page.getByRole("alert")).toHaveText("Example failure. Your draft is kept—turn off Simulate failure and try again.");
  await expect(input).toHaveValue(draft);
  await failureToggle.click();
  await expect(failureToggle).toHaveAttribute("aria-checked", "false");
  await expect(input).toHaveValue(draft);
  await input.press("Enter");
  const log = page.getByRole("log", { name: "Conversation preview" });
  await expect(log).toContainText("Demo reply: your message arrived.");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("Ask bar disabled state preserves the draft and blocks sending", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Ask bar disabled state runs once on desktop.");
  await loadShowcase(page, "ask-bar");
  const composer = page.locator('.library-preview form[aria-label="Ask anything composer"]');
  const input = page.getByRole("textbox", { name: "Ask anything" });
  const draft = "Do not send while disabled";
  await input.fill(draft);
  await page.getByRole("switch", { name: "Disabled" }).click();
  await expect(input).toBeDisabled();
  await expect(input).toHaveValue(draft);
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await composer.evaluate((form) => (form as HTMLFormElement).requestSubmit());
  await expect(composer).toHaveAttribute("aria-busy", "false");
  await expect(input).toHaveValue(draft);
  await page.waitForTimeout(1000); // Longer than the local preview response delay, to catch an accidental send.
  await expect(page.getByRole("log", { name: "Conversation preview" })).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("Ask bar fits on phone and removes transitions under reduced motion", async ({ page }, testInfo) => {
  test.skip(!["phone", "reduced-motion"].includes(testInfo.project.name), "Run the Ask bar responsive and motion checks in their focused projects.");
  await loadShowcase(page, "ask-bar");
  const capsule = page.locator('.library-preview form[aria-label="Ask anything composer"]');

  if (testInfo.project.name === "phone") {
    const input = page.getByRole("textbox", { name: "Ask anything" });
    await expect(input).toBeVisible();
    const geometry = await page.evaluate(() => {
      const capsule = document.querySelector('.library-preview form[aria-label="Ask anything composer"]')!;
      const input = capsule.querySelector("input")!;
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        capsule: capsule.getBoundingClientRect().width,
        input: input.getBoundingClientRect().width,
      };
    });
    expect(geometry.document - geometry.viewport).toBeLessThanOrEqual(1);
    expect(geometry.capsule).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.input).toBeGreaterThan(0);
  } else {
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await expect.poll(() => capsule.evaluate((element) => getComputedStyle(element).transitionProperty)).toBe("none");
    await page.getByRole("textbox", { name: "Ask anything" }).fill("Reduced motion reply");
    await page.getByRole("textbox", { name: "Ask anything" }).press("Enter");
    const reply = page.locator(".ui-ask-reply");
    await expect(reply).toBeVisible();
    await expect.poll(() => reply.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  }
});

test("Yardwork compact Ask bar expands and transfers focus from its label", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Compact Ask bar focus runs once on desktop.");
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto("http://localhost:5191/demo");
  const composer = page.locator('form[aria-label="Ask Yardwork composer"]');
  const input = page.getByRole("textbox", { name: "Ask Yardwork" });
  await expect(composer).toBeVisible();
  await page.waitForFunction(() => {
    const form = document.querySelector<HTMLFormElement>('form[aria-label="Ask Yardwork composer"]');
    return !!form && Object.entries(form).some(([key, value]) =>
      key.startsWith("__reactProps$") && typeof (value as { onSubmit?: unknown }).onSubmit === "function",
    );
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.mouse.move(640, 320);
  await page.mouse.wheel(0, 100);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.mouse.wheel(0, 140);
  await expect(composer).toHaveAttribute("data-compact", "true");
  const expander = page.getByRole("button", { name: "Ask Yardwork" });
  await expect(expander).toHaveAttribute("aria-hidden", "false");
  await expect(expander).toHaveAttribute("tabindex", "0");
  // Focus dispatches the actual button event; React expands and transfers focus to the input.
  await expander.focus();
  await expect(input).toBeFocused();
  await expect(composer).toHaveAttribute("data-compact", "false");
});

test("standalone guide documents the actual Highway packages and independent demo", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Independent guide smoke runs once on desktop.");
  await page.goto("/guide");
  await expect(page.getByRole("heading", { name: "Good work starts here." })).toBeVisible();
  const packageSection = page.locator("#packages");
  await expect(packageSection.getByRole("heading", { name: "Install Highway in another app." })).toBeVisible();
  await expect(packageSection).toContainText("@highway/styles/styles.css");
  await expect(packageSection).toContainText("@highway/react");
  await expect(packageSection).toContainText("Neither includes authentication, routing, a database or Cloudflare setup.");
  await expect(page.getByRole("link", { name: "Open demo" }))
    .toHaveAttribute("href", "http://localhost:5191/demo");
});

test("standalone demo navigates Today and Schedule, then saves a local assignment", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Demo workflow smoke runs once on desktop.");
  const prohibitedRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    const isLocalDemo = url.origin === "http://localhost:5191";
    const isImageFixture = url.origin === "https://images.unsplash.com";
    if ((!isLocalDemo && !isImageFixture) || (isLocalDemo && /^\/(?:api|auth)(?:\/|$)/.test(url.pathname))) {
      prohibitedRequests.push(url.href);
    }
  });

  await page.goto("http://localhost:5191/demo");
  const navigation = page.getByRole("navigation", { name: "Office navigation" });
  await expect(navigation.getByRole("button", { name: "Today" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today’s work" })).toBeVisible();
  await page.waitForFunction(() => {
    const button = [...(document.querySelector('nav[aria-label="Office navigation"]')?.querySelectorAll("button") ?? [])]
      .find((candidate) => candidate.textContent?.includes("Schedule"));
    return button && Object.entries(button).some(([key, value]) =>
      key.startsWith("__reactProps$") && typeof (value as { onClick?: unknown }).onClick === "function",
    );
  });
  await navigation.getByRole("button", { name: "Schedule" }).click();
  await expect(page).toHaveURL(/view=schedule/);
  await expect(page.getByRole("heading", { name: "Schedule", exact: true })).toBeVisible();
  await navigation.getByRole("button", { name: "Today" }).click();
  await expect(page).toHaveURL(/view=today/);
  await expect(page.getByRole("heading", { name: "Today’s work" })).toBeVisible();

  await page.locator(".yw-row-link").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const assignedTeam = dialog.locator(".yw-record-section").filter({ hasText: "Assigned team" });
  await dialog.getByRole("button", { name: "Edit assignment" }).click();
  await dialog.getByRole("checkbox", { name: "Alex Green · available" }).uncheck();
  await dialog.getByRole("checkbox", { name: "Sam Rivera · available" }).uncheck();
  await dialog.getByRole("checkbox", { name: "Maya Chen · available" }).check();
  await dialog.getByRole("button", { name: "Save assignment" }).click();
  await expect(assignedTeam).toContainText("Maya Chen");
  await expect(assignedTeam).not.toContainText("Sam Rivera");
  await expect(dialog.getByRole("button", { name: "Edit assignment" })).toBeVisible();
  expect(prohibitedRequests).toEqual([]);
});

test("all 50 component previews resolve through showcase and standalone showcase routes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Exhaustive preview loading runs once on desktop.");
  test.setTimeout(180_000);
  const visited = new Set<string>();
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  for (const entry of registry) {
    const showcaseId = showcaseIdForPreviewId(entry.previewId);
    expect(showcaseId).toBe(entry.id);

    await page.goto(`/showcase?component=${showcaseId}`);
    const embeddedPreview = page.locator("article.library-content .highway-preview");
    await expect(embeddedPreview).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(embeddedPreview).not.toContainText("Preview unavailable");

    const directPreview = await openDirectPreview(page, entry.previewId);
    expect(new URL(page.url()).searchParams.get("component")).toBe(showcaseId);
    expect(new URL(page.url()).searchParams.get("preview")).toBe("1");
    await expect(directPreview).not.toContainText("Preview unavailable");
    visited.add(showcaseId);
  }

  expect(visited.size).toBe(50);
  expect([...visited].sort()).toEqual(registry.map((entry) => entry.id).sort());
  expect(runtimeErrors).toEqual([]);
});

test("unified catalogue search filters names across both component sets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Catalogue search is covered once on desktop.");
  await loadShowcase(page);
  const search = page.getByRole("textbox", { name: "Search components" });
  const links = page.getByRole("navigation", { name: "Component library" }).getByRole("link");
  const searchText = (family: (typeof componentCatalog.families)[number]) => [
    family.name,
    ...family.variants.flatMap((variant) => [variant.label, ...variant.exports, ...variant.compatibility]),
  ].join(" ").toLowerCase();
  const matchingIds = (query: string) => componentCatalog.families
    .filter((family) => searchText(family).includes(query.toLowerCase()))
    .map((family) => family.primary).sort();

  await search.fill("toggle");
  const toggleMatches = await links.evaluateAll((elements) => elements.map((element) =>
    new URL((element as HTMLAnchorElement).href).searchParams.get("component") ?? "",
  ));
  expect(toggleMatches.sort()).toEqual(matchingIds("toggle"));

  await search.fill("search");
  const searchMatches = await links.evaluateAll((elements) => elements.map((element) =>
    new URL((element as HTMLAnchorElement).href).searchParams.get("component") ?? "",
  ));
  expect(searchMatches.sort()).toEqual(matchingIds("search"));

  await search.fill("no-matching-component");
  await expect(links).toHaveCount(0);
  await expect(page.getByText("No components found.", { exact: true })).toBeVisible();

  await search.clear();
  await expect(links).toHaveCount(componentCatalog.families.length);
});

test("segmented control preview updates its selected state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Component interaction contracts run once on desktop.");
  const { preview } = await loadShowcase(page, "inv-segmented-control");
  const all = preview.locator('button[data-tab-id="all"]');
  const archived = preview.locator('button[data-tab-id="archived"]');
  const selectedColor = await all.evaluate((button) => getComputedStyle(button).color);
  const idleColor = await archived.evaluate((button) => getComputedStyle(button).color);
  expect(selectedColor).not.toBe(idleColor);
  await archived.click();
  await expect.poll(() => archived.evaluate((button) => getComputedStyle(button).color)).toBe(selectedColor);
  await expect.poll(() => all.evaluate((button) => getComputedStyle(button).color)).toBe(idleColor);
});

test("Dropdown main preview keeps its divider out of the keyboard loop and supports Home/End", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Dropdown keyboard endpoints run once on desktop.");
  const { preview } = await loadShowcase(page, "inv-dropdown");
  await expect(preview.getByRole("switch")).toHaveCount(0);
  const trigger = preview.getByRole("button", { name: "More options" });
  await trigger.click();

  const menu = page.getByRole("menu");
  const edit = menu.getByRole("menuitem", { name: "Edit", exact: true });
  const duplicate = menu.getByRole("menuitem", { name: "Duplicate", exact: true });
  const share = menu.getByRole("menuitem", { name: "Share", exact: true });
  const remove = menu.getByRole("menuitem", { name: "Delete", exact: true });
  await expect(menu.getByRole("separator")).toHaveCount(1);
  await expect(menu.getByRole("menuitem")).toHaveCount(4);
  await expect(edit).toBeFocused();

  await page.keyboard.press("End");
  await expect(remove).toBeFocused();
  const idleDestructiveColor = await remove.evaluate((element) => getComputedStyle(element).color);
  await page.keyboard.press("Home");
  await expect(edit).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(duplicate).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(share).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(remove).toBeFocused();
  await remove.hover();
  await expect.poll(() => remove.evaluate((element) => getComputedStyle(element).color)).toBe(idleDestructiveColor);
  await expect.poll(() => remove.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("BottomNav mobile menu supports Home/End and restores trigger focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "BottomNav keyboard endpoints are checked in the phone layout.");
  const { preview } = await loadShowcase(page, "inv-bottom-nav");
  await preview.scrollIntoViewIfNeeded();
  const navigation = preview.getByRole("navigation", { name: "Navigation" });
  const trigger = navigation.locator('button[aria-haspopup="true"]').first();
  await expect(trigger).toHaveAccessibleName("Add new");
  await trigger.click();

  const menu = page.getByRole("menu");
  const first = menu.getByRole("menuitem", { name: "New Objective" });
  const last = menu.getByRole("menuitem", { name: "Post a Role" });
  await expect(first).toBeFocused();
  await page.keyboard.press("End");
  await expect(last).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAccessibleName("Add new");
});

test("Toast removes blur and dismisses immediately under reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Toast reduced-motion behavior runs in its dedicated project.");
  const { preview } = await loadShowcase(page, "inv-toast");
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await preview.getByRole("button", { name: "Show Toast" }).click();

  const toast = page.locator(".hw-toast");
  const status = toast.getByRole("status").filter({ hasText: "Bread alert" });
  await expect(status).toBeVisible();
  await expect.poll(() => toast.evaluate((element) => {
    const style = getComputedStyle(element);
    return { transform: style.transform, filter: style.filter, transition: style.transition, opacity: style.opacity };
  })).toEqual({ transform: "none", filter: "none", transition: "none", opacity: "1" });

  await toast.getByRole("button", { name: "Dismiss Bread alert" }).click();
  await expect(toast).toHaveCount(0);
});

test("Modal close target remains full size and PageSection fits at 320px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "narrow", "The narrow layout check runs at 320px.");
  const { preview } = await loadShowcase(page, "inv-modal");
  await preview.getByRole("button", { name: "Open Modal" }).click();
  const modal = page.getByRole("dialog", { name: "Settings" });
  await expect(modal).toBeVisible();
  const title = modal.getByRole("heading", { name: "Settings" });
  const close = modal.getByRole("button", { name: "Close" });
  await expect(title).toHaveCSS("min-width", "0px");
  await expect(close).toHaveCSS("flex-shrink", "0");
  await expect.poll(async () => (await close.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(44);
  const closeBounds = await close.boundingBox();
  expect(closeBounds?.width).toBeGreaterThanOrEqual(44);
  expect(closeBounds?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);

  await page.goto("/showcase?component=inv-page-section");
  await waitForShowcaseHydration(page);
  const section = page.locator("article.library-content .highway-preview .max-w-2xl").first();
  await expect(section).toHaveCSS("min-width", "0px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test("canonical Switch and the legacy Toggle adapter support Space and Enter", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Keyboard switch contracts run once on desktop.");

  for (const id of ["switch", "inv-toggle"]) {
    const { preview } = await loadShowcase(page, id);
    await expectToggleKeyboardBehavior(preview.getByRole("switch", { name: "Show reminders" }));
  }

  const legacySwitchPreview = await openDirectPreview(page, "toggle");
  const legacySwitch = legacySwitchPreview.getByRole("switch", { name: "Show reminders" });
  await expectToggleKeyboardBehavior(legacySwitch);
});

test("Button main preview has no config toggles and labeled state examples preserve disabled/loading behavior", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Button state contracts run once on desktop.");

  const { preview } = await loadShowcase(page, "button");
  const button = preview.getByRole("button", { name: "Add something good" });
  const clicks = preview.getByRole("status");
  await expect(preview.getByRole("switch")).toHaveCount(0);
  await expect(preview.locator(".library-controls")).toHaveCount(0);
  for (const label of ["Variant", "Disabled", "Loading"]) {
    await expect(preview.getByText(label, { exact: true })).toHaveCount(0);
  }

  await button.click();
  await expect(clicks).toHaveText("1 preview clicks");
  const regularSize = await button.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });

  const states = page.locator('article.library-content section[aria-label="States"]');
  await expect(states.locator("figure")).toHaveCount(2);
  const disabledExample = states.locator("figure").filter({ hasText: /^Disabled/ });
  const disabledButton = disabledExample.getByRole("button", { name: "Add something good" });
  const disabledClicks = disabledExample.getByRole("status");
  await expect(disabledButton).toBeDisabled();
  await disabledButton.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(disabledClicks).toHaveText("0 preview clicks");

  const loadingExample = states.locator("figure").filter({ hasText: /^Loading/ });
  const loadingButton = loadingExample.getByRole("button", { name: "Add something good" });
  const loadingClicks = loadingExample.getByRole("status");
  await expect(loadingButton).toBeDisabled();
  await expect(loadingButton).toHaveAttribute("aria-busy", "true");
  await expect.poll(() => loadingButton.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  })).toEqual(regularSize);
  await loadingButton.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(loadingClicks).toHaveText("0 preview clicks");
});

test("TextInput exposes labeled default, disabled, and error state examples", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "TextInput state examples run once on desktop.");
  await loadShowcase(page, "inv-text-input");

  const variants = page.locator('article.library-content section[aria-label="Variants"]');
  await expect(variants.locator("figcaption")).toContainText(["With icon"]);
  const states = page.locator('article.library-content section[aria-label="States"]');
  await expect(states.locator("figcaption")).toContainText(["Default", "Disabled", "Error"]);

  const defaultExample = states.locator("figure").filter({ hasText: /^Default/ });
  const defaultInput = defaultExample.getByRole("textbox", { name: "Email" });
  await expect(defaultInput).toBeEnabled();
  await expect(defaultInput).toHaveAttribute("placeholder", "you@example.com");

  const disabledExample = states.locator("figure").filter({ hasText: /^Disabled/ });
  await expect(disabledExample.getByRole("textbox", { name: "Email" })).toBeDisabled();

  const errorExample = states.locator("figure").filter({ hasText: /^Error/ });
  await expect(errorExample.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
  await expect(errorExample.getByRole("alert")).toHaveText("Invalid email address");
});

test("RadioGroup selects with ArrowDown and its associated labels", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Radio keyboard and label behavior runs once on desktop.");
  const preview = await openDirectPreview(page, "radio-group");

  const free = preview.getByRole("radio", { name: "Free" });
  const pro = preview.getByRole("radio", { name: "Pro" });
  const team = preview.getByRole("radio", { name: "Team" });
  await expect(pro).toHaveAttribute("aria-checked", "true");
  await pro.focus();
  await pro.press("ArrowDown");
  await expect(team).toHaveAttribute("aria-checked", "true");

  await preview.getByText("Free", { exact: true }).click();
  await expect(free).toHaveAttribute("aria-checked", "true");
  await expect(team).toHaveAttribute("aria-checked", "false");
});

test("Checkbox toggles by Space and its visible label", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Checkbox keyboard and label behavior runs once on desktop.");
  const preview = await openDirectPreview(page, "checkbox");

  const agreement = preview.getByRole("checkbox", { name: "I agree to the terms" });
  const updates = preview.getByRole("checkbox", { name: "Send me updates" });
  const locked = preview.getByRole("checkbox", { name: "Locked by policy" });
  await expect(agreement).toHaveAttribute("aria-checked", "false");
  await expect(updates).toHaveAttribute("aria-checked", "true");
  await expect(locked).toBeDisabled();
  await expect(locked).toHaveAttribute("aria-checked", "false");
  await agreement.focus();
  await agreement.press("Space");
  await expect(agreement).toHaveAttribute("aria-checked", "true");
  await preview.getByText("Send me updates", { exact: true }).click();
  await expect(updates).toHaveAttribute("aria-checked", "false");
  const lockedLabel = preview.getByText("Locked by policy", { exact: true });
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

  const { preview } = await loadShowcase(page, "inv-modal");
  const trigger = preview.getByRole("button", { name: "Open Modal" });
  await trigger.focus();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Settings" });
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
  const { preview } = await loadShowcase(page, "inv-modal");
  await preview.getByRole("button", { name: "Open Modal" }).click();

  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input[placeholder="Your name"]')).toHaveAccessibleName("Display name");
  await expect(dialog.locator('input[placeholder="you@example.com"]')).toHaveAccessibleName("Email");
});

test("unified preview inherits canonical light and dark design tokens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Token parity runs once on desktop.");
  const { preview } = await loadShowcase(page);
  const themeButton = page.getByRole("button", { name: "Toggle light and dark theme" });
  const tokenNames = ["--inv-bg", "--inv-surface", "--inv-heading", "--inv-accent", "--inv-font-body", "--inv-text-base", "--inv-space-md"];
  const readTokens = (container: Locator) => container.evaluate((element, names: string[]) => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;visibility:hidden;";
    element.appendChild(probe);
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
    const [hostTokens, previewTokens] = await Promise.all([readTokens(page.locator("body")), readTokens(preview)]);
    expect(hostTokens).toEqual(previewTokens);
  };

  await expectTokenParity();
  const initialDark = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
  const initialBackground = (await readTokens(preview))["--inv-bg"];
  await themeButton.click();
  await expect.poll(() => page.locator("html").evaluate((element) => element.classList.contains("dark"))).toBe(!initialDark);
  await expect.poll(async () => JSON.stringify(await readTokens(page.locator("body")))).toBe(JSON.stringify(await readTokens(preview)));
  expect((await readTokens(preview))["--inv-bg"]).not.toBe(initialBackground);

  await themeButton.click();
  await expect.poll(() => page.locator("html").evaluate((element) => element.classList.contains("dark"))).toBe(initialDark);
  await expectTokenParity();
});

test("mobile showcase keeps the preview and controls within the viewport", async ({ page }, testInfo) => {
  test.skip(!["phone", "narrow"].includes(testInfo.project.name), "Mobile layout contract runs at phone widths.");
  const { preview } = await loadShowcase(page);

  const shellOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(shellOverflow).toBeLessThanOrEqual(1);
  const previewWidth = await preview.evaluate((element) => element.getBoundingClientRect().width);
  expect(previewWidth).toBeLessThanOrEqual(testInfo.project.name === "narrow" ? 321 : 391);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);

  const archived = preview.locator('button[data-tab-id="archived"]');
  await archived.click();
  await expect(archived).toBeVisible();
});

test("Component preview transitions respect reduced-motion preference", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "This contract runs under reduced motion.");
  const { preview } = await loadShowcase(page);
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  const transitionDuration = await preview.locator('button[data-tab-id="all"]').evaluate((button) => getComputedStyle(button).transitionDuration);
  expect(transitionDuration.split(",").every((duration) => duration.trim() === "0s")).toBe(true);
});
