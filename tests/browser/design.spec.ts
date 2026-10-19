import { expect, test } from "@playwright/test";

const storyUrl = "/iframe.html?id=foundation-quality-lab--all-states&viewMode=story";
const portalLayersStoryUrl = "/iframe.html?id=foundation-portal-layer-contracts--all-states&viewMode=story";

test("theme and workspace accent reach an opaque dialog portal", async ({ page }) => {
  await page.goto(storyUrl);
  await page.getByRole("button", { name: "Light theme" }).click();
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

  const accent = page.getByRole("textbox", { name: "Accent color (six-digit hex)" });
  await accent.fill("#2255aa");
  const completedStatus = page.getByText("Completed", { exact: true });
  const semanticStatusColor = await completedStatus.evaluate((element) => getComputedStyle(element).color);
  expect(semanticStatusColor).not.toBe("rgb(34, 85, 170)");

  for (const theme of ["light", "dark"] as const) {
    await page.getByRole("button", { name: theme === "light" ? "Light theme" : "Dark theme" }).click();
    if (theme === "dark") await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    const themedStatusColor = await completedStatus.evaluate((element) => getComputedStyle(element).color);
    expect(themedStatusColor).not.toBe("rgb(34, 85, 170)");

    await page.getByRole("button", { name: "Test form dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Example record form" });
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((element) => element.closest(".design-lab"))).toBeNull();

    const portalAccent = await dialog.evaluate((element) => getComputedStyle(element).getPropertyValue("--primary").trim());
    expect(portalAccent).toBe("#2255aa");
    const primaryAction = dialog.locator(".ui-button-primary");
    await expect(primaryAction).toHaveCSS("background-color", "rgb(34, 85, 170)");
    const dialogBackground = await dialog.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(dialogBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(dialogBackground).not.toBe("transparent");
    const dialogBackdropFilter = await dialog.evaluate((element) => getComputedStyle(element, "::before").backdropFilter);
    expect(dialogBackdropFilter).toBe("none");

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
});

test("nested shared Select portal layers above dialogs and honors nested Escape", async ({ page }) => {
  await page.goto(portalLayersStoryUrl);
  const compactAction = page.getByRole("button", { name: "Open compact action" });
  const compactSize = await compactAction.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });
  expect(compactSize.width).toBeGreaterThanOrEqual(44);
  expect(compactSize.height).toBeGreaterThanOrEqual(44);

  const dialogTrigger = page.getByRole("button", { name: "Open nested-control dialog" });
  await dialogTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Popup layer contract" });
  await expect(dialog).toBeVisible();
  const dialogBackdropFilter = await dialog.evaluate((element) => getComputedStyle(element, "::before").backdropFilter);
  expect(dialogBackdropFilter).toBe("none");
  const dialogLayer = await dialog.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10));

  const select = dialog.getByRole("combobox", { name: "Notification channel" });
  await select.focus();
  await page.keyboard.press("Enter");
  const selectPopup = page.locator('[data-slot="select-content"]');
  await expect(selectPopup).toBeVisible();
  const selectLayer = await selectPopup.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10));
  expect(selectLayer).toBeGreaterThan(dialogLayer);
  await expect(page.locator('[role="option"][data-highlighted]')).toHaveCount(1);
  await page.keyboard.press("ArrowDown");
  const northstarOption = page.getByRole("option", { name: "Northstar" });
  await expect(northstarOption).toBeFocused();
  await expect(northstarOption).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("Escape");
  await expect(selectPopup).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(select).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(dialogTrigger).toBeFocused();

  await dialogTrigger.click();
  await expect(dialog).toBeVisible();
  await select.click();
  await expect(selectPopup).toBeVisible();
  await page.getByRole("option", { name: "Northstar" }).click();
  await expect(selectPopup).not.toBeVisible();
  await expect(select).toContainText("Northstar");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(dialogTrigger).toBeFocused();
});

test("nested shared Calendar portal layers above dialogs and dismisses independently", async ({ page }) => {
  await page.goto(portalLayersStoryUrl);
  const dialogTrigger = page.getByRole("button", { name: "Open nested-control dialog" });
  await dialogTrigger.click();
  const dialog = page.getByRole("dialog", { name: "Popup layer contract" });
  await expect(dialog).toBeVisible();
  const dialogLayer = await dialog.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10));

  const startDate = dialog.getByRole("textbox", { name: "Start date" });
  await startDate.fill("2026-10-20");
  await expect(startDate).toHaveValue("2026-10-20");
  const chooseDate = dialog.getByRole("button", { name: "Choose date" });
  await chooseDate.click();
  const calendar = page.locator('[data-slot="calendar"]');
  await expect(calendar).toBeVisible();
  const calendarPopup = page.locator('[data-slot="popover-content"].ui-date-popover');
  const calendarLayer = await calendarPopup.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10));
  expect(calendarLayer).toBeGreaterThan(dialogLayer);

  const day = calendar.locator('button[data-day]:not([disabled])').nth(5);
  await day.click();
  await expect(startDate).not.toHaveValue("2026-10-20");
  await chooseDate.click();
  await expect(calendar).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(calendarPopup).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(startDate).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(dialogTrigger).toBeFocused();
});

