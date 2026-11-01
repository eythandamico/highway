import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import ts from "typescript";
import postcss from "postcss";

type ComponentFamily = { id: string; name: string; primary: string; variants: Array<{ id: string; label: string; exports: string[]; example?: string }> };
type ShowcasePage = { id: string; title: string; family: string; examples: string[] };
const componentCatalog = JSON.parse(readFileSync(new URL("../../catalog/components.json", import.meta.url), "utf8")) as {
  showcase: Record<string, unknown>;
  families: ComponentFamily[];
  pages: ShowcasePage[];
  packageVersion: string;
};
const familyByVariantId = new Map(componentCatalog.families.flatMap((family) => family.variants.map((variant) => [variant.id, family] as const)));
const familyNameFor = (id: string, fallback = id) => familyByVariantId.get(id)?.name ?? fallback;
const pageTitleFor = (id: string, fallback = familyNameFor(id)) => componentCatalog.pages.find(page => page.id === id || page.examples.includes(id))?.title ?? fallback;
const showcasePageIds = componentCatalog.pages.map(page => page.id).sort();

declare global {
  interface Window {
    __highwayAuditNumberChanges?: number;
    __highwayClipboardFailure?: boolean;
    __highwayCopiedText?: string;
    __highwayCompletePendingSave?: () => void;
    __highwayCompletePendingCommand?: () => void;
    __highwayGuideClipboardText?: string;
    __highwayTocScrollCalls?: Array<{ id: string; behavior: ScrollBehavior }>;
  }
}

async function instrumentTocScroll(page: Page) {
  await page.addInitScript(() => {
    window.__highwayTocScrollCalls = [];
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(options?: boolean | ScrollIntoViewOptions) {
      const behavior = typeof options === "object" ? options.behavior ?? "auto" : "auto";
      window.__highwayTocScrollCalls?.push({ id: (this as HTMLElement).id, behavior });
      return original.call(this, options);
    };
  });
}

function parseDiagnosticsOf(sourceFile: ts.SourceFile): readonly ts.Diagnostic[] {
  return (sourceFile as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics;
}

async function openConsumer(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: /The same components/ })).toBeVisible();
}

async function openAuditFixture(page: Page) {
  await page.goto("/audit.html");
  await expect(page.getByRole("heading", { name: "Highway package behavior audit" })).toBeVisible();
}

test("home and showcase routes server-render the landing page, component directory, and guide", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The showcase server-render smoke check runs once on desktop.");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { async writeText(text: string) { window.__highwayGuideClipboardText = text; } },
    });
  });
  const response = await page.goto("http://localhost:5190/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Highway");
  await expect(page.getByRole("heading", { name: "Build your next app with Highway." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore the components" })).toHaveAttribute("href", "/showcase");
  await expect(page.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/guide#quickstart");
  await page.goto("http://localhost:5190/showcase");
  await expect(page.getByRole("heading", { name: "Components", exact: true })).toBeVisible();
  await expect(page.getByText("Explore Highway’s components. Open any preview for usage, examples, and API details.")).toBeVisible();
  const firstTile = page.locator(".component-tile").first();
  await expect(firstTile.locator(".component-tile-preview .component-tile-stage")).toHaveCount(1);
  await page.screenshot({ path: "artifacts/validation-screenshots/family-directory-grid-desktop.png" });
  await page.goto("http://localhost:5190/showcase?component=combobox");
  await expect(page.getByRole("heading", { name: pageTitleFor("combobox"), exact: true, level: 1 })).toBeVisible();
  await page.screenshot({ path: "artifacts/validation-screenshots/family-combobox-desktop.png", fullPage: true });
  const componentDirectoryLink = page.getByRole("complementary").getByRole("link", { name: /^Components/ });
  await componentDirectoryLink.click();
  await expect(page).toHaveURL(/\/showcase$/);
  await expect(page.getByRole("heading", { name: "Components", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".component-tile").first().locator(".component-tile-preview .component-tile-stage")).toHaveCount(1);
  await page.screenshot({ path: "artifacts/validation-screenshots/family-directory-grid-phone.png" });
  await page.goto("http://localhost:5190/showcase?component=combobox");
  await expect(page.getByRole("heading", { name: pageTitleFor("combobox"), exact: true, level: 1 })).toBeVisible();
  await page.screenshot({ path: "artifacts/validation-screenshots/family-combobox-phone.png", fullPage: true });

  const guideResponse = await page.goto("http://localhost:5190/guide");
  expect(guideResponse?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Use Highway in your project." })).toBeVisible();
  const setupOptions = page.locator("details.library-other-setup").first();
  await setupOptions.locator(":scope > summary").click();
  await expect(setupOptions).toHaveAttribute("open", "");

  const shellSource = `npm install --ignore-scripts --save-exact https://github.com/eythandamico/highway/releases/download/highway-v${componentCatalog.packageVersion}/highway-styles-${componentCatalog.packageVersion}.tgz https://github.com/eythandamico/highway/releases/download/highway-v${componentCatalog.packageVersion}/highway-react-${componentCatalog.packageVersion}.tgz`;
  const shellExample = page.getByText("Install in your project · sh", { exact: true }).locator("xpath=../..");
  const shellCode = shellExample.locator("pre code");
  await expect(shellCode).toHaveText(shellSource);
  expect(await shellCode.evaluate(element => element.textContent)).toBe(shellSource);
  const shellPre = shellCode.locator("xpath=..");
  const shellKeyword = shellCode.locator(".tok-keyword").first();
  await expect(shellKeyword).toHaveText("npm");
  const shellColorLight = await shellKeyword.evaluate((element) => getComputedStyle(element).color);
  const shellTextColor = await shellCode.evaluate((element) => getComputedStyle(element).color);
  expect(shellColorLight).not.toBe(shellTextColor);
  await shellExample.getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => window.__highwayGuideClipboardText)).toBe(shellSource);
  expect(await shellPre.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);

  const jsxSource = `import '@highway/styles/styles.css';
import { HighwayTheme, Button, GlassCard } from '@highway/react';

export function SavePanel({ onSave }: { onSave: () => void }) {
  return (
    <HighwayTheme>
      <GlassCard>
        <Button onClick={onSave}>Save</Button>
      </GlassCard>
    </HighwayTheme>
  );
}`;
  const jsxExample = page.getByText("Load styles and scope the theme · tsx", { exact: true }).locator("xpath=../..");
  const jsxCode = jsxExample.locator("pre code");
  expect(await jsxCode.evaluate((element) => element.textContent)).toBe(jsxSource);
  const jsxKeyword = jsxCode.locator(".tok-keyword").first();
  await expect(jsxKeyword).toHaveText("import");
  await expect(jsxCode.locator(".tok-string").first()).toHaveText("'@highway/styles/styles.css'");
  const jsxPre = jsxCode.locator("xpath=..");
  const jsxColorLight = await jsxKeyword.evaluate((element) => getComputedStyle(element).color);
  const jsxTextColor = await jsxCode.evaluate((element) => getComputedStyle(element).color);
  expect(jsxColorLight).not.toBe(jsxTextColor);

  const packages = page.locator("#packages");
  await packages.screenshot({ path: testInfo.outputPath("guide-syntax-desktop-light.png") });
  await jsxExample.getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => window.__highwayGuideClipboardText)).toBe(jsxSource);

  await page.getByRole("group", { name: "Color theme" }).getByRole("button", { name: "Dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  const shellColorDark = await shellKeyword.evaluate((element) => getComputedStyle(element).color);
  const jsxColorDark = await jsxKeyword.evaluate((element) => getComputedStyle(element).color);
  expect(shellColorDark).not.toBe(shellColorLight);
  expect(jsxColorDark).not.toBe(jsxColorLight);

  await page.setViewportSize({ width: 390, height: 844 });
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(pageOverflow).toBeLessThanOrEqual(0);
  await expect(shellCode).toHaveText(shellSource);
  expect(await shellCode.evaluate(element => element.textContent)).toBe(shellSource);
  expect(await shellPre.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await jsxCode.evaluate(element => element.textContent)).toBe(jsxSource);
  expect(await jsxPre.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await shellExample.getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => window.__highwayGuideClipboardText)).toBe(shellSource);
  await jsxExample.getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => window.__highwayGuideClipboardText)).toBe(jsxSource);
  await packages.screenshot({ path: testInfo.outputPath("guide-syntax-narrow-dark.png") });

  const dialogSource = componentCatalog.families.find(family => family.variants.some(variant => variant.id === "dialog"))?.variants.find(variant => variant.id === "dialog")?.example;
  expect(dialogSource).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://localhost:5190/showcase?component=dialog");
  await expect(page.getByRole("heading", { name: pageTitleFor("dialog"), exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const dialogExample = page.locator("#component-source .library-code");
  const dialogCode = dialogExample.locator("pre code");
  const dialogPre = dialogCode.locator("xpath=..");
  expect(await dialogCode.evaluate(element => element.textContent)).toBe(dialogSource);
  expect(await dialogCode.locator('[class*="tok-"]').count()).toBeGreaterThan(0);
  expect(await dialogPre.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { async writeText(text: string) { window.__highwayGuideClipboardText = text; } },
  }));
  await dialogExample.getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => window.__highwayGuideClipboardText)).toBe(dialogSource);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(await dialogCode.evaluate(element => element.textContent)).toBe(dialogSource);
  expect(await dialogPre.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  await dialogExample.getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => window.__highwayGuideClipboardText)).toBe(dialogSource);
  await dialogCode.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/validation-screenshots/code-wrap-showcase-narrow.png" });
});

test("guide and showcase typography follow Highway roles at desktop and phone widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "reduced-motion", "Typography viewport checks run on desktop and phone.");
  const typography = async (locator: Locator) => locator.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      letterSpacing: style.letterSpacing,
      fontFamily: style.fontFamily,
    };
  });
  const checkRole = async (locator: Locator, expected: { fontSize: string; lineHeight: string; fontWeight: string; letterSpacing?: string; fontFamily?: string }) => {
    const actual = await typography(locator);
    expect(actual).toMatchObject(expected);
    expect(["400", "500", "600"]).toContain(actual.fontWeight);
    return actual;
  };
  let pageFont = "";
  const checkSans = (locator: Locator, expected: { fontSize: string; lineHeight: string; fontWeight: string; letterSpacing?: string }) => checkRole(locator, { ...expected, fontFamily: pageFont });

  await page.goto("http://localhost:5190/guide");
  await expect(page.getByRole("heading", { name: "Use Highway in your project." })).toBeVisible();
  await page.waitForLoadState("networkidle");
  pageFont = await page.locator(".library").evaluate(element => getComputedStyle(element).fontFamily);
  const guideTitle = page.locator("article.library-content > h1");
  const guideIntro = page.locator("article.library-content > .library-intro");
  const guideSectionTitle = page.locator("#packages h2");
  const guideBody = page.locator("#packages > p").first();
  const guideCode = page.locator("#packages .library-code pre").first();
  const guideTable = page.locator("#build table.library-mapping");
  const guideToc = testInfo.project.name === "phone" ? page.locator(".page-toc-mobile summary") : page.locator(".page-toc-desktop h2");
  await checkSans(guideTitle, { fontSize: "24px", lineHeight: "32px", fontWeight: "600", letterSpacing: "normal" });
  await checkSans(guideIntro, { fontSize: "14px", lineHeight: "20px", fontWeight: "400" });
  await checkSans(guideSectionTitle, { fontSize: "18px", lineHeight: "28px", fontWeight: "600" });
  await checkSans(guideBody, { fontSize: "14px", lineHeight: "20px", fontWeight: "400" });
  const codeStyle = await checkRole(guideCode, { fontSize: "13px", lineHeight: "20px", fontWeight: "400" });
  expect((await typography(guideCode.locator("code"))).fontFamily).toBe(codeStyle.fontFamily);
  await checkSans(guideTable, { fontSize: "13px", lineHeight: "20px", fontWeight: "400" });
  await checkSans(guideTable.locator("td").first(), { fontSize: "13px", lineHeight: "20px", fontWeight: "400" });
  await checkSans(guideTable.locator("th").first(), { fontSize: "13px", lineHeight: "20px", fontWeight: "600" });
  await checkSans(guideToc, { fontSize: "16px", lineHeight: "24px", fontWeight: "600" });
  await checkSans(page.locator(".library-wordmark"), { fontSize: "18px", lineHeight: "28px", fontWeight: "600" });
  expect(await guideCode.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  if (testInfo.project.name === "desktop") {
    await page.screenshot({ path: "artifacts/validation-screenshots/docs-type-scale-desktop.png" });
  }

  await page.goto("http://localhost:5190/showcase?component=inv-search-bar");
  await expect(page.locator("#component-top")).toHaveText(pageTitleFor("inv-search-bar"));
  await expect(page.locator("#component-preview")).toBeVisible();
  await expect(page.locator("#component-api")).toBeVisible();
  const showcaseTitle = page.locator("#component-top");
  const showcaseIntro = page.locator("article.library-content > .library-intro");
  const showcaseSectionTitle = page.locator("#component-install h2");
  const showcaseBody = page.locator("#component-install > p").first();
  const showcaseCode = page.locator("#component-source .library-code pre");
  const showcaseTable = page.locator("#component-props > .library-api-scroll > table.library-mapping");
  const showcaseMarkdown = page.locator(".library-markdown").first();
  await checkSans(showcaseTitle, { fontSize: "24px", lineHeight: "32px", fontWeight: "600", letterSpacing: "normal" });
  await checkSans(showcaseIntro, { fontSize: "14px", lineHeight: "20px", fontWeight: "400" });
  await checkSans(showcaseSectionTitle, { fontSize: "18px", lineHeight: "28px", fontWeight: "600" });
  await checkSans(showcaseBody, { fontSize: "14px", lineHeight: "20px", fontWeight: "400" });
  const showcaseCodeStyle = await checkRole(showcaseCode, { fontSize: "13px", lineHeight: "20px", fontWeight: "400" });
  expect((await typography(showcaseCode.locator("code"))).fontFamily).toBe(showcaseCodeStyle.fontFamily);
  await checkSans(showcaseTable, { fontSize: "13px", lineHeight: "20px", fontWeight: "400" });
  await checkSans(showcaseTable.locator("td").first(), { fontSize: "13px", lineHeight: "20px", fontWeight: "400" });
  await checkSans(showcaseTable.locator("th").first(), { fontSize: "13px", lineHeight: "20px", fontWeight: "600" });
  await expect(showcaseMarkdown).toHaveCount(0);
  await expect(page.locator(".page-toc")).toHaveCount(0);
  expect(await showcaseCode.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  if (testInfo.project.name === "phone") {
    await showcaseCode.scrollIntoViewIfNeeded();
    await page.screenshot({ path: "artifacts/validation-screenshots/docs-type-scale-390.png" });
  }
});

