import { expect, test } from "@playwright/test";

const storyUrl = "/iframe.html?id=foundation-quality-lab--all-states&viewMode=story";
const portalLayersStoryUrl = "/iframe.html?id=foundation-portal-layer-contracts--all-states&viewMode=story";
const controlFamilyStoryUrl = "/iframe.html?id=foundation-control-family--all-states&viewMode=story";

async function openControlFamily(page: import("@playwright/test").Page) {
  await page.goto(controlFamilyStoryUrl);
  await expect(page.getByRole("heading", { name: "Different purposes. Shared precision." })).toBeVisible();
}

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

test("SegmentedControl is a labelled native button group with working pointer and keyboard selection", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Segmented control interaction runs once on desktop.");
  await openControlFamily(page);

  const group = page.getByRole("group", { name: "Schedule view", exact: true });
  const day = group.getByRole("button", { name: "Day", exact: true });
  const week = group.getByRole("button", { name: "Week", exact: true });
  const month = group.getByRole("button", { name: "Month", exact: true });
  const year = group.getByRole("button", { name: "Year", exact: true });
  await expect(group.getByRole("tab")).toHaveCount(0);
  await expect(group.getByRole("button")).toHaveCount(4);
  await expect(day).toHaveAttribute("type", "button");
  await expect(week).toHaveAttribute("aria-pressed", "true");
  await expect(year).toBeDisabled();

  await day.click();
  await expect(day).toHaveAttribute("aria-pressed", "true");
  await expect(week).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Selected: day", { exact: true })).toBeVisible();

  await day.focus();
  await page.keyboard.press("Tab");
  await expect(week).toBeFocused();
  await page.keyboard.press("Space");
  await expect(week).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Selected: week", { exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(month).toBeFocused();

  await year.click({ force: true });
  await expect(week).toHaveAttribute("aria-pressed", "true");
  const disabledGroup = page.getByRole("group", { name: "Reporting period", exact: true });
  const current = disabledGroup.getByRole("button", { name: "Current reporting period", exact: true });
  const previous = disabledGroup.getByRole("button", { name: "Previous reporting period", exact: true });
  await expect(current).toBeDisabled();
  await expect(previous).toBeDisabled();
  await expect(current).toHaveAttribute("aria-pressed", "true");
  await previous.click({ force: true });
  await expect(current).toHaveAttribute("aria-pressed", "true");

  // These package-owned primitives keep their surrounding labels as accessible names.
  await expect(page.getByRole("checkbox", { name: "Include notes", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Archived", exact: true })).toBeDisabled();
  await expect(page.getByRole("switch", { name: "Live updates", exact: true })).toBeChecked();
  await expect(page.getByRole("radiogroup", { name: "Delivery", exact: true })).toBeVisible();
});

test("control family preserves compact segmented geometry, 48px slider geometry, and readable long labels on phones", async ({ page }, testInfo) => {
  test.skip(!["phone", "narrow"].includes(testInfo.project.name), "Control target geometry runs at phone widths.");
  await openControlFamily(page);

  const segmented = page.getByRole("group", { name: "Schedule view", exact: true });
  const optionGeometry = await segmented.getByRole("button").evaluateAll((buttons) => buttons.map((button) => {
    const { width, height } = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    return {
      label: button.textContent?.trim(),
      width,
      height,
      paddingInlineStart: style.paddingInlineStart,
      paddingInlineEnd: style.paddingInlineEnd,
    };
  }));
  expect(optionGeometry).toHaveLength(4);
  expect(optionGeometry.every(({ width }) => width > 0)).toBe(true);
  expect(optionGeometry.every(({ height }) => height === 32)).toBe(true);
  expect(optionGeometry.every(({ paddingInlineStart, paddingInlineEnd }) =>
    paddingInlineStart === "12px" && paddingInlineEnd === "12px",
  )).toBe(true);
  await expect(segmented).toHaveCSS("column-gap", "4px");

  const slider = page.getByRole("slider", { name: "Intensity", exact: true });
  const sliderGeometry = await slider.evaluate((element) => {
    const style = getComputedStyle(element);
    const fill = element.querySelector<HTMLElement>(".hw-slider-fill")!;
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;border-radius:var(--control-radius);padding:var(--control-inset)";
    element.appendChild(probe);
    const probeStyle = getComputedStyle(probe);
    const rootRadius = Number.parseFloat(probeStyle.borderTopLeftRadius);
    const inset = Number.parseFloat(probeStyle.paddingTop);
    probe.remove();
    return {
      height: element.getBoundingClientRect().height,
      outerRadius: Number.parseFloat(style.borderTopLeftRadius),
      rootRadius,
      inset,
      fillRadius: Number.parseFloat(getComputedStyle(fill).borderTopLeftRadius),
    };
  });
  expect(sliderGeometry.height).toBeGreaterThanOrEqual(48);
  expect(sliderGeometry.outerRadius).toBeCloseTo(sliderGeometry.rootRadius + sliderGeometry.inset, 1);
  expect(sliderGeometry.fillRadius).toBeCloseTo(sliderGeometry.rootRadius, 1);

  const longSlider = page.getByRole("slider", { name: "A longer label that remains readable in a narrow layout", exact: true });
  const longLabel = longSlider.locator(".hw-slider-label");
  const wrapping = await longLabel.evaluate((element) => {
    const style = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return {
      height: bounds.height,
      lineHeight: Number.parseFloat(style.lineHeight),
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      right: bounds.right,
    };
  });
  expect(wrapping.height).toBeGreaterThan(wrapping.lineHeight);
  expect(wrapping.scrollWidth).toBeLessThanOrEqual(wrapping.clientWidth + 1);
  expect(wrapping.right).toBeLessThanOrEqual(testInfo.project.name === "narrow" ? 321 : 391);
  await expect(longSlider).toHaveAttribute("aria-disabled", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test("SliderInput updates with keyboard and pointer, and keeps selection motion off when reduced motion is requested", async ({ page }, testInfo) => {
  test.skip(!["desktop", "reduced-motion"].includes(testInfo.project.name), "Slider interaction runs on desktop and reduced-motion projects.");
  await openControlFamily(page);

  const slider = page.getByRole("slider", { name: "Intensity", exact: true });
  const fill = slider.locator(".hw-slider-fill");
  await expect(slider).toHaveAttribute("aria-valuenow", "40");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "41");
  await expect(page.getByText("41%", { exact: true })).toBeVisible();

  const bounds = await slider.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.click(bounds!.x + bounds!.width * 0.75, bounds!.y + bounds!.height / 2);
  await expect(slider).toHaveAttribute("aria-valuenow", "75");

  if (testInfo.project.name === "reduced-motion") {
    await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await expect.poll(() => fill.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)))
      .toBeLessThanOrEqual(0.001);
    const indicator = page.locator(".hw-segmented-indicator").first();
    await expect.poll(() => indicator.evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration)))
      .toBeLessThanOrEqual(0.001);
  }

  const lightBackground = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--background").trim());
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect.poll(() => page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--background").trim()))
    .not.toBe(lightBackground);
});

test("SliderInput ignores a second touch and remains active until its owning pointer ends", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Multitouch behavior runs on the touch-enabled phone project.");
  await openControlFamily(page);

  const slider = page.getByRole("slider", { name: "Intensity", exact: true });
  await slider.scrollIntoViewIfNeeded();
  const bounds = await slider.boundingBox();
  expect(bounds).not.toBeNull();
  const y = bounds!.y + bounds!.height / 2;
  const start = { x: bounds!.x + bounds!.width * 0.4, y };
  const secondStart = { x: bounds!.x + bounds!.width * 0.7, y };
  const secondEnd = { x: bounds!.x + bounds!.width * 0.95, y };
  const firstEnd = { x: bounds!.x + bounds!.width * 0.6, y };
  const cdp = await page.context().newCDPSession(page);
  const point = (position: { x: number; y: number }, id: number) => ({ ...position, id, radiusX: 2, radiusY: 2, force: 1 });
  const dispatch = (type: "touchStart" | "touchMove" | "touchEnd", touchPoints: ReturnType<typeof point>[]) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  try {
    await dispatch("touchStart", [point(start, 1)]);
    await expect(slider).toHaveAttribute("aria-valuenow", "40");
    await dispatch("touchStart", [point(start, 1), point(secondStart, 2)]);
    await dispatch("touchMove", [point(start, 1), point(secondEnd, 2)]);
    await expect(slider).toHaveAttribute("aria-valuenow", "40");
    await dispatch("touchEnd", [point(start, 1)]);
    await dispatch("touchMove", [point(firstEnd, 1)]);
    await expect(slider).toHaveAttribute("aria-valuenow", "60");
    await dispatch("touchEnd", []);
  } finally {
    await cdp.detach();
  }
});
