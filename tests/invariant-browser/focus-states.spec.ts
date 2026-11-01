import { expect, test, type Locator, type Page } from "@playwright/test";
import { openDirectPreview } from "./preview-routes";

async function openPreview(page: Page, component: string) {
  return openDirectPreview(page, component);
}

async function focusFirstWithKeyboard(page: Page, target: Locator) {
  for (let tab = 0; tab < 4; tab += 1) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Preview control was not reached within four Tab presses");
}

async function readFocusStyles(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      outlineOffset: style.outlineOffset,
      outlineColor: style.outlineColor,
      boxShadow: style.boxShadow,
      ringShadow: style.getPropertyValue("--tw-ring-shadow").trim(),
    };
  });
}

async function systemHighlight(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "Highlight";
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
}

test("Invariant search composites use one keyboard ring and preserve native focus in forced colors", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Direct Invariant focus checks run once on desktop.");

  const searchPreview = await openPreview(page, "search");
  const searchInput = searchPreview.locator(".hw-search-bar input");
  await focusFirstWithKeyboard(page, searchInput);
  await expect(searchInput).toBeFocused();
  await expect.poll(async () => (await readFocusStyles(page, ".hw-search-bar")).boxShadow).toContain("2px");
  const searchBarStyles = await readFocusStyles(page, ".hw-search-bar");
  const searchInputStyles = await readFocusStyles(page, ".hw-search-bar input");
  expect(searchBarStyles.ringShadow).toContain("calc(2px + 0px)");
  expect(searchInputStyles.outlineStyle).toBe("none");

  // SearchToggle is a standalone preview; don't rely on the combined SearchBar screen.
  const searchTogglePreview = await openPreview(page, "search-toggle");
  const openSearch = searchTogglePreview.getByRole("button", { name: "Open search" });
  await focusFirstWithKeyboard(page, openSearch);
  await expect(openSearch).toBeFocused();
  const triggerStyles = await readFocusStyles(page, 'button[aria-label="Open search"]');
  expect(triggerStyles.outlineStyle).toBe("solid");
  expect(triggerStyles.outlineWidth).toBe(2);
  expect(triggerStyles.outlineOffset).toBe("-2px");
  await page.keyboard.press("Enter");
  const expandedInput = searchTogglePreview.locator(".hw-search-toggle-shell input");
  await expect(expandedInput).toBeFocused({ timeout: 3_000 });
  const toggleShellStyles = await readFocusStyles(page, ".hw-search-toggle-shell");
  expect(toggleShellStyles.outlineStyle).toBe("solid");
  expect((await readFocusStyles(page, ".hw-search-toggle-shell input")).outlineStyle).toBe("none");

  const textInputPreview = await openPreview(page, "text-input");
  const nativeInput = textInputPreview.locator('[data-slot="input"]');
  await focusFirstWithKeyboard(page, nativeInput);
  await expect(nativeInput).toBeFocused();
  expect((await readFocusStyles(page, '[data-slot="input"]')).outlineStyle).toBe("solid");

  const buttonPreview = await openPreview(page, "button");
  const nativeButton = buttonPreview.getByRole("button", { name: "Add something good" });
  await focusFirstWithKeyboard(page, nativeButton);
  await expect(nativeButton).toBeFocused();
  expect((await readFocusStyles(page, '.highway-preview .ui-button:not([aria-label])')).outlineStyle).toBe("solid");

  await page.emulateMedia({ forcedColors: "active" });
  const forcedSearchPreview = await openPreview(page, "search");
  const forcedSearchInput = forcedSearchPreview.locator(".hw-search-bar input");
  await focusFirstWithKeyboard(page, forcedSearchInput);
  await expect(forcedSearchInput).toBeFocused();
  const forcedSearchShell = await readFocusStyles(page, ".hw-search-bar");
  const forcedSearchInputStyles = await readFocusStyles(page, ".hw-search-bar input");
  expect(forcedSearchShell.outlineStyle).toBe("solid");
  expect(forcedSearchShell.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(forcedSearchShell.outlineColor).toBe(await systemHighlight(page));
  expect(forcedSearchShell.boxShadow).toBe("none");
  expect(forcedSearchInputStyles.outlineStyle).toBe("none");

  const forcedInputPreview = await openPreview(page, "text-input");
  const forcedInputControl = forcedInputPreview.locator('[data-slot="input"]');
  await focusFirstWithKeyboard(page, forcedInputControl);
  await expect(forcedInputControl).toBeFocused();
  const forcedInput = await readFocusStyles(page, '[data-slot="input"]');
  expect(forcedInput.outlineStyle).toBe("solid");
  expect(forcedInput.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(forcedInput.outlineColor).toBe(await systemHighlight(page));

  const forcedButtonPreview = await openPreview(page, "button");
  const forcedButton = forcedButtonPreview.getByRole("button", { name: "Add something good" });
  await focusFirstWithKeyboard(page, forcedButton);
  await expect(forcedButton).toBeFocused();
  const forcedButtonStyles = await readFocusStyles(page, '.highway-preview .ui-button:not([aria-label])');
  expect(forcedButtonStyles.outlineStyle).toBe("solid");
  expect(forcedButtonStyles.outlineWidth).toBeGreaterThanOrEqual(2);
  expect(forcedButtonStyles.outlineColor).toBe(await systemHighlight(page));
});