test("component sidebar keeps all entries reachable with keyboard search, collapsible groups, and current selection", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "reduced-motion", "Sidebar behavior runs once per layout viewport.");
  const desktop = testInfo.project.name === "desktop";
  await page.setViewportSize(desktop ? { width: 1440, height: 900 } : { width: 390, height: 844 });
  await page.goto("http://localhost:5190/showcase?component=button");
  await expect(page.locator("#component-top")).toHaveText(pageTitleFor("button"));
  await page.waitForLoadState("networkidle");

  const sidebar = page.getByRole("navigation", { name: "Component library" });
  const allLinks = sidebar.locator(".component-group-links a");
  const visibleLinks = sidebar.locator(".component-group-links:not([hidden]) a");
  const groupButtons = sidebar.locator(".component-group-toggle");
  await expect(allLinks).toHaveCount(componentCatalog.pages.length);
  await expect(visibleLinks).toHaveCount(componentCatalog.pages.length);
  expect(await groupButtons.count()).toBeGreaterThan(0);
  await expect(sidebar.locator('.component-group-toggle[aria-expanded="true"]')).toHaveCount(await groupButtons.count());
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute("href", "/showcase?component=button");
  await expect(page.getByRole("searchbox", { name: "Search components" })).toBeVisible();

  if (desktop) {
    if (await page.locator("html").evaluate(element => element.classList.contains("dark"))) {
      await page.getByRole("group", { name: "Color theme" }).getByRole("button", { name: "Light theme" }).click();
    }
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    await page.screenshot({ path: "artifacts/validation-screenshots/component-sidebar-desktop-light.png" });
  }

  const actionsToggle = sidebar.getByRole("button", { name: /^Actions\b/ });
  const actionsLinks = sidebar.locator("#component-group-actions");
  await actionsToggle.focus();
  await page.keyboard.press("Enter");
  await expect(actionsToggle).toHaveAttribute("aria-expanded", "false");
  await expect(actionsLinks).toBeHidden();
  expect(await visibleLinks.count()).toBeLessThan(componentCatalog.pages.length);

  const search = page.getByRole("searchbox", { name: "Search components" });
  await search.fill("Button");
  await expect(search).toHaveValue("Button");
  for (const shortcut of ["Control+k", "Meta+k"]) {
    await page.keyboard.press(shortcut);
    await expect(search).toBeFocused();
    expect(await search.evaluate(element => {
      const input = element as HTMLInputElement;
      return [input.selectionStart, input.selectionEnd];
    })).toEqual([0, 6]);
  }

  await search.fill("VoiceRecorder");
  await expect(sidebar.locator(".component-count").first()).toHaveText("1");
  const agentToolsToggle = sidebar.getByRole("button", { name: /Agent tools/ });
  const agentToolsLinks = sidebar.locator("#component-group-agent-tools");
  const voiceLink = sidebar.getByRole("link", { name: "VoiceRecorder", exact: true });
  await expect(agentToolsToggle).toHaveAttribute("aria-expanded", "true");
  await expect(voiceLink).toBeVisible();
  await agentToolsToggle.focus();
  await page.keyboard.press("Enter");
  await expect(agentToolsToggle).toHaveAttribute("aria-expanded", "false");
  await expect(agentToolsLinks).toBeHidden();
  await expect(search).toHaveValue("VoiceRecorder");
  await page.keyboard.press("Enter");
  await expect(agentToolsToggle).toHaveAttribute("aria-expanded", "true");
  await expect(voiceLink).toBeVisible();

  await voiceLink.click();
  await expect(page).toHaveURL(/component=voice-recorder/);
  await expect(page.locator("#component-top")).toHaveText(pageTitleFor("voice-recorder"));
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute("href", "/showcase?component=voice-recorder");

  await search.focus();
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("");
  await expect(visibleLinks).toHaveCount(componentCatalog.pages.length);
  await expect(sidebar.locator('a[aria-current="page"]')).toHaveAttribute("href", "/showcase?component=voice-recorder");
  if (!desktop) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test("On this page desktop navigation stays sticky, tracks sections, focuses jumps, and follows component changes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop document rail behavior runs once.");
  await instrumentTocScroll(page);
  const duplicateKeyErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error" && /same key|unique "key" prop/i.test(message.text())) duplicateKeyErrors.push(message.text());
  });
  await page.goto("http://localhost:5190/guide");
  await expect(page.getByRole("heading", { name: "Use Highway in your project." })).toBeVisible();
  await page.waitForLoadState("networkidle");

  const toc = page.locator(".page-toc-desktop");
  await expect(toc).toBeVisible();
  await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#quickstart");
  expect(await toc.evaluate((element) => getComputedStyle(element.parentElement!).position)).toBe("sticky");
  await page.evaluate(() => {
    const theme = document.getElementById("theme")!;
    window.scrollTo(0, theme.getBoundingClientRect().top + window.scrollY - 100);
  });
  await expect(toc.locator('a[href="#theme"]')).toHaveAttribute("aria-current", "location");
  const railTop = await toc.evaluate((element) => element.parentElement!.getBoundingClientRect().top);
  expect(railTop).toBeGreaterThanOrEqual(0);
  expect(railTop).toBeLessThan(100);

  const setupOptions = page.locator("details.library-other-setup").nth(1);
  await setupOptions.locator(":scope > summary").click();
  await expect(setupOptions).toHaveAttribute("open", "");
  await toc.getByRole("link", { name: "MCP", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#agents$/);
  await expect(page.locator("#agents")).toBeFocused();
  await expect(toc.getByRole("link", { name: "MCP", exact: true })).toHaveAttribute("aria-current", "location");
  await expect.poll(() => page.evaluate(() => window.__highwayTocScrollCalls?.at(-1))).toEqual({ id: "agents", behavior: "smooth" });
  const marker = toc.locator(".page-toc-marker");
  const markerAtAgents = await marker.evaluate(element => getComputedStyle(element).transform);
  await toc.getByRole("link", { name: "Back to top" }).click();
  await expect(page).toHaveURL(/#start$/);
  await expect(page.locator("#start")).toBeFocused();
  await expect.poll(() => marker.evaluate(element => getComputedStyle(element).transform)).not.toBe(markerAtAgents);

  await page.goBack();
  await expect(page).toHaveURL(/#agents$/);
  await expect(page.locator("#agents")).toBeInViewport();
  await page.goForward();
  await expect(page).toHaveURL(/#start$/);
  await expect(page.locator("#start")).toBeInViewport();

  await page.goto("http://localhost:5190/showcase?component=card");
  await expect(page.getByRole("heading", { name: pageTitleFor("card"), exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".page-toc")).toHaveCount(0);

  await page.goto("http://localhost:5190/showcase?component=button");
  const componentNav = page.locator('nav[aria-label="Component library"]');
  const assertSingleComponentPage = async (heading: string) => {
    const article = page.locator("article.library-content");
    await expect(article).toHaveCount(1);
    await expect(article.locator("h1")).toHaveCount(1);
    await expect(article.getByRole("heading", { name: heading, exact: true, level: 1 })).toHaveCount(1);
    await expect(page.locator(".page-toc")).toHaveCount(0);
  };
  await assertSingleComponentPage(pageTitleFor("button"));

  await componentNav.getByRole("link", { name: "VoiceRecorder", exact: true }).click();
  await expect(page).toHaveURL(/component=voice-recorder/);
  await assertSingleComponentPage("VoiceRecorder");
  await expect(page.locator("#component-install pre code").filter({ hasText: "VoiceRecorder" })).toContainText("VoiceRecorder");

  await componentNav.getByRole("link", { name: pageTitleFor("card"), exact: true }).click();
  await expect(page).toHaveURL(/component=card/);
  await assertSingleComponentPage(pageTitleFor("card"));
  await componentNav.getByRole("link", { name: pageTitleFor("button"), exact: true }).click();
  await expect(page).toHaveURL(/component=button/);
  await assertSingleComponentPage(pageTitleFor("button"));
  await componentNav.getByRole("link", { name: "VoiceRecorder", exact: true }).click();
  await expect(page).toHaveURL(/component=voice-recorder/);
  await assertSingleComponentPage("VoiceRecorder");
  await page.waitForTimeout(100);
  expect(duplicateKeyErrors).toEqual([]);
});

test("showcase switches every component page with a single article and a working preview", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The exhaustive family showcase switch audit runs once on desktop.");
  test.setTimeout(240_000);
  const pageErrors: string[] = [];
  const duplicateKeyErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error" && /same key|unique "key" prop/i.test(message.text())) duplicateKeyErrors.push(message.text());
  });

  await page.goto("http://localhost:5190/showcase?component=route-scan-start");
  await expect(page.locator("article.library-content h1")).toHaveText(pageTitleFor("button"));
  await page.waitForLoadState("networkidle");
  const componentNav = page.locator('nav[aria-label="Component library"]');
  const routes = await componentNav.locator("a").evaluateAll(links => links.map(link => ({
    href: link.getAttribute("href") ?? "",
    label: link.textContent?.trim() ?? "",
  })));
  const routeIds = routes.map(route => new URL(route.href, "http://localhost:5190").searchParams.get("component") ?? "").sort();
  expect(routeIds).toEqual(showcasePageIds);
  expect(routes).toHaveLength(componentCatalog.pages.length);
  expect(new Set(routeIds).size).toBe(routes.length);

  let previewCount = 0;
  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const componentId = new URL(route.href, "http://localhost:5190").searchParams.get("component");
    expect(componentId).toBeTruthy();
    await componentNav.locator("a").nth(index).click();
    await expect(page).toHaveURL(new RegExp(`[?&]component=${componentId}(?:&|$)`));

    const article = page.locator("article.library-content");
    await expect(article).toHaveCount(1);
    await expect(article.locator("h1")).toHaveCount(1);
    await expect(article.locator("h1")).toHaveText(pageTitleFor(componentId!, route.label));
    await expect(article.locator("details")).toHaveCount(0);
    await expect(componentNav.locator('a[aria-current="page"]')).toHaveCount(1);
    await expect(componentNav.locator('a[aria-current="page"]')).toHaveAttribute("href", route.href);
    await expect(page.locator(".page-toc")).toHaveCount(0);
    await expect(article.locator(".library-markdown")).toHaveCount(0);

    const usageBlocks = await article.locator("#component-source pre code").evaluateAll(elements => elements.map(element => ({
      language: Array.from(element.classList).find(name => name.startsWith("language-"))?.slice("language-".length) ?? "text",
      code: element.textContent ?? "",
    })));
    const usageCode = usageBlocks[0]?.code.trim() ?? "";
    const allUsageCode = usageBlocks.map(block => block.code).join("\n");
    expect(usageCode.length, `Usage example for ${componentId}`).toBeGreaterThan(0);
    expect(allUsageCode).not.toMatch(/See the checked example|checked examples below|Use the public import above|Source example/i);
    expect(allUsageCode).not.toMatch(/(?:from\s*['"](?:@\/|\.{1,2}\/)|import\s*['"](?:@\/|\.{1,2}\/))/);
    expect(await article.innerText()).not.toMatch(/(?:packages\/highway-react\/src|examples\/yardwork\/src)\//);
    const helperImports: Record<string, string> = {
      "inv-empty-state": 'import { Button } from "@highway/react";',
      "inv-bottom-sheet": 'import { Button } from "@highway/react";',
      "inv-table": 'import { Badge } from "@highway/react";',
    };
    if (helperImports[componentId!]) expect(allUsageCode, `Public helper imports for ${componentId}`).toContain(helperImports[componentId!]);
    expect(allUsageCode).not.toMatch(/<Button\b[^>]*\s(?:label|primary|danger)\s*=|<Button\b[^>]*\bvariant=["'](?:primary|danger)["']/);
    usageBlocks.forEach((block, usageIndex) => {
      if (block.language === "css") {
        expect(() => postcss.parse(block.code), `CSS syntax for ${componentId} example ${usageIndex}`).not.toThrow();
        return;
      }
      if (!/^(?:tsx|jsx|ts|js)$/.test(block.language)) return;
      const usageFile = ts.createSourceFile(`usage-${componentId}-${usageIndex}.tsx`, block.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let usageDiagnostics = parseDiagnosticsOf(usageFile);
      if (usageDiagnostics.length && usageDiagnostics.every(diagnostic => diagnostic.code === 2657)) {
        const lines = block.code.split("\n");
        const imports = lines.filter(line => /^\s*import\b/.test(line)).join("\n");
        const body = lines.filter(line => !/^\s*import\b/.test(line)).join("\n");
        const contextualFile = ts.createSourceFile(`usage-${componentId}-${usageIndex}-fragment.tsx`, `${imports}\nconst Example = () => <>${body}</>;`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        usageDiagnostics = parseDiagnosticsOf(contextualFile);
      }
      expect(usageDiagnostics.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")), `Usage syntax for ${componentId} example ${usageIndex}`).toEqual([]);
    });
    const apiExamples = await article.locator("#component-api pre code").allTextContents();
    apiExamples.forEach((declaration, apiIndex) => {
      const apiFile = ts.createSourceFile(`api-${componentId}-${apiIndex}.d.ts`, declaration, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      expect(parseDiagnosticsOf(apiFile).map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")), `API declaration syntax for ${componentId}`).toEqual([]);
    });

    const preview = article.locator("section.highway-preview");
    await expect(preview).toHaveCount(1);
    await expect(preview).toBeVisible();
    await expect(preview.locator(":scope > *")).not.toHaveCount(0);
    await expect(preview).not.toContainText("Preview unavailable");
    await expect(article.locator("iframe")).toHaveCount(0);
    previewCount += 1;
  }

  expect(previewCount).toBe(routes.length);
  const previous = routes.at(-2)!;
  const previousId = new URL(previous.href, "http://localhost:5190").searchParams.get("component");
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`[?&]component=${previousId}(?:&|$)`));
  await expect(page.locator("article.library-content h1")).toHaveText(pageTitleFor(new URL(previous.href, "http://localhost:5190").searchParams.get("component") ?? "", previous.label));
  const last = routes.at(-1)!;
  const lastId = new URL(last.href, "http://localhost:5190").searchParams.get("component");
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`[?&]component=${lastId}(?:&|$)`));
  await expect(page.locator("article.library-content h1")).toHaveText(pageTitleFor(new URL(last.href, "http://localhost:5190").searchParams.get("component") ?? "", last.label));

  for (const alias of [{ id: "inv-button", canonical: "button" }, { id: "inv-toggle", canonical: "switch" }]) {
    await page.goto(`http://localhost:5190/showcase?component=${alias.id}`);
    await expect(page.locator("article.library-content h1")).toHaveText(pageTitleFor(alias.canonical));
    await expect(page.locator("article.library-content")).toHaveCount(1);
    await expect(componentNav.locator('a[aria-current="page"]')).toHaveAttribute("href", `/showcase?component=${alias.canonical}`);
    await expect(page.locator(".page-toc")).toHaveCount(0);
  }

  await page.goto("http://localhost:5190/showcase?component=voice-recorder");
  await expect(page.locator("article.library-content h1")).toHaveText(pageTitleFor("voice-recorder"));
  const voiceApi = page.locator("#component-api");
  await expect(voiceApi.getByRole("heading", { name: "API reference" })).toBeVisible();
  const voiceDeclaration = voiceApi.locator("pre code");
  await expect(voiceDeclaration).toHaveCount(1);
  const voiceDeclarationText = await voiceDeclaration.textContent() ?? "";
  expect(voiceDeclarationText).toContain("VoiceRecorderProps");
  expect(voiceDeclarationText).toContain("VoiceRecording");
  expect(voiceDeclarationText).not.toMatch(/ContextTray|ReviewApplyCard/);
  await voiceApi.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/validation-screenshots/showcase-voice-recorder-api-desktop.png" });

  await page.waitForTimeout(100);
  console.log(`Audited ${routes.length} sidebar routes with direct previews; verified two aliases.`);
  expect(duplicateKeyErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("On this page uses instant jumps when reduced motion is requested", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Reduced-motion document navigation runs once on desktop.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await instrumentTocScroll(page);
  await page.goto("http://localhost:5190/guide");
  await expect(page.getByRole("heading", { name: "Use Highway in your project." })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const toc = page.locator(".page-toc-desktop");
  await toc.getByRole("link", { name: "Theme", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#theme$/);
  await expect(page.locator("#theme")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.__highwayTocScrollCalls?.at(-1))).toEqual({ id: "theme", behavior: "instant" });
  expect(Number.parseFloat(await toc.locator(".page-toc-marker").evaluate(element => getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
});

test("On this page mobile menu closes after jumps, focuses targets, and fits guide and component pages", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Compact document navigation runs once on the phone project.");
  await page.goto("http://localhost:5190/guide");
  await expect(page.getByRole("heading", { name: "Use Highway in your project." })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const toc = page.locator(".page-toc-mobile");
  await expect(toc).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await toc.locator("summary").click();
  await expect(toc).toHaveAttribute("open", "");
  await toc.getByRole("link", { name: "Theme", exact: true }).click();
  await expect(page).toHaveURL(/#theme$/);
  await expect(toc).not.toHaveAttribute("open");
  await expect(page.locator("#theme")).toBeFocused();
  await expect(toc.locator('a[href="#theme"]')).toHaveAttribute("aria-current", "location");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

  await page.goto("http://localhost:5190/showcase?component=card");
  await expect(page.getByRole("heading", { name: pageTitleFor("card"), exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  const componentToc = page.locator(".page-toc-mobile");
  const api = page.locator("section#component-api");
  await expect(componentToc).toHaveCount(0);
  await expect(api).toBeVisible();
  await expect(page.locator("article.library-content details")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

async function touchDrag(page: Page, start: { x: number; y: number }, end: { x: number; y: number }) {
  const cdp = await page.context().newCDPSession(page);
  const touchPoint = (point: { x: number; y: number }) => ({ ...point, id: 1, radiusX: 2, radiusY: 2, force: 1 });
  try {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touchPoint(start)] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [touchPoint(end)] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  } finally {
    await cdp.detach();
  }
}

async function hostButtonAppearance(page: Page) {
  return page.getByTestId("host-button").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      borderStyle: style.borderStyle,
      borderWidth: style.borderWidth,
      borderRadius: style.borderRadius,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      padding: style.padding,
    };
  });
}

const HIGHWAY_TYPE_ROLES = [
  { name: "display", size: 30, leading: 36, weight: 600 },
  { name: "heading-xl", size: 24, leading: 32, weight: 600 },
  { name: "heading-lg", size: 18, leading: 28, weight: 600 },
  { name: "heading-md", size: 16, leading: 24, weight: 600 },
  { name: "body", size: 14, leading: 20, weight: 400 },
  { name: "body-sm", size: 13, leading: 20, weight: 400 },
  { name: "caption", size: 12, leading: 16, weight: null },
  { name: "micro", size: 11, leading: 16, weight: 500 },
] as const;

async function readHighwayTypography(page: Page) {
  return page.locator(".highway").first().evaluate((theme, roles) => {
    const base = document.createElement("span");
    base.textContent = "Base type sample";
    theme.appendChild(base);
    const baseStyle = getComputedStyle(base);
    const baseMetrics = {
      fontSize: baseStyle.fontSize,
      lineHeight: baseStyle.lineHeight,
      fontWeight: baseStyle.fontWeight,
      fontFamily: baseStyle.fontFamily,
    };
    base.remove();

    const metrics = roles.map(({ name }) => {
      const classSample = document.createElement("span");
      classSample.className = `highway-type-${name}`;
      classSample.textContent = name;
      theme.appendChild(classSample);
      const classStyle = getComputedStyle(classSample);

      const attributeSample = document.createElement("span");
      attributeSample.dataset.highwayType = name;
      attributeSample.textContent = name;
      theme.appendChild(attributeSample);
      const attributeStyle = getComputedStyle(attributeSample);

      const result = {
        name,
        class: {
          fontSize: classStyle.fontSize,
          lineHeight: classStyle.lineHeight,
          fontWeight: classStyle.fontWeight,
          fontFamily: classStyle.fontFamily,
        },
        attribute: {
          fontSize: attributeStyle.fontSize,
          lineHeight: attributeStyle.lineHeight,
          fontWeight: attributeStyle.fontWeight,
          fontFamily: attributeStyle.fontFamily,
        },
      };
      classSample.remove();
      attributeSample.remove();
      return result;
    });
    return { base: baseMetrics, roles: metrics };
  }, HIGHWAY_TYPE_ROLES.map(({ name }) => ({ name })));
}

async function hostCopyAppearance(page: Page) {
  return page.getByTestId("host-copy").evaluate((element) => {
    const style = getComputedStyle(element);
    return { fontFamily: style.fontFamily, fontSize: style.fontSize, lineHeight: style.lineHeight, fontWeight: style.fontWeight };
  });
}

test("installed default button matches the source showcase appearance", async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The source/consumer appearance comparison runs once on desktop.");
  await openConsumer(page);
  const packageButton = page.getByTestId("package-button");

  const sourcePage = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  try {
    mkdirSync(new URL("../../artifacts/validation-screenshots/", import.meta.url), { recursive: true });
    await sourcePage.goto("http://localhost:5190/showcase?component=button");
    await expect(sourcePage.locator("article.library-content h1")).toHaveText(pageTitleFor("button"));
    const sourceRoot = sourcePage.locator("html");
    const sourceThemeToggle = sourcePage.getByRole("group", { name: "Color theme" });
    const consumerThemeToggle = page.getByRole("switch", { name: "Dark theme" });
    const states = [
      { name: "desktop-light", width: 1280, dark: false },
      { name: "desktop-dark", width: 1280, dark: true },
      { name: "narrow-light", width: 390, dark: false },
      { name: "narrow-dark", width: 390, dark: true },
    ];
    const setTheme = async (dark: boolean) => {
      const sourceDark = await sourceRoot.evaluate((element) => element.classList.contains("dark"));
      if (sourceDark !== dark) await sourceThemeToggle.getByRole("button", { name: dark ? "Dark theme" : "Light theme" }).click();
      await expect.poll(() => sourceRoot.evaluate((element) => element.classList.contains("dark"))).toBe(dark);
      const consumerDark = await page.locator(".highway").first().getAttribute("data-highway-mode") === "dark";
      if (consumerDark !== dark) await consumerThemeToggle.click();
      await expect.poll(() => page.locator(".highway").first().getAttribute("data-highway-mode")).toBe(dark ? "dark" : "light");
    };
    const properties = [
      "backgroundColor",
      "color",
      "borderColor",
      "borderStyle",
      "borderWidth",
      "borderRadius",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "lineHeight",
      "paddingBlockStart",
      "paddingBlockEnd",
      "paddingInlineStart",
      "paddingInlineEnd",
      "minHeight",
      "boxShadow",
    ] as const;
    const read = (element: Element, styleProperties: readonly string[]) => {
      const style = getComputedStyle(element);
      const values = style as unknown as Record<string, string>;
      return Object.fromEntries(styleProperties.map((property) => [property, values[property]]));
    };
    const sourceButton = sourcePage.getByRole("button", { name: "Add something good" });
    for (const state of states) {
      await Promise.all([
        sourcePage.setViewportSize({ width: state.width, height: 900 }),
        page.setViewportSize({ width: state.width, height: 900 }),
      ]);
      await setTheme(state.dark);
      await expect(sourceButton).toBeVisible();
      let previousSnapshot = "";
      await expect.poll(async () => {
        const [sourceStyle, packageStyle] = await Promise.all([
          sourceButton.evaluate(read, properties),
          packageButton.evaluate(read, properties),
        ]);
        const snapshot = JSON.stringify({ sourceStyle, packageStyle });
        const stable = snapshot === previousSnapshot;
        previousSnapshot = snapshot;
        return { matches: JSON.stringify(sourceStyle) === JSON.stringify(packageStyle), stable, sourceStyle, packageStyle };
      }, { intervals: [50, 100, 150, 200, 250, 300], timeout: 5000 }).toMatchObject({ matches: true, stable: true });
      const [sourceStyle, packageStyle] = await Promise.all([
        sourceButton.evaluate(read, properties),
        packageButton.evaluate(read, properties),
      ]);
      expect(packageStyle, `Button style parity for ${state.name}`).toEqual(sourceStyle);
      await sourceButton.screenshot({ path: `artifacts/validation-screenshots/package-parity-button-source-${state.name}.png` });
      await packageButton.screenshot({ path: `artifacts/validation-screenshots/package-parity-button-consumer-${state.name}.png` });
    }

    await sourcePage.goto("http://localhost:5190/showcase?component=card");
    await expect(sourcePage.locator("article.library-content h1")).toHaveText(pageTitleFor("card"));
    const sourceCard = sourcePage.locator('.library-component-preview [data-slot="card"]');
    const packageCard = page.locator('.highway [data-slot="card"]').first();
    await expect(sourceCard).toBeVisible();
    await expect(packageCard).toBeVisible();
    const materialProperties = [
      "backgroundColor",
      "color",
      "borderColor",
      "borderStyle",
      "borderWidth",
      "borderRadius",
      "backdropFilter",
      "boxShadow",
    ] as const;
    for (const state of states) {
      await Promise.all([
        sourcePage.setViewportSize({ width: state.width, height: 900 }),
        page.setViewportSize({ width: state.width, height: 900 }),
      ]);
      await setTheme(state.dark);
      let previousMaterialSnapshot = "";
      await expect.poll(async () => {
        const [sourceMaterial, packageMaterial] = await Promise.all([
          sourceCard.evaluate(read, materialProperties),
          packageCard.evaluate(read, materialProperties),
        ]);
        const snapshot = JSON.stringify({ sourceMaterial, packageMaterial });
        const stable = snapshot === previousMaterialSnapshot;
        previousMaterialSnapshot = snapshot;
        return { matches: JSON.stringify(sourceMaterial) === JSON.stringify(packageMaterial), stable };
      }, { intervals: [50, 100, 150, 200, 250, 300], timeout: 5000 }).toEqual({ matches: true, stable: true });
      const [sourceMaterial, packageMaterial] = await Promise.all([
        sourceCard.evaluate(read, materialProperties),
        packageCard.evaluate(read, materialProperties),
      ]);
      expect(sourceMaterial.borderRadius, `Source Card radius for ${state.name}`).toBe("16px");
      expect(packageMaterial, `Card material parity for ${state.name}`).toEqual(sourceMaterial);
      await sourceCard.screenshot({ path: `artifacts/validation-screenshots/package-parity-card-source-${state.name}.png` });
      await packageCard.screenshot({ path: `artifacts/validation-screenshots/package-parity-card-consumer-${state.name}.png` });
    }
  } finally {
    await sourcePage.close();
  }
});

test("showcase package usage resolves canonical, alternative, mixed, and demo-only entries", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Catalog usage guidance runs once on desktop.");
  test.setTimeout(60_000);
  const sourcePage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    const usage = sourcePage.getByRole("region", { name: "Package usage" });
    await sourcePage.goto("http://localhost:5190/showcase?component=button");
    await expect(usage.getByRole("heading", { name: "Import" })).toBeVisible();
    await expect(usage).toContainText("Set up the packages and theme.");
    await expect(usage.locator("pre code")).toContainText('import { Button } from "@highway/react";');
    await expect(usage.locator("pre code")).toContainText('import "@highway/styles/styles.css";');

    await sourcePage.goto("http://localhost:5190/showcase?component=inv-button");
    await expect(sourcePage.locator("article.library-content h1")).toHaveText(pageTitleFor("button"));
    await expect(usage.locator("pre code")).toContainText('import { Button } from "@highway/react";');

    await sourcePage.goto("http://localhost:5190/showcase?component=inv-textarea");
    await expect(sourcePage.locator("article.library-content h1")).toHaveText("Textarea");
    await expect(usage.locator("pre code")).toContainText('import { Textarea } from "@highway/react";');
    await expect(sourcePage.locator("#component-behavior")).toContainText("Not an alias for NativeTextarea; prefer NativeTextarea for existing native forms.");

    await sourcePage.goto("http://localhost:5190/showcase?component=avatars");
    await expect(usage.locator("pre code")).toContainText('import { GradientAvatar } from "@highway/react";');
    await expect(usage).toContainText("AccountAvatar is a Yardwork-only reference and is not exported");

    await sourcePage.goto("http://localhost:5190/showcase?component=navigation");
    await expect(usage.getByRole("heading", { name: "Demo pattern" })).toBeVisible();
    await expect(usage).toContainText("Yardwork domain example only");
    await expect(usage.locator("pre code")).toHaveCount(0);
    const repositoryExample = sourcePage.locator("#component-source");
    await expect(repositoryExample.getByRole("heading", { name: "Usage" })).toBeVisible();
    await expect(repositoryExample.locator("pre code")).toContainText("OfficeNavigation");
  } finally {
    await sourcePage.close();
  }
});

test("dark branding reaches portaled FormDialog and failed pending saves retain drafts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Dialog and save state checks run once on desktop.");
  await openConsumer(page, "/?controlled-save=1");
  await page.getByRole("switch", { name: "Dark theme" }).click();
  await page.getByRole("switch", { name: "Custom brand" }).click();
  await page.getByRole("button", { name: "Edit project" }).click();

  const dialog = page.getByRole("dialog", { name: "Edit project" });
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((element) => element.closest("[data-highway-portal]")?.getAttribute("data-highway-mode"))).toBe("dark");
  await expect.poll(() => dialog.evaluate((element) => getComputedStyle(element).getPropertyValue("--primary").trim())).toBe("#4055d8");
  await expect.poll(() => dialog.getByRole("button", { name: "Save project" }).evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(64, 85, 216)");

  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("switch", { name: "Simulate failure" }).click();
  await page.getByRole("button", { name: "Edit project" }).click();

  const failedDialog = page.getByRole("dialog", { name: "Edit project" });
  const draft = failedDialog.getByRole("textbox", { name: "Project name" });
  await draft.fill("Retained draft");
  const save = failedDialog.getByRole("button", { name: "Save project" });
  await save.click();
  await expect(failedDialog).toHaveAttribute("aria-busy", "true");
  await expect(draft).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(failedDialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => typeof window.__highwayCompletePendingSave)).toBe("function");
  await page.evaluate(() => window.__highwayCompletePendingSave?.());
  await expect(failedDialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
  await expect(failedDialog.getByRole("alert")).toContainText("Example save failed");
  await expect(draft).toHaveValue("Retained draft");

  await failedDialog.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("switch", { name: "Simulate failure" }).click();
  await page.getByRole("button", { name: "Edit project" }).click();
  const retryDialog = page.getByRole("dialog", { name: "Edit project" });
  await retryDialog.getByRole("textbox", { name: "Project name" }).fill("Retained draft");
  await retryDialog.getByRole("button", { name: "Save project" }).click();
  await expect.poll(() => page.evaluate(() => typeof window.__highwayCompletePendingSave)).toBe("function");
  await page.evaluate(() => window.__highwayCompletePendingSave?.());
  await expect(page.getByTestId("save-status")).toHaveText("Saved Retained draft");
  await expect(retryDialog).toBeHidden();
});

test("AskBar submits with Enter, protects pending sends, and keeps a failed draft for retry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "AskBar transport state checks run once on desktop.");
  await openConsumer(page);
  const ask = page.getByRole("textbox", { name: "Ask anything" });
  await page.getByRole("switch", { name: "Simulate failure" }).click();
  await ask.fill("Keep this question");
  await ask.press("Enter");
  await expect(ask).toBeDisabled();
  await expect(page.getByRole("status").filter({ hasText: "Sending message" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Example failure");
  await expect(ask).toHaveValue("Keep this question");

  await page.getByRole("switch", { name: "Simulate failure" }).click();
  await ask.press("Enter");
  await expect(page.getByText("Local example reply. Your application owns the transport.", { exact: true })).toBeVisible();
  await expect(ask).toHaveValue("");
});

test("menu, lazy date picker, and effects work from the installed tarballs", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Installed package interactions run once on desktop.");
  await openConsumer(page);

  await page.getByRole("button", { name: "Project actions" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect.poll(() => menu.evaluate((element) => element.closest("[data-highway-portal]")?.getAttribute("data-highway-mode"))).toBe("light");
  await menu.getByRole("menuitem", { name: "Archive locally" }).click();
  await expect(page.getByTestId("save-status")).toHaveText("Archived locally");

  await page.getByRole("button", { name: "Choose date" }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  const frameworkResources = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name).filter((url) => /\/_next\/|next\/static\//i.test(url)));
  expect(frameworkResources).toEqual([]);
  await page.keyboard.press("Escape");

  const blur = page.locator(".fx-progressive");
  await expect(blur).toHaveAttribute("data-edge", "bottom");
  await expect(blur).toHaveAttribute("data-recipe", "panel");
  await expect(blur.locator(":scope > span")).toHaveCount(3);
  await page.getByRole("button", { name: "Foreground action" }).click();
  await expect(page.getByRole("status").filter({ hasText: "preview clicks" })).toHaveText("1 preview clicks");
});

test("host styles stay untouched outside HighwayTheme", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Host style isolation runs once on desktop.");
  await openConsumer(page);
  const before = await hostButtonAppearance(page);
  const hostCopyBefore = await page.getByTestId("host-copy").evaluate((element) => getComputedStyle(element).fontFamily);

  const scopedBodyStyle = await page.evaluate(() => {
    const theme = document.querySelector<HTMLElement>(".highway");
    if (!theme) throw new Error("HighwayTheme scope was not rendered");
    const inner = document.createElement("p");
    inner.className = "inv-body";
    inner.textContent = "Inside scoped type";
    theme.appendChild(inner);
    const outside = document.createElement("p");
    outside.className = "inv-body";
    outside.textContent = "Outside scoped type";
    document.body.appendChild(outside);
    const expected = document.createElement("span");
    expected.style.fontSize = "var(--type-body)";
    expected.style.color = "var(--body-foreground)";
    theme.appendChild(expected);
    const insideStyle = getComputedStyle(inner);
    const outsideStyle = getComputedStyle(outside);
    const expectedStyle = getComputedStyle(expected);
    const result = {
      actualFont: insideStyle.fontSize,
      expectedFont: expectedStyle.fontSize,
      actualColor: insideStyle.color,
      expectedColor: expectedStyle.color,
      outsideColor: outsideStyle.color,
    };
    inner.remove();
    outside.remove();
    expected.remove();
    return result;
  });
  expect(scopedBodyStyle.actualFont).toBe(scopedBodyStyle.expectedFont);
  expect(scopedBodyStyle.actualColor).toBe(scopedBodyStyle.expectedColor);
  expect(scopedBodyStyle.outsideColor).not.toBe(scopedBodyStyle.expectedColor);

  await page.getByRole("switch", { name: "Dark theme" }).click();
  await page.getByRole("switch", { name: "Custom brand" }).click();
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  await expect.poll(() => hostButtonAppearance(page)).toEqual(before);
  await expect.poll(() => page.getByTestId("host-copy").evaluate((element) => getComputedStyle(element).fontFamily)).toBe(hostCopyBefore);
  await expect(page.locator(".highway").first()).toHaveAttribute("data-highway-mode", "dark");
});

test("installed typography roles, rem scaling, and font branding match the contract", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Installed typography contract runs once on desktop.");
  await openConsumer(page);

  const hostBefore = await hostButtonAppearance(page);
  const hostCopyBefore = await hostCopyAppearance(page);
  const initial = await readHighwayTypography(page);
  expect(initial.base).toMatchObject({ fontSize: "14px", lineHeight: "20px", fontWeight: "400" });
  expect(initial.roles).toHaveLength(HIGHWAY_TYPE_ROLES.length);
  for (const expected of HIGHWAY_TYPE_ROLES) {
    const actual = initial.roles.find((role) => role.name === expected.name);
    expect(actual, `${expected.name} role should exist`).toBeDefined();
    for (const selector of [actual!.class, actual!.attribute]) {
      expect(selector.fontSize, `${expected.name} font size`).toBe(`${expected.size}px`);
      expect(selector.lineHeight, `${expected.name} line height`).toBe(`${expected.leading}px`);
      if (expected.weight === null) expect(["400", "500"]).toContain(selector.fontWeight);
      else expect(selector.fontWeight, `${expected.name} font weight`).toBe(String(expected.weight));
    }
    expect(actual!.attribute).toEqual(actual!.class);
  }

  await page.getByRole("switch", { name: "Custom brand" }).click();
  const branded = await readHighwayTypography(page);
  const scaleMetrics = (sample: Awaited<ReturnType<typeof readHighwayTypography>>) => ({
    base: { fontSize: sample.base.fontSize, lineHeight: sample.base.lineHeight, fontWeight: sample.base.fontWeight },
    roles: sample.roles.map(({ name, class: classMetrics, attribute }) => ({
      name,
      class: { fontSize: classMetrics.fontSize, lineHeight: classMetrics.lineHeight, fontWeight: classMetrics.fontWeight },
      attribute: { fontSize: attribute.fontSize, lineHeight: attribute.lineHeight, fontWeight: attribute.fontWeight },
    })),
  });
  expect(scaleMetrics(branded)).toEqual(scaleMetrics(initial));
  expect(branded.base.fontFamily).toContain("Georgia");

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  const enlarged = await readHighwayTypography(page);
  expect(enlarged.base.fontSize).toBe("28px");
  expect(enlarged.base.lineHeight).toBe("40px");
  for (const role of enlarged.roles) {
    const expected = HIGHWAY_TYPE_ROLES.find(({ name }) => name === role.name)!;
    for (const selector of [role.class, role.attribute]) {
      expect(selector.fontSize, `${role.name} scaled font size`).toBe(`${expected.size * 2}px`);
      expect(selector.lineHeight, `${role.name} scaled line height`).toBe(`${expected.leading * 2}px`);
    }
  }
  await page.evaluate(() => { document.documentElement.style.removeProperty("font-size"); });
  await expect.poll(() => hostButtonAppearance(page)).toEqual(hostBefore);
  await expect.poll(() => hostCopyAppearance(page)).toEqual(hostCopyBefore);
});

test("installed analytics typography keeps metrics tabular and dense tables expandable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Analytics type and table density run once on desktop.");
  await openConsumer(page);
  const section = page.getByTestId("analytics-typography");
  await expect(section).toBeVisible();

  const primary = section.locator('[data-highway-metric="primary"]');
  const secondary = section.locator('[data-highway-metric="secondary"]');
  await expect(primary).toHaveCSS("font-size", "30px");
  await expect(primary).toHaveCSS("line-height", "36px");
  await expect(primary).toHaveCSS("font-weight", "600");
  await expect(primary).toHaveCSS("font-variant-numeric", "tabular-nums");
  await expect(secondary).toHaveCSS("font-size", "24px");
  await expect(secondary).toHaveCSS("line-height", "32px");
  await expect(secondary).toHaveCSS("font-weight", "600");
  await expect(secondary).toHaveCSS("font-variant-numeric", "tabular-nums");

  const metricLabel = section.getByTestId("metric-label");
  const labelStyles = await metricLabel.evaluate((element) => {
    const theme = element.closest<HTMLElement>(".highway");
    if (!theme) throw new Error("Metric label is outside HighwayTheme");
    const mutedProbe = document.createElement("span");
    mutedProbe.style.color = "var(--muted-foreground)";
    theme.appendChild(mutedProbe);
    const style = getComputedStyle(element);
    const expectedMuted = getComputedStyle(mutedProbe).color;
    const result = {
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      color: style.color,
      matchesMutedToken: style.color === expectedMuted,
    };
    mutedProbe.remove();
    return result;
  });
  expect(labelStyles).toMatchObject({ fontSize: "14px", lineHeight: "20px", fontWeight: "400", matchesMutedToken: true });
  await expect(section.locator("strong")).toHaveCSS("font-weight", "600");

  const table = section.locator("table.highway-table");
  await expect(table).toBeVisible();
  await expect(table).toHaveCSS("font-size", "13px");
  await expect(table).toHaveCSS("line-height", "20px");
  await expect(table).toHaveCSS("font-variant-numeric", "tabular-nums");
  await expect(table.locator("thead th").first()).toHaveCSS("font-weight", "500");
  await expect(table.locator("tbody td").first()).toHaveCSS("font-weight", "400");

  const rowHeights = await table.locator("tbody tr").evaluateAll((rows) => rows.map((row) => Math.round(row.getBoundingClientRect().height)));
  expect(rowHeights[0]).toBe(40);
  expect(rowHeights[2]).toBeGreaterThan(40);
  await expect(table.locator("tbody tr").nth(2).locator("td").first()).toContainText("wraps naturally");

  const hostBefore = await hostButtonAppearance(page);
  const hostCopyBefore = await hostCopyAppearance(page);
  await page.getByRole("switch", { name: "Dark theme" }).click();
  await page.getByRole("switch", { name: "Custom brand" }).click();
  await expect.poll(() => hostButtonAppearance(page)).toEqual(hostBefore);
  await expect.poll(() => hostCopyAppearance(page)).toEqual(hostCopyBefore);
});

test("phone layout stays within the viewport and keeps composer text readable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Responsive package checks run on the phone project.");
  await openConsumer(page);
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  const input = page.getByRole("textbox", { name: "Ask anything" });
  await expect(input).toBeVisible();
  const fontSize = await input.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(16);
  const ordinaryInput = page.getByRole("textbox", { name: "Project name" });
  const ordinaryInputSize = await ordinaryInput.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(ordinaryInputSize).toBeGreaterThanOrEqual(16);
  const bodySize = await page.locator(".highway").first().evaluate((theme) => {
    const sample = document.createElement("span");
    sample.dataset.highwayType = "body";
    theme.appendChild(sample);
    const size = getComputedStyle(sample).fontSize;
    sample.remove();
    return Number.parseFloat(size);
  });
  expect(bodySize).toBe(14);
});

test("reduced motion removes component transitions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion package check runs on its dedicated project.");
  await openConsumer(page);
  await expect(page.getByTestId("package-button")).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".fx-progressive")).toHaveAttribute("data-edge", "bottom");
});

test("Progress renders its final value without requestAnimationFrame under reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Progress reduced-motion behavior runs on its dedicated project.");
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => undefined;
  });
  await openAuditFixture(page);
  await expect(page.getByRole("progressbar", { name: "Upload progress" })).toHaveAttribute("aria-valuenow", "50");
  await expect(page.getByText("50%", { exact: true })).toBeVisible();
});

test("BottomSheet leaves host styles alone by default and restores an explicit target through nested close and unmount", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "BottomSheet isolation and nested locks run once on desktop.");
  await openAuditFixture(page);

  await page.evaluate(() => {
    const root = document.getElementById("root");
    if (!root) throw new Error("Missing React root");
    document.body.style.overflow = "auto";
    document.body.style.background = "rgb(17, 29, 43)";
    root.style.cssText = "transform:translateX(2px);filter:sepia(.2);border-radius:9px;height:702px;overflow:scroll;transition:opacity 7s;transform-origin:left center";
  });
  const readOwnerStyles = async (selector: string) => page.locator(selector).evaluate((element) => {
    const style = (element as HTMLElement).style;
    return Object.fromEntries(["transform", "filter", "borderRadius", "borderBottomLeftRadius", "height", "overflow", "overflowX", "overflowY", "transition", "transformOrigin"].map((key) => [key, style[key as keyof CSSStyleDeclaration]]));
  });
  const rootBefore = await readOwnerStyles("#root");
  const targetBefore = await readOwnerStyles("#page-target");
  const backgroundBefore = await page.evaluate(() => document.body.style.background);

  await page.getByRole("button", { name: "Open nested sheet" }).click();
  const defaultSheet = page.getByRole("dialog", { name: "Nested sheet" });
  await expect(defaultSheet).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  expect(await readOwnerStyles("#root")).toEqual(rootBefore);
  expect(await readOwnerStyles("#page-target")).toEqual(targetBefore);
  expect(await page.evaluate(() => document.body.style.background)).toBe(backgroundBefore);
  await defaultSheet.getByRole("button", { name: "Close nested sheet" }).click();
  await expect(defaultSheet).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("auto");

  await page.getByRole("button", { name: "Open page-target sheet" }).click();
  const pageSheet = page.getByRole("dialog", { name: "Page target sheet" });
  await expect(pageSheet).toBeVisible();
  await expect.poll(() => page.locator("#page-target").evaluate((element) => (element as HTMLElement).style.transform)).not.toBe(targetBefore.transform);
  expect(await readOwnerStyles("#root")).toEqual(rootBefore);
  expect(await page.evaluate(() => document.body.style.background)).toBe(backgroundBefore);

  await pageSheet.getByRole("button", { name: "Open nested sheet", exact: true }).click();
  const nestedSheet = page.getByRole("dialog", { name: "Nested sheet" });
  await expect(nestedSheet).toBeVisible();
  await nestedSheet.getByRole("button", { name: "Close nested sheet" }).click();
  await expect(nestedSheet).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await pageSheet.getByRole("button", { name: "Close page sheet" }).click();
  await expect(pageSheet).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("auto");
  await expect.poll(() => readOwnerStyles("#page-target")).toEqual(targetBefore);

  await page.getByRole("button", { name: "Open page-target sheet" }).click();
  const unmountedSheet = page.getByRole("dialog", { name: "Page target sheet" });
  await expect(unmountedSheet).toBeVisible();
  await unmountedSheet.getByRole("button", { name: "Unmount sheet owner" }).click();
  await expect(unmountedSheet).toHaveCount(0);
  await expect.poll(() => readOwnerStyles("#page-target")).toEqual(targetBefore);
  expect(await readOwnerStyles("#root")).toEqual(rootBefore);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("auto");
  expect(await page.evaluate(() => document.body.style.background)).toBe(backgroundBefore);
});