test("shared Sheet keeps an opaque base and nested Select dismisses independently", async ({ page }) => {
  await page.goto(portalLayersStoryUrl);
  const sheetTrigger = page.getByRole("button", { name: "Open shared sheet" });
  await sheetTrigger.click();
  const sheet = page.getByRole("dialog", { name: "Shared sheet surface" });
  await expect(sheet).toBeVisible();
  const sheetBackdropFilter = await sheet.evaluate((element) => getComputedStyle(element, "::before").backdropFilter);
  expect(sheetBackdropFilter).toBe("none");
  const sheetLayer = await sheet.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10));

  const select = sheet.getByRole("combobox", { name: "Sheet channel" });
  await select.focus();
  await page.keyboard.press("Enter");
  const popup = page.locator('[data-slot="select-content"]');
  await expect(popup).toBeVisible();
  const popupLayer = await popup.evaluate((element) => Number.parseInt(getComputedStyle(element).zIndex, 10));
  expect(popupLayer).toBeGreaterThan(sheetLayer);
  expect(await popup.evaluate((element) => element.closest('[data-slot="sheet-content"]') !== null)).toBe(true);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Northstar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(popup).not.toBeVisible();
  await expect(sheet).toBeVisible();
  await expect(select).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
  await expect(sheetTrigger).toBeFocused();
});

test("Select outside overlays stays in the document portal and closes with Escape", async ({ page }) => {
  await page.goto(portalLayersStoryUrl);
  const select = page.getByRole("combobox", { name: "Page channel" });
  await select.focus();
  await page.keyboard.press("Enter");

  const popup = page.locator('[data-slot="select-content"]');
  await expect(popup).toBeVisible();
  expect(await popup.evaluate((element) => element.closest("body") === document.body)).toBe(true);
  expect(await popup.evaluate((element) => element.closest('[data-slot="dialog-content"], [data-slot="sheet-content"]'))).toBeNull();
  await page.keyboard.press("Escape");
  await expect(popup).not.toBeVisible();
  await expect(select).toBeFocused();
});

test("form failure retains the draft, blocks Escape while saving, and restores focus", async ({ page }) => {
  await page.goto(storyUrl);
  const trigger = page.getByRole("button", { name: "Test form dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Example record form" });
  await dialog.getByRole("textbox", { name: "Record name" }).fill("Northshore draft stays intact");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();

  await expect(dialog.getByText(/example connection is unavailable/i)).toBeVisible();
  await expect(dialog.getByRole("textbox", { name: "Record name" })).toHaveValue("Northshore draft stays intact");
  await expect(dialog.locator('[tabindex="-1"]').filter({ hasText: /example connection is unavailable/i })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("shared form input text stays at least 16px at phone widths", async ({ page }, testInfo) => {
  test.skip(!["phone", "narrow"].includes(testInfo.project.name), "This contract runs at phone viewport widths.");
  await page.goto(storyUrl);
  const recordName = page.getByRole("textbox", { name: "Record name" }).first();
  const inputSize = await recordName.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(inputSize).toBeGreaterThanOrEqual(16);
});

test("shared controls and long content fit at 200% text in a 320px viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "narrow", "The enlarged-text contract runs in the 320px viewport project.");
  await page.goto(storyUrl);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });

  const recordName = page.getByRole("textbox", { name: "Record name" }).first();
  const inputSize = await recordName.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(inputSize).toBeGreaterThanOrEqual(16);
  await expect(recordName).toBeVisible();

  const clippedHeadings = await page.locator(".design-lab :is(h1, h2, h3)").evaluateAll((headings) =>
    headings.flatMap((heading) => {
      const { scrollWidth, clientWidth } = heading;
      return scrollWidth > clientWidth + 1 ? [{ text: heading.textContent?.trim(), scrollWidth, clientWidth }] : [];
    }),
  );
  expect(clippedHeadings).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const stressPanel = page.locator(".lab-stress");
  const panelOverflow = await stressPanel.evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(panelOverflow).toBeLessThanOrEqual(1);

  const undersizedTargets = await page.locator(".design-lab button:not(.ui-button-inline)").evaluateAll((buttons) =>
    buttons.flatMap((button) => {
      const { width, height } = button.getBoundingClientRect();
      return width < 44 || height < 44 ? [{ label: button.textContent?.trim(), width, height }] : [];
    }),
  );
  expect(undersizedTargets).toEqual([]);
});

test("shared controls disable their transition under reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "This contract runs in the reduced-motion browser project.");
  await page.goto(storyUrl);
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCSS("transition-duration", "0s");
});
