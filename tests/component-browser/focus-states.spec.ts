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
    };
  });
}

async function readSharedFieldFocusStyles(shell: Locator) {
  return shell.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.boxShadow = "var(--field-focus-shadow)";
    (element.parentElement ?? element).appendChild(probe);
    const expectedShadow = getComputedStyle(probe).boxShadow;
    probe.remove();

    const control = element.matches("input, textarea, select")
      ? element
      : element.querySelector("input, textarea, select");
    if (!control) throw new Error("Field focus target has no control");
    const controlStyle = getComputedStyle(control);
    return {
      boxShadow: getComputedStyle(element).boxShadow,
      expectedShadow,
      outlineStyle: getComputedStyle(element).outlineStyle,
      control: { outlineStyle: controlStyle.outlineStyle, boxShadow: controlStyle.boxShadow },
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

test("Search composites use one keyboard ring and preserve native focus in forced colors", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Direct component focus checks run once on desktop.");

  const searchPreview = await openPreview(page, "search");
  const searchInput = searchPreview.locator(".hw-search-bar input");
  await focusFirstWithKeyboard(page, searchInput);
  await expect(searchInput).toBeFocused();
  const searchShell = searchPreview.locator(".hw-search-bar");
  await expect.poll(async () => {
    const styles = await readSharedFieldFocusStyles(searchShell);
    return styles.boxShadow === styles.expectedShadow;
  }, { timeout: 3_000 }).toBe(true);
  const searchStyles = await readSharedFieldFocusStyles(searchShell);
  expect(searchStyles.outlineStyle).toBe("none");
  expect(searchStyles.boxShadow).toBe(searchStyles.expectedShadow);
  expect(searchStyles.control.outlineStyle).toBe("none");
  expect(searchStyles.control.boxShadow).toBe("none");

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
  const toggleShell = searchTogglePreview.locator(".hw-search-toggle-shell");
  await expect.poll(async () => {
    const styles = await readSharedFieldFocusStyles(toggleShell);
    return styles.boxShadow === styles.expectedShadow;
  }, { timeout: 3_000 }).toBe(true);
  const toggleStyles = await readSharedFieldFocusStyles(toggleShell);
  expect(toggleStyles.outlineStyle).toBe("none");
  expect(toggleStyles.boxShadow).toBe(toggleStyles.expectedShadow);
  expect(toggleStyles.control.outlineStyle).toBe("none");
  expect(toggleStyles.control.boxShadow).toBe("none");

  const textInputPreview = await openPreview(page, "text-input");
  const nativeInput = textInputPreview.locator('[data-slot="input"]');
  await focusFirstWithKeyboard(page, nativeInput);
  await expect(nativeInput).toBeFocused();
  await expect.poll(async () => {
    const styles = await readSharedFieldFocusStyles(nativeInput);
    return styles.boxShadow === styles.expectedShadow;
  }, { timeout: 3_000 }).toBe(true);
  const nativeInputStyles = await readSharedFieldFocusStyles(nativeInput);
  expect(nativeInputStyles.outlineStyle).toBe("none");
  expect(nativeInputStyles.control.outlineStyle).toBe("none");

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