test("Dropdown, ProfileMenu, and WorkspaceSwitcher keep closed actions inert and support menu keyboard behavior", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Menu focus behavior runs once on desktop.");
  await openAuditFixture(page);
  const menus = [
    { triggerName: "More options", items: ["Dropdown first", "Dropdown second", "Dropdown third"] },
    { triggerName: "Profile menu", items: ["Profile first", "Profile second", "Profile third"] },
    { triggerName: "Switch startup, currently North startup", items: ["North startup", "South startup", "West startup", "Create startup"] },
  ];

  for (const menuCase of menus) {
    const trigger = page.getByRole("button", { name: menuCase.triggerName, exact: true });
    await trigger.focus();
    await page.keyboard.press("Tab");
    const activeOutsideMenu = await page.evaluate(() => !document.activeElement?.closest('[role="menu"]'));
    expect(activeOutsideMenu, `${menuCase.triggerName} closed items must be skipped by Tab`).toBe(true);
    await expect(page.getByTestId("menu-actions")).toHaveText("");

    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const items = menu.getByRole("menuitem");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(items.last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("menu-actions")).toHaveText("");

    await trigger.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => !document.activeElement?.closest('[role="menu"]'))).toBe(true);
    await expect(page.getByTestId("menu-actions")).toHaveText("");

    await trigger.press("ArrowUp");
    await expect(items.last()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.press("Enter");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("Escape");
  }

  const emptyTrigger = page.getByRole("button", { name: "Empty menu" });
  await emptyTrigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(emptyTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(emptyTrigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(emptyTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(emptyTrigger).toBeFocused();
});

test("installed popover reads reduced-motion preference at each open instead of module load", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Dynamic popover preference changes run once on desktop.");
  await openAuditFixture(page);
  const trigger = page.getByRole("button", { name: "More options", exact: true });
  const openMenu = async () => {
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    return menu.locator("xpath=..");
  };
  const closeMenu = async () => {
    await trigger.click();
    await expect(page.getByRole("menu")).toBeHidden();
  };

  let layer = await openMenu();
  await expect.poll(() => layer.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0.2s, 0.3s, 0.3s");
  await closeMenu();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  layer = await openMenu();
  await expect(layer).toHaveCSS("transition-property", "none");
  await expect(layer).toHaveCSS("opacity", "1");
  await closeMenu();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(false);
  layer = await openMenu();
  await expect.poll(() => layer.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0.2s, 0.3s, 0.3s");
  await closeMenu();
});

test("NumberInput responds once to click, Enter, and Space, and stops held input when disabled or unmounted", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "NumberInput activation and hold cleanup run once on desktop.");
  await openAuditFixture(page);
  const value = page.getByTestId("number-value");
  const increase = page.getByRole("button", { name: "Increase" });

  await expect(value).toHaveText("5");
  const changes = await page.evaluate(() => window.__highwayAuditNumberChanges ?? 0);
  await increase.click();
  await expect(value).toHaveText("6");
  await expect.poll(() => page.evaluate(() => window.__highwayAuditNumberChanges ?? 0)).toBe(changes + 1);
  await increase.press("Enter");
  await expect(value).toHaveText("7");
  await increase.press("Space");
  await expect(value).toHaveText("8");

  await page.getByRole("button", { name: "Toggle number disabled" }).click();
  await expect(increase).toBeDisabled();
  await increase.click({ force: true });
  await expect(value).toHaveText("8");
  await page.getByRole("button", { name: "Toggle number disabled" }).click();

  const box = await increase.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(680);
  const atRelease = Number(await value.textContent());
  await page.mouse.up();
  const afterRelease = Number(await value.textContent());
  expect(atRelease).toBeGreaterThan(8);
  expect(afterRelease).toBe(atRelease);
  await page.waitForTimeout(350);
  await expect(value).toHaveText(String(atRelease));

  const disable = page.getByRole("button", { name: "Toggle number disabled" });
  const disableAt = Number(await value.textContent());
  const disableHoldBox = await increase.boundingBox();
  expect(disableHoldBox).not.toBeNull();
  await page.mouse.move(disableHoldBox!.x + disableHoldBox!.width / 2, disableHoldBox!.y + disableHoldBox!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await disable.evaluate((element) => (element as HTMLButtonElement).click());
  await expect(increase).toBeDisabled();
  const changesAtDisable = await page.evaluate(() => window.__highwayAuditNumberChanges ?? 0);
  await page.waitForTimeout(500);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.__highwayAuditNumberChanges ?? 0)).toBe(changesAtDisable);
  expect(Number(await value.textContent())).toBeGreaterThanOrEqual(disableAt);
  await disable.click();
  await expect(increase).toBeEnabled();

  const unmount = page.getByRole("button", { name: "Unmount number input" });
  const changesBeforeUnmount = await page.evaluate(() => window.__highwayAuditNumberChanges ?? 0);
  const holdBox = await increase.boundingBox();
  expect(holdBox).not.toBeNull();
  await page.mouse.move(holdBox!.x + holdBox!.width / 2, holdBox!.y + holdBox!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await unmount.evaluate((element) => (element as HTMLButtonElement).click());
  const changesAtUnmount = await page.evaluate(() => window.__highwayAuditNumberChanges ?? 0);
  await page.waitForTimeout(500);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.__highwayAuditNumberChanges ?? 0)).toBe(changesAtUnmount);
  expect(changesAtUnmount).toBeGreaterThanOrEqual(changesBeforeUnmount);
  await expect(page.getByRole("button", { name: "Increase" })).toHaveCount(0);
});

test("SliderInput exposes a range, snaps relative to min, and cancels pointer interaction without host style leaks", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Slider keyboard, stepping, and cancellation run once on desktop.");
  await openAuditFixture(page);
  const slider = page.getByRole("slider", { name: "Range", exact: true });
  const fill = slider.locator(":scope > div").first();
  await expect(slider).toHaveAttribute("aria-valuemin", "3");
  await expect(slider).toHaveAttribute("aria-valuemax", "13");
  await expect(slider).toHaveAttribute("aria-valuenow", "3");

  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => fill.evaluate((element) => getComputedStyle(element).transitionProperty)).toBe("none");
  await expect(slider).toHaveAttribute("aria-valuenow", "8");
  await expect(page.getByTestId("slider-value")).toHaveText("8");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuenow", "3");
  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute("aria-valuenow", "13");
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuenow", "3");

  const decimal = page.getByRole("slider", { name: "Decimal range" });
  await decimal.focus();
  await page.keyboard.press("ArrowRight");
  await expect(decimal).toHaveAttribute("aria-valuenow", "0.25");
  await expect(page.getByTestId("decimal-slider-value")).toHaveText("0.25");

  await page.evaluate(() => { document.body.style.userSelect = "text"; document.body.style.cursor = "wait"; });
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  // A completed click stays inside the 80ms quick-click window and exercises
  // the original spring recipe without racing the intentional drag transition.
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(slider).toHaveAttribute("aria-valuenow", "8");
  await expect.poll(() => fill.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0.25s");
  await expect.poll(() => fill.evaluate((element) => getComputedStyle(element).transitionTimingFunction)).toBe("cubic-bezier(0.34, 1.3, 0.64, 1)");

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await expect.poll(() => fill.evaluate((element) => (element as HTMLElement).style.transition)).toBe("none");
  await expect(slider).toHaveAttribute("aria-valuenow", "8");
  await page.mouse.move(box!.x + box!.width * 0.9, box!.y + box!.height / 2);
  await expect(slider).toHaveAttribute("aria-valuenow", "13");
  await slider.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 });
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => ({ userSelect: document.body.style.userSelect, cursor: document.body.style.cursor }))).toEqual({ userSelect: "text", cursor: "wait" });
});

test("SliderInput accepts touch at the 3, 8, 13 midpoint", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Touch pointer behavior runs on the touch-enabled phone project.");
  await openAuditFixture(page);
  const slider = page.getByRole("slider", { name: "Range", exact: true });
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(slider).toHaveAttribute("aria-valuenow", "8");
  await expect(page.getByTestId("slider-value")).toHaveText("8");
});

test("SliderInput and SplitPane accept touch drags and leave document selection styles unchanged", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Touch dragging runs on the touch-enabled phone project.");
  await openAuditFixture(page);
  await page.evaluate(() => { document.body.style.userSelect = "text"; document.body.style.cursor = "wait"; });

  const slider = page.getByRole("slider", { name: "Range", exact: true });
  await slider.scrollIntoViewIfNeeded();
  const sliderBox = await slider.boundingBox();
  expect(sliderBox).not.toBeNull();
  await touchDrag(
    page,
    { x: sliderBox!.x + 8, y: sliderBox!.y + sliderBox!.height / 2 },
    { x: sliderBox!.x + sliderBox!.width / 2, y: sliderBox!.y + sliderBox!.height / 2 },
  );
  await expect(slider).toHaveAttribute("aria-valuenow", "8");

  const divider = page.getByRole("separator", { name: "Resize panes" });
  await divider.scrollIntoViewIfNeeded();
  const dividerBox = await divider.boundingBox();
  expect(dividerBox).not.toBeNull();
  const startingSplit = Number(await divider.getAttribute("aria-valuenow"));
  await touchDrag(
    page,
    { x: dividerBox!.x + dividerBox!.width / 2, y: dividerBox!.y + dividerBox!.height / 2 },
    { x: dividerBox!.x + dividerBox!.width / 2 + 40, y: dividerBox!.y + dividerBox!.height / 2 },
  );
  await expect.poll(async () => Number(await divider.getAttribute("aria-valuenow"))).toBeGreaterThan(startingSplit);
  await expect.poll(() => page.evaluate(() => ({ userSelect: document.body.style.userSelect, cursor: document.body.style.cursor }))).toEqual({ userSelect: "text", cursor: "wait" });
});

test("SplitPane is a keyboard separator, adjusts five points, and preserves body styles through pointer end and unmount", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "SplitPane keyboard and cleanup run once on desktop.");
  await openAuditFixture(page);
  const divider = page.getByRole("separator", { name: "Resize panes" });
  await expect(divider).toHaveAttribute("aria-orientation", "vertical");
  await expect(divider).toHaveAttribute("aria-valuenow", "50");
  await divider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(divider).toHaveAttribute("aria-valuenow", "55");
  await page.keyboard.press("ArrowLeft");
  await expect(divider).toHaveAttribute("aria-valuenow", "50");
  await page.keyboard.press("Home");
  await expect(divider).toHaveAttribute("aria-valuenow", "20");
  await page.keyboard.press("End");
  await expect(divider).toHaveAttribute("aria-valuenow", "80");

  await page.evaluate(() => { document.body.style.userSelect = "text"; document.body.style.cursor = "wait"; });
  const box = await divider.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 24, box!.y + box!.height / 2);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => ({ userSelect: document.body.style.userSelect, cursor: document.body.style.cursor }))).toEqual({ userSelect: "text", cursor: "wait" });
  await page.getByRole("button", { name: "Unmount split pane" }).click();
  await expect(page.getByRole("separator")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => ({ userSelect: document.body.style.userSelect, cursor: document.body.style.cursor }))).toEqual({ userSelect: "text", cursor: "wait" });
});

test("Tabs use view-button pressed state with quote-safe IDs and resize; Progress reports normalized semantics and honors reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop" && testInfo.project.name !== "reduced-motion", "Tabs and Progress checks run on desktop and reduced-motion projects.");
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await openAuditFixture(page);

  const group = page.getByRole("group", { name: "Views" });
  const overview = group.getByRole("button", { name: "Overview" });
  const details = group.getByRole("button", { name: "Details" });
  const indicator = page.locator('[role="group"][aria-label="Views"] + div > div');
  await expect(overview).toHaveAttribute("aria-pressed", "true");
  await expect(details).toHaveAttribute("aria-pressed", "false");
  await details.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("aria-pressed", "true");
  await expect(overview).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("active-tab")).toHaveText("details");

  const indicatorMotion = () => indicator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { property: style.transitionProperty, duration: style.transitionDuration, easing: style.transitionTimingFunction };
  });
  const expectNoMotion = async (read: () => Promise<{ property: string; duration: string }>) => {
    await expect.poll(async () => (await read()).property).toBe("none");
    // The shared reduced-motion stylesheet uses 0.01ms to suppress transitions;
    // browsers serialize that as 1e-05s rather than 0s.
    await expect.poll(async () => Number.parseFloat((await read()).duration)).toBeLessThanOrEqual(0.00001);
  };
  await expectNoMotion(indicatorMotion);
  if (testInfo.project.name === "reduced-motion") {
    await expectNoMotion(indicatorMotion);
    await overview.click();
    await expect(overview).toHaveAttribute("aria-pressed", "true");
    await expectNoMotion(indicatorMotion);
  } else {
    await overview.click();
    await expect(overview).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => indicatorMotion()).toEqual({
      property: "left, width",
      duration: "0.3s, 0.3s",
      easing: "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1)",
    });
    // Reverse the indicator before its first selection animation finishes.
    await details.click();
    await expect(details).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => indicatorMotion()).toMatchObject({ duration: "0.3s, 0.3s" });
  }

  const readIndicatorAlignment = async () => group.evaluate((element) => {
    const selected = element.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    const indicator = element.nextElementSibling?.firstElementChild;
    if (!selected || !indicator) return null;
    const buttonBox = selected.getBoundingClientRect();
    const indicatorBox = indicator.getBoundingClientRect();
    return { offset: Math.abs(buttonBox.left - indicatorBox.left), width: Math.abs(buttonBox.width - indicatorBox.width) };
  });
  const indicatorAligned = async () => {
    const alignment = await readIndicatorAlignment();
    return alignment !== null && alignment.offset <= 0.5 && alignment.width <= 0.5;
  };
  await expect.poll(indicatorAligned).toBe(true);
  await page.evaluate(() => { document.documentElement.style.fontSize = "150%"; });
  await expect.poll(indicatorAligned).toBe(true);
  await page.evaluate(() => { document.documentElement.style.removeProperty("font-size"); });
  const selectedAfterResize = testInfo.project.name === "reduced-motion" ? overview : details;
  await expect(selectedAfterResize).toHaveAttribute("aria-pressed", "true");
  await expect(pageErrors).toEqual([]);

  const progress = page.getByRole("progressbar", { name: "Upload progress" });
  await expect(progress).toHaveAttribute("aria-valuemin", "0");
  await expect(progress).toHaveAttribute("aria-valuemax", "100");
  await expect(progress).toHaveAttribute("aria-valuenow", "50");
  await expect(page.getByText("50%", { exact: true })).toBeVisible();
  await expect(progress.locator(":scope > div")).toHaveAttribute("style", /width:\s*50%/);
  if (testInfo.project.name === "reduced-motion") {
    await expect.poll(() => progress.locator(":scope > div").evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(0.00001);
  }
});

test("ExpandCard preserves its motion recipe, reverses rapid toggles, and keeps content actions open", async ({ page }, testInfo) => {
  test.skip(!["desktop", "reduced-motion"].includes(testInfo.project.name), "ExpandCard motion runs on desktop and the reduced-motion project.");
  await openAuditFixture(page);
  const section = page.getByTestId("audit-expand-card");
  const trigger = section.getByRole("button", { name: "Expansion details" });
  const panelId = await trigger.getAttribute("aria-controls");
  expect(panelId).toBeTruthy();
  const panel = page.locator(`[id="${panelId}"]`);
  // The first child owns the opacity/filter/transform transition. Its inner
  // child only contains text and has no transition of its own.
  const content = panel.locator(":scope > div");
  const readMotion = () => Promise.all([
    panel.evaluate((element) => {
      const style = getComputedStyle(element);
      return { property: style.transitionProperty, duration: style.transitionDuration, easing: style.transitionTimingFunction };
    }),
    content.evaluate((element) => {
      const style = getComputedStyle(element);
      return { property: style.transitionProperty, duration: style.transitionDuration, delay: style.transitionDelay, easing: style.transitionTimingFunction };
    }),
  ]);

  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(await panel.evaluate((element) => element.hasAttribute("inert"))).toBe(true);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(await panel.evaluate((element) => element.hasAttribute("inert"))).toBe(false);

  if (testInfo.project.name === "reduced-motion") {
    const [panelMotion, contentMotion] = await readMotion();
    expect(panelMotion.property).toBe("none");
    expect(Number.parseFloat(panelMotion.duration)).toBeLessThanOrEqual(0.00001);
    expect(contentMotion.property).toBe("none");
    expect(Number.parseFloat(contentMotion.duration)).toBeLessThanOrEqual(0.00001);
  } else {
    await expect.poll(() => readMotion()).toEqual([
      { property: "height", duration: "0.35s", easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      {
        property: "opacity, filter, transform",
        duration: "0.25s, 0.25s, 0.25s",
        delay: "0.1s, 0.1s, 0.1s",
        easing: "ease, ease, cubic-bezier(0.16, 1, 0.3, 1)",
      },
    ]);
    // Reverse expansion during the entrance transition; the trigger remains live.
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(await panel.evaluate((element) => element.hasAttribute("inert"))).toBe(true);
    const [, exitMotion] = await readMotion();
    expect(exitMotion).toMatchObject({ duration: "0.15s, 0.15s, 0.15s", delay: "0s, 0s, 0s" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await panel.evaluate((element) => element.hasAttribute("inert"))).toBe(false);
  }

  const beforeAction = await panel.evaluate((element) => Number.parseFloat(getComputedStyle(element).height));
  await section.getByTestId("expand-card-action").click();
  await expect(section.getByTestId("expand-action-count")).toHaveText("1");
  await expect(section.getByTestId("expanded-detail")).toHaveText("Added detail 1");
  await expect(trigger, "A child action should not toggle the card closed").toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => panel.evaluate((element) => Number.parseFloat(getComputedStyle(element).height))).toBeGreaterThan(beforeAction);
});

test("ActionButton follows its async result, blocks duplicate activation, and allows retry after rejection", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Async action lifecycle runs once on desktop.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-action-button");
  const action = section.getByRole("button", { name: "Archive record" });
  await section.getByRole("button", { name: "Fail archive" }).click();

  await action.focus();
  await page.keyboard.press("Enter");
  await expect(action).toHaveAttribute("aria-busy", "true");
  await expect(action).toHaveAttribute("aria-disabled", "true");
  await expect(action).toBeFocused();
  await expect(section.getByRole("status").filter({ hasText: "Archiving record" })).toBeVisible();

  // aria-disabled keeps the control focusable; a duplicate event must still be
  // ignored by the action state guard while its original promise is pending.
  await action.evaluate((element) => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await expect(section.getByTestId("action-call-count")).toHaveText("1");
  await section.getByRole("button", { name: "Complete pending archive" }).click();
  await expect(section.getByRole("alert")).toHaveText("Archive failed. Try again.");
  await expect(section.getByTestId("action-error-count")).toHaveText("1");
  await expect(action).not.toHaveAttribute("aria-busy", "true");
  await expect(action).not.toHaveAttribute("aria-disabled", "true");

  await section.getByRole("button", { name: "Allow archive" }).click();
  await action.click();
  await section.getByRole("button", { name: "Complete pending archive" }).click();
  await expect(section.getByRole("status").filter({ hasText: "Record archived" })).toBeVisible();
  await expect(section.getByTestId("action-call-count")).toHaveText("2");
  await expect(section.getByTestId("action-error-count")).toHaveText("1");
  await expect(section.getByRole("alert")).toHaveCount(0);
});

test("Table sorting is keyboard accessible and selection stays with its stable row key", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Table sorting and selection identity run once on desktop.");
  await openAuditFixture(page);

  const table = page.getByTestId("audit-table").getByRole("table");
  const aspenRow = table.getByRole("row", { name: /Aspen/ });
  const aspenSelection = aspenRow.getByRole("checkbox");
  await aspenSelection.check();
  await expect(aspenSelection).toBeChecked();
  await expect(page.getByTestId("selected-row-ids")).toHaveText("aspen");
  await expect(page.getByTestId("selected-row-indices")).toHaveText("1");

  const nameHeader = table.getByRole("columnheader").filter({ hasText: "Name" });
  const sortByName = nameHeader.getByRole("button");
  await sortByName.focus();
  await page.keyboard.press("Enter");
  await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  await expect.poll(() => table.locator("tbody tr").evaluateAll((rows) => rows.map((row) => (row as HTMLTableRowElement).cells[1]?.textContent?.trim()))).toEqual([
    "Aspen", "Birch", "Cedar",
  ]);
  const sortedAspenRow = table.getByRole("row", { name: /Aspen/ });
  await expect(sortedAspenRow.getByRole("checkbox")).toBeChecked();
  await expect(page.getByTestId("selected-row-ids")).toHaveText("aspen");
  await expect(page.getByTestId("selected-row-indices")).toHaveText("1");

  await sortByName.focus();
  await page.keyboard.press("Enter");
  await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  await expect.poll(() => table.locator("tbody tr").evaluateAll((rows) => rows.map((row) => (row as HTMLTableRowElement).cells[1]?.textContent?.trim()))).toEqual([
    "Cedar", "Birch", "Aspen",
  ]);
  await expect(table.getByRole("row", { name: /Aspen/ }).getByRole("checkbox")).toBeChecked();
  await expect(page.getByTestId("selected-row-ids")).toHaveText("aspen");
  await expect(page.getByTestId("selected-row-indices")).toHaveText("1");

  await table.getByRole("row", { name: /Birch/ }).getByRole("checkbox").check();
  await expect(page.getByTestId("selected-row-ids")).toHaveText("aspen,birch");
  await expect(page.getByTestId("selected-row-indices")).toHaveText("1,2");
});

test("Select supports keyboard navigation, disabled options, typeahead, and Escape focus restoration", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Select keyboard behavior runs once on desktop.");
  await openAuditFixture(page);

  const trigger = page.getByRole("combobox", { name: "Notification channel" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const popup = page.getByRole("listbox");
  await expect(popup).toBeVisible();
  await expect(page.getByRole("option", { name: "Voice call" })).toBeDisabled();
  await page.keyboard.press("ArrowDown");
  const push = page.getByRole("option", { name: "Push notification" });
  await expect(push).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(popup).not.toBeVisible();
  await expect(trigger).toContainText("Push notification");
  await expect(page.getByTestId("channel-value")).toHaveText("push");
  await expect(trigger).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(popup).toBeVisible();
  await page.keyboard.press("s");
  const sms = page.getByRole("option", { name: "SMS" });
  await expect(sms).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("SMS");
  await expect(page.getByTestId("channel-value")).toHaveText("sms");

  await page.keyboard.press("Enter");
  await expect(popup).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText("SMS");
  await expect(page.getByTestId("channel-value")).toHaveText("sms");
});

test("Combobox and MultiSelect search with keyboard navigation and skip disabled options", async ({ page }, testInfo) => {
  test.skip(!["desktop", "phone"].includes(testInfo.project.name), "Searchable choice behavior runs on desktop and phone.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-choice-pickers");
  const regionTrigger = section.getByRole("button", { name: /^Region:/ });
  await regionTrigger.click();
  const regionSearch = page.getByRole("combobox", { name: "Search Region" });
  await regionSearch.fill("north");
  const northwind = page.getByRole("option", { name: "Northwind" });
  await expect(northwind).toHaveAttribute("aria-disabled", "true");
  const northstar = page.getByRole("option", { name: "Northstar Enterprise Region for Shared Projects and Accounts" });
  await northstar.scrollIntoViewIfNeeded();
  await page.getByRole("listbox", { name: "Region" }).screenshot({ path: testInfo.outputPath(`combobox-long-option-${testInfo.project.name}.png`) });
  const northstarId = (await northstar.getAttribute("id"))!;
  await regionSearch.press("ArrowDown");
  await expect(regionSearch).toHaveAttribute("aria-activedescendant", northstarId);
  await regionSearch.press("Enter");
  await expect(regionTrigger).toContainText("Northstar Enterprise Region");
  await expect(page.getByTestId("region-value")).toHaveText("northstar");

  const segmentsTrigger = section.getByRole("button", { name: /^Segments:/ });
  await segmentsTrigger.click();
  const segmentsSearch = page.getByRole("combobox", { name: "Search Segments" });
  await segmentsSearch.fill("report");
  const shortReport = page.getByRole("option", { name: "Reports", exact: true });
  const longReport = page.getByRole("option", { name: "Quarterly revenue report for distributed teams and finance reviewers", exact: true });
  await expect(longReport).toBeVisible();
  const gutterGeometry = await Promise.all([shortReport, longReport].map((option) => option.evaluate((element) => {
    const label = element.querySelector<HTMLElement>(":scope > span")!;
    const check = element.querySelector<SVGElement>(".hw-choice-check")!;
    const checkBounds = check.getBoundingClientRect();
    return {
      labelHeight: label.getBoundingClientRect().height,
      labelOverflow: label.scrollWidth - label.clientWidth,
      checkRight: checkBounds.right,
      checkVisibility: getComputedStyle(check).visibility,
      checkShrink: getComputedStyle(check).flexShrink,
    };
  })));
  expect(Math.abs(gutterGeometry[0].checkRight - gutterGeometry[1].checkRight)).toBeLessThanOrEqual(1);
  expect(gutterGeometry.every(({ checkVisibility, checkShrink }) => checkVisibility === "hidden" && checkShrink === "0")).toBe(true);
  expect(gutterGeometry[1].labelOverflow).toBeLessThanOrEqual(1);
  if (testInfo.project.name === "phone") expect(gutterGeometry[1].labelHeight).toBeGreaterThan(gutterGeometry[0].labelHeight);
  const revenueReport = page.getByRole("option", { name: "Revenue report", exact: true });
  const revenueReportId = (await revenueReport.getAttribute("id"))!;
  await segmentsSearch.press("ArrowDown");
  await expect(segmentsSearch).toHaveAttribute("aria-activedescendant", revenueReportId);
  await segmentsSearch.press("Enter");
  await expect(page.getByTestId("segment-values")).toHaveText("revenue-report");
  await expect(segmentsSearch).toBeVisible();

  await segmentsSearch.fill("finance");
  const longFinanceOption = page.getByRole("option", { name: "Quarterly revenue report for distributed teams and finance reviewers", exact: true });
  const financeOption = page.getByRole("option", { name: "Finance", exact: true });
  const longFinanceId = (await longFinanceOption.getAttribute("id"))!;
  const financeId = (await financeOption.getAttribute("id"))!;
  await expect(segmentsSearch).toHaveAttribute("aria-activedescendant", longFinanceId);
  await segmentsSearch.press("ArrowDown");
  await expect(segmentsSearch).toHaveAttribute("aria-activedescendant", financeId);
  await segmentsSearch.press("Enter");
  await expect(page.getByTestId("segment-values")).toHaveText("revenue-report,finance");
  await expect(segmentsTrigger).toContainText("Revenue report, Finance");
});

test("multiple Combobox and its MultiSelect compatibility wrapper preserve array selection", async ({ page }, testInfo) => {
  test.skip(!["desktop", "phone"].includes(testInfo.project.name), "Multiple searchable choice behavior runs on desktop and phone.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-choice-pickers");
  const trigger = section.getByRole("button", { name: /^Combined segments:/ });
  await trigger.click();
  const search = page.getByRole("combobox", { name: "Search Combined segments" });
  const listbox = page.getByRole("listbox", { name: "Combined segments" });
  await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
  await search.fill("finance");
  const finance = page.getByRole("option", { name: "Finance", exact: true });
  await expect(finance).toHaveAttribute("aria-selected", "false");
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(finance).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("combined-segment-values")).toHaveText("finance");
  await expect(search).toBeVisible();

  await search.fill("reports");
  const reports = page.getByRole("option", { name: "Reports", exact: true });
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(reports).toHaveAttribute("aria-selected", "true");
  await expect(finance).toHaveCount(0);
  await expect(page.getByTestId("combined-segment-values")).toHaveText("finance,reports");

  const compatibilityTrigger = section.getByRole("button", { name: /^Segments:/ });
  await compatibilityTrigger.click();
  const compatibilitySearch = page.getByRole("combobox", { name: "Search Segments" });
  await compatibilitySearch.fill("finance");
  await compatibilitySearch.press("ArrowDown");
  await compatibilitySearch.press("Enter");
  await expect(page.getByTestId("segment-values")).toHaveText("finance");
});

test("search and layout wrappers preserve their distinct behavior through the installed package", async ({ page }, testInfo) => {
  test.skip(!["desktop", "phone"].includes(testInfo.project.name), "Search and layout family interactions run on desktop and phone.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-search-layout-family");
  const staticSearch = section.locator(".hw-search-bar input");
  await staticSearch.fill("Apollo projects");
  await expect(page.getByTestId("static-search-value")).toHaveText("Apollo projects");
  await expect(section.locator(".hw-search-bar")).toBeVisible();
  await expect(section.locator(".hw-search-bar").getByRole("button", { name: "Open search" })).toHaveCount(0);

  const expandableTrigger = section.getByRole("button", { name: "Open search" }).nth(0);
  await expandableTrigger.click();
  const expandedSearch = section.getByRole("textbox", { name: "Search projects" });
  await expect(expandedSearch).toBeFocused({ timeout: 3_000 });
  await expandedSearch.fill("Active project");
  await expect(page.getByTestId("search-bar-value")).toHaveText("Active project");
  await expandedSearch.press("Escape");
  await expect.poll(() => section.locator(".hw-search-toggle-shell").nth(0).evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(45);

  const compatibilityTrigger = section.getByRole("button", { name: "Open search" }).nth(1);
  await compatibilityTrigger.click();
  const compatibilitySearch = section.getByRole("textbox", { name: "Search legacy projects" });
  await expect(compatibilitySearch).toBeFocused({ timeout: 3_000 });
  await compatibilitySearch.fill("Legacy query");
  await expect(page.getByTestId("search-toggle-value")).toHaveText("Legacy query");

  const stack = page.getByTestId("horizontal-stack");
  const row = page.getByTestId("legacy-row");
  await expect(stack.locator(":scope > span")).toHaveCount(2);
  const [stackStyle, rowStyle] = await Promise.all([stack, row].map((element) => element.evaluate((node) => ({
    direction: getComputedStyle(node).flexDirection,
    alignment: getComputedStyle(node).alignItems,
    childrenInline: node.children[0].getBoundingClientRect().left < node.children[1].getBoundingClientRect().left,
  }))));
  expect(stackStyle).toEqual({ direction: "row", alignment: "flex-start", childrenInline: true });
  expect(rowStyle).toEqual({ direction: "row", alignment: "center", childrenInline: true });
  await expect(page.getByTestId("vertical-stack")).toHaveCSS("flex-direction", "column");
  await expect(page.getByTestId("aligned-row")).toHaveCSS("align-items", "flex-start");
});

test("legacy Dialog and Modal use the same accessible shell and restore the opener after Escape", async ({ page }, testInfo) => {
  test.skip(!["desktop", "phone"].includes(testInfo.project.name), "Shared legacy overlay behavior runs on desktop and phone.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-dialog-family");
  const dialogTrigger = section.getByRole("button", { name: "Open legacy dialog" });
  await dialogTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Shared shell dialog" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  const titleId = await dialog.getAttribute("aria-labelledby");
  const descriptionId = await dialog.getAttribute("aria-describedby");
  expect(titleId).toBeTruthy();
  expect(descriptionId).toBeTruthy();
  await expect(page.locator(`#${titleId}`)).toHaveText("Shared shell dialog");
  await expect(page.locator(`#${descriptionId}`)).toHaveText("A composed content-light dialog.");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(dialogTrigger).toBeFocused();

  const modalTrigger = section.getByRole("button", { name: "Open legacy modal" });
  await modalTrigger.click();
  const modal = page.getByRole("dialog", { name: "Shared shell modal" });
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute("aria-modal", "true");
  await expect(modal.getByRole("button", { name: "Close" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(modalTrigger).toBeFocused();
});

test("InlineEdit retains rejected drafts, retries successfully, and restores focus after Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "InlineEdit save and dismissal behavior runs once on desktop.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-inline-edit");
  await section.getByRole("button", { name: "Edit Project name: Apollo project" }).click();
  const draft = section.getByRole("textbox", { name: "Project name" });
  await expect(draft).toBeFocused();
  await draft.fill("Retained project draft");
  await section.getByRole("button", { name: "Save", exact: true }).click();
  await expect(section.getByRole("button", { name: "Save", exact: true })).toHaveAttribute("aria-busy", "true");
  await expect(draft).toBeDisabled();
  await page.keyboard.press("Escape");
  await section.getByRole("button", { name: "Complete pending project save" }).click();
  await expect(draft).toBeVisible();
  await expect(draft).toBeEnabled();
  await expect(section.getByRole("alert")).toHaveText("Could not save. Your changes are retained. Try again.");
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue("Retained project draft");
  await expect(section.getByTestId("inline-save-count")).toHaveText("1");

  await section.getByRole("button", { name: "Allow project save" }).click();
  await section.getByRole("button", { name: "Save", exact: true }).click();
  await section.getByRole("button", { name: "Complete pending project save" }).click();
  const savedTrigger = section.getByRole("button", { name: "Edit Project name: Retained project draft" });
  await expect(savedTrigger).toBeVisible();
  await expect(section.getByTestId("inline-save-count")).toHaveText("2");

  await savedTrigger.click();
  const reopenedDraft = section.getByRole("textbox", { name: "Project name" });
  await expect(reopenedDraft).toHaveValue("Retained project draft");
  await reopenedDraft.fill("Discard this change");
  await page.keyboard.press("Escape");
  await expect(reopenedDraft).toHaveCount(0);
  await expect(savedTrigger).toBeFocused();
  await savedTrigger.click();
  await expect(section.getByRole("textbox", { name: "Project name" })).toHaveValue("Retained project draft");
});

test("DateRangePicker validates native date inputs and restores focus after keyboard calendar dismissal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Date range validation and calendar dismissal run once on desktop.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-date-range");
  const from = section.getByLabel("From");
  const to = section.getByLabel("To");
  await expect(from).toHaveAttribute("type", "date");
  await expect(to).toHaveAttribute("type", "date");
  await expect(from).toHaveValue("2026-05-20");
  await expect(to).toHaveValue("2026-05-10");
  await expect(from).toHaveAttribute("aria-invalid", "true");
  await expect(to).toHaveAttribute("aria-invalid", "true");
  await expect(section.getByRole("alert")).toHaveText("Choose an ordered range within the allowed dates.");

  await from.fill("2026-05-05");
  await expect(page.getByTestId("date-range-value")).toHaveText("2026-05-05|2026-05-10");
  await expect(section.getByRole("alert")).toHaveCount(0);

  const chooseDates = section.getByRole("button", { name: "Choose Booking window" });
  await chooseDates.scrollIntoViewIfNeeded();
  await chooseDates.focus();
  await page.keyboard.press("Enter");
  const calendar = page.locator('[data-slot="calendar"]');
  await expect(calendar).toBeVisible();
  const popup = page.locator('[data-slot="popover-content"].ui-date-popover');
  const waitForCalendarAnimations = () => popup.evaluate(async (element) => {
    const animations = new Set<Animation>();
    let ancestor: Element | null = element;
    while (ancestor) {
      const active = ancestor === element ? ancestor.getAnimations({ subtree: true }) : ancestor.getAnimations();
      active.forEach((animation) => animations.add(animation));
      ancestor = ancestor.parentElement;
    }
    await Promise.all(Array.from(animations, (animation) => animation.finished.catch(() => undefined)));
  });
  await waitForCalendarAnimations();
  const desktopDay = await popup.locator(".rdp-day_button").first().evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(desktopDay.width).toBeGreaterThanOrEqual(44);
  expect(desktopDay.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Escape");
  await expect(calendar).not.toBeVisible();

  await page.setViewportSize({ width: 320, height: 640 });
  await chooseDates.scrollIntoViewIfNeeded();
  await chooseDates.focus();
  await page.keyboard.press("Enter");
  await expect(calendar).toBeVisible();
  await waitForCalendarAnimations();
  const calendarGeometry = await popup.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const dayBounds = Array.from(element.querySelectorAll<HTMLElement>(".rdp-day_button"), (day) => {
      const dayRect = day.getBoundingClientRect();
      return { left: dayRect.left, right: dayRect.right, width: dayRect.width, height: dayRect.height };
    });
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      overflowY: getComputedStyle(element).overflowY,
      dayBounds,
    };
  });
  expect(calendarGeometry.left).toBeGreaterThanOrEqual(0);
  expect(calendarGeometry.right).toBeLessThanOrEqual(calendarGeometry.viewportWidth);
  expect(calendarGeometry.top).toBeGreaterThanOrEqual(0);
  expect(calendarGeometry.bottom).toBeLessThanOrEqual(calendarGeometry.viewportHeight);
  expect(calendarGeometry.overflowY).toBe("auto");
  expect(calendarGeometry.dayBounds.length).toBeGreaterThan(0);
  const dayBoundsFit = calendarGeometry.dayBounds.every((day) =>
    day.left >= calendarGeometry.left - 0.5 &&
    day.right <= calendarGeometry.right + 0.5 &&
    day.width >= 40 &&
    day.height >= 43.5
  );
  expect(dayBoundsFit, JSON.stringify(calendarGeometry)).toBe(true);
  await popup.screenshot({ path: testInfo.outputPath(`date-range-calendar-320px-${testInfo.project.name}.png`) });
  await expect(popup.getByRole("button", { name: "Invalid preset" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(calendar).not.toBeVisible();
  await expect(chooseDates).toBeFocused();
});

test("CopyButton reports clipboard rejection and retries after a successful write", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Clipboard result handling runs once on desktop.");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (window.__highwayClipboardFailure) throw new Error("Clipboard unavailable");
          window.__highwayCopiedText = value;
        },
      },
    });
  });
  await openAuditFixture(page);

  const section = page.getByTestId("audit-action-patterns");
  const copy = section.getByTestId("copy-notes");
  await page.evaluate(() => { window.__highwayClipboardFailure = true; });
  await copy.click();
  await expect(copy).toContainText("Retry copy");
  await expect(section.getByTestId("copy-error-count")).toHaveText("1");
  await expect(section.getByTestId("copy-success-count")).toHaveText("0");
  await expect(section.getByRole("status").filter({ hasText: "Could not copy. Try again." })).toBeVisible();

  await page.evaluate(() => { window.__highwayClipboardFailure = false; });
  await copy.click();
  await expect(copy).toContainText("Copied");
  await expect(section.getByTestId("copy-success-count")).toHaveText("1");
  await expect(page.evaluate(() => window.__highwayCopiedText)).resolves.toBe("Quarterly report notes");
});

test("SplitButton keeps async failure retryable and Button asChild blocks activation while pending", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Action pattern behavior runs once on desktop.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-action-patterns");
  const buttonGroup = section.getByRole("group", { name: "Record actions" });
  await expect(buttonGroup.getByRole("button", { name: "Review" })).toBeVisible();
  await expect(buttonGroup.getByRole("button", { name: "Duplicate" })).toBeVisible();
  const filterToolbar = section.getByRole("group", { name: "Current filters" });
  await expect(filterToolbar).toContainText("2 active filters");
  await filterToolbar.getByRole("button", { name: "Clear filters" }).click();
  await expect(section.getByTestId("filter-clear-count")).toHaveText("1");

  const create = section.getByRole("button", { name: "Create report", exact: true });
  const alternatives = section.getByRole("button", { name: "Create report alternatives", exact: true });
  const actionTargetBounds = await Promise.all([create, alternatives].map((button) => button.boundingBox()));
  expect(actionTargetBounds.every((bounds) => bounds && bounds.width >= 44 && bounds.height >= 44)).toBe(true);
  await alternatives.focus();
  await page.keyboard.press("Enter");
  const templateAction = page.getByRole("menuitem", { name: "Create from template" });
  await expect(templateAction).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(templateAction).toBeHidden();
  await expect(alternatives).toBeFocused();
  await create.click();
  await expect(create).toHaveAttribute("aria-busy", "true");
  await expect(section.getByRole("status").filter({ hasText: "Working" })).toBeVisible();
  await section.getByRole("button", { name: "Complete pending report creation" }).click();
  await expect(section.getByRole("alert")).toHaveText("Action failed. Try again.");
  await expect(section.getByTestId("split-action-count")).toHaveText("1");
  await expect(section.getByTestId("split-error-count")).toHaveText("1");

  await section.getByRole("button", { name: "Allow report creation" }).click();
  await create.click();
  await section.getByRole("button", { name: "Complete pending report creation" }).click();
  await expect(section.getByRole("status").filter({ hasText: "Completed" })).toBeVisible();
  await expect(section.getByTestId("split-action-count")).toHaveText("2");
  await expect(section.getByRole("alert")).toHaveCount(0);

  const publish = section.getByRole("link", { name: "Publish report" });
  await publish.focus();
  await page.keyboard.press("Enter");
  await expect(section.getByTestId("slot-button-call-count")).toHaveText("1");
  await page.evaluate(() => history.replaceState(null, "", location.pathname));
  await section.getByRole("button", { name: "Set publish pending" }).click();
  await expect(publish).toHaveAttribute("aria-busy", "true");
  await expect(publish).toHaveAttribute("aria-disabled", "true");
  await publish.focus();
  await page.keyboard.press("Enter");
  await expect(section.getByTestId("slot-button-call-count")).toHaveText("1");
  await expect(page).not.toHaveURL(/#slot-action$/);
  await expect(publish).toBeFocused();
});

test("CommandPalette retains its search and open dialog after async failure, then closes on retry success", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Command palette async failure handling runs once on desktop.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-command-palette");
  const opener = section.getByRole("button", { name: "Open commands" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Project commands" });
  await expect(dialog).toBeVisible();
  const search = dialog.getByRole("combobox", { name: "Search Project commands" });
  await search.fill("refresh");
  await expect(dialog.getByRole("option", { name: "Rebuild search index" })).toBeVisible();
  await search.press("Enter");
  await expect(dialog).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => typeof window.__highwayCompletePendingCommand)).toBe("function");
  await page.evaluate(() => window.__highwayCompletePendingCommand?.());
  await expect(dialog.getByRole("alert")).toHaveText("Command failed. Try again.");
  await expect(search).toHaveValue("refresh");
  await expect(section.getByTestId("command-call-count")).toHaveText("1");
  await expect(section.getByTestId("command-error-count")).toHaveText("1");

  await search.press("Enter");
  await expect.poll(() => page.evaluate(() => typeof window.__highwayCompletePendingCommand)).toBe("function");
  await page.evaluate(() => window.__highwayCompletePendingCommand?.());
  await expect(dialog).toBeHidden();
  await expect(section.getByTestId("command-call-count")).toHaveText("2");
  await expect(section.getByTestId("command-error-count")).toHaveText("1");
  await expect(opener).toBeFocused();
});

test("ToastProvider keeps zero-duration messages and pauses a timed toast while keyboard-focused", async ({ page }, testInfo) => {
  test.skip(!["desktop", "phone"].includes(testInfo.project.name), "Toast dismissal timing runs on desktop and phone.");
  await page.clock.install();
  await openAuditFixture(page);

  const controls = page.getByTestId("audit-toast-controls");
  await controls.getByRole("button", { name: "Show persistent toast" }).click();
  const persistent = page.getByRole("status").filter({ hasText: "Persistent toast" });
  await expect(persistent).toBeVisible();
  await page.clock.runFor(5_500);
  await expect(persistent).toHaveCount(1);

  await controls.getByRole("button", { name: "Show timed toast" }).click();
  const timed = page.getByRole("status").filter({ hasText: "Timed toast" });
  await expect(timed).toBeVisible();
  const dismiss = page.getByRole("button", { name: "Dismiss Timed toast" });
  await page.keyboard.press("Tab");
  await dismiss.focus();
  await expect(dismiss).toBeFocused();
  await timed.locator("xpath=..").screenshot({ path: testInfo.outputPath(`toast-focused-${testInfo.project.name}.png`) });
  await page.clock.runFor(5_500);
  await expect(timed).toHaveCount(1);

  await controls.getByRole("button", { name: "Show timed toast" }).focus();
  await page.clock.runFor(5_500);
  await expect(timed).toHaveCount(0);
  await expect(persistent).toHaveCount(1);
});

test("installed Table renders a real mixed Checkbox mark with mixed accessibility state", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The mixed checkbox mark contract runs once on desktop.");
  await openAuditFixture(page);

  const section = page.getByTestId("audit-checkbox-marks");
  const checkbox = section.getByRole("checkbox", { name: "Select all rows" });
  await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  await expect(checkbox).toHaveAttribute("data-state", "indeterminate");
  const mixedMark = checkbox.locator(".ui-checkbox-mixed");
  await expect(mixedMark).toBeVisible();
  await expect(checkbox.locator(".ui-checkbox-check")).toBeHidden();
});

test("installed agent tools exports exercise microphone, context, and proposal handlers", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Installed agent-tools package behavior runs once on desktop.");
  await page.addInitScript(() => {
    const state = { trackStops: 0 };
    Object.defineProperty(window, "__packageAgentToolsMedia", { configurable: true, value: state });
    const stream = () => {
      const track = { stop() { state.trackStops += 1; } };
      return { getTracks: () => [track], getAudioTracks: () => [track] };
    };
    class MockMediaRecorder {
      state: "inactive" | "recording" | "paused" = "inactive";
      mimeType = "audio/webm";
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor() {}
      start() { this.state = "recording"; }
      pause() { this.state = "paused"; }
      resume() { this.state = "recording"; }
      stop() {
        this.state = "inactive";
        this.ondataavailable?.({ data: new Blob(["installed package audio"], { type: this.mimeType }) });
        this.onstop?.();
      }
      static isTypeSupported(type: string) { return type.startsWith("audio/"); }
    }
    Object.defineProperty(window, "MediaRecorder", { configurable: true, writable: true, value: MockMediaRecorder });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { async getUserMedia() { return stream(); } },
    });
  });
  await openAuditFixture(page);

  const tools = page.getByTestId("audit-agent-tools");
  const recorder = tools.getByRole("region", { name: "Package voice note" });
  await recorder.getByRole("button", { name: "Record" }).focus();
  await page.keyboard.press("Enter");
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await recorder.getByRole("button", { name: "Pause" }).click();
  await expect(recorder).toHaveAttribute("data-state", "paused");
  await recorder.getByRole("button", { name: "Resume" }).click();
  await expect(recorder).toHaveAttribute("data-state", "recording");
  await recorder.getByRole("button", { name: "Stop recording" }).click();
  await expect(recorder).toHaveAttribute("data-state", "ready");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __packageAgentToolsMedia: { trackStops: number } }).__packageAgentToolsMedia.trackStops)).toBe(1);
  await recorder.getByRole("button", { name: "Attach recording" }).click();
  await expect(recorder.getByRole("alert")).toHaveText("Package attach failed. Retry the recording.");
  await expect(recorder.locator('audio[aria-label="Recorded voice note"]')).toHaveCount(1);
  await recorder.getByRole("button", { name: "Attach recording" }).click();
  await expect(tools.getByTestId("agent-recorder-result")).toContainText("Attached audio/webm");
  await expect(tools.getByTestId("agent-recorder-attempts")).toHaveText("2");

  const tray = tools.getByRole("region", { name: "Package context" });
  const contextTrigger = tray.getByRole("button", { name: "Inspect Package product brief" });
  await contextTrigger.click();
  const contextDialog = page.getByRole("dialog", { name: "Package product brief" });
  await expect(contextDialog).toContainText("Host-controlled context remains inspectable and removable.");
  await page.keyboard.press("Escape");
  await expect(contextDialog).toBeHidden();
  await expect(contextTrigger).toBeFocused();
  await tray.getByRole("button", { name: "Remove Package product brief" }).click();
  await expect(tools.getByTestId("agent-context-result")).toHaveText("Removed brief.");
  await expect(tray).toContainText("No context attached.");

  const proposal = tools.locator('[data-slot="card"]');
  await expect(proposal.getByText("Package review proposal", { exact: true })).toBeVisible();
  await expect(proposal).toContainText("Original package consumer text.");
  await expect(proposal).toContainText("Updated package consumer text.");
  await proposal.getByRole("button", { name: "Reject" }).click();
  await expect(tools.getByTestId("agent-review-reject-result")).toHaveText("Package proposal rejected.");
  await proposal.getByRole("button", { name: "Apply changes" }).click();
  await expect(proposal.getByRole("alert")).toHaveText("Package apply failed. Retry the proposal.");
  await proposal.getByRole("button", { name: "Apply changes" }).click();
  await expect(tools.getByTestId("agent-review-result")).toHaveText("Package proposal applied after retry.");
  await expect(tools.getByTestId("agent-review-attempts")).toHaveText("2");
});
