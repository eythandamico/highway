import { expect, test } from "@playwright/test";

const storyUrl = "/iframe.html?id=foundation-surface-family--all-states&viewMode=story";

async function openSurfaceFamily(page: import("@playwright/test").Page) {
  await page.goto(storyUrl);
  await expect(page.getByRole("heading", { name: "One family, at every layer." })).toBeVisible();
}

async function expectInsideViewport(locator: import("@playwright/test").Locator) {
  const readBounds = () => locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  await expect.poll(async () => {
    const bounds = await readBounds();
    return bounds.left >= -1 && bounds.top >= -1 &&
      bounds.right <= bounds.viewportWidth + 1 && bounds.bottom <= bounds.viewportHeight + 1;
  }).toBe(true);
  const bounds = await readBounds();
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.top).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight + 1);
}

async function expectMinimumTarget(locator: import("@playwright/test").Locator, minimum = 44) {
  await expect.poll(async () => {
    const bounds = await locator.boundingBox();
    return Math.min(bounds?.width ?? 0, bounds?.height ?? 0);
  }).toBeGreaterThanOrEqual(minimum);
}

async function expectRenderedSize(locator: import("@playwright/test").Locator, width: number, height: number) {
  await expect.poll(async () => {
    const bounds = await locator.boundingBox();
    return {
      width: Math.round(bounds?.width ?? 0),
      height: Math.round(bounds?.height ?? 0),
    };
  }).toEqual({ width, height });
}

test("Invariant Menu preserves original row geometry, roving focus, and destructive meaning", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Menu keyboard and theme contracts run once on desktop.");
  await openSurfaceFamily(page);

  const menu = page.getByRole("menu", { name: "Project actions" });
  const items = menu.getByRole("menuitem");
  await expect(items).toHaveCount(4);
  await expect(items.nth(0)).toHaveAttribute("tabindex", "0");
  await expect(items.nth(1)).toBeDisabled();
  await expect(items.nth(1)).not.toHaveAttribute("tabindex");

  const rowGeometry = await items.evaluateAll((buttons) => buttons.map((button) => {
    const bounds = button.getBoundingClientRect();
    return {
      height: bounds.height,
      radius: getComputedStyle(button).borderRadius,
      width: bounds.width,
      scrollWidth: button.scrollWidth,
      clientWidth: button.clientWidth,
    };
  }));
  expect(rowGeometry.map(({ height }) => height)).toEqual([32, 32, 48, 32]);
  const tokenMenuItemRadius = await menu.evaluate((element) => {
    const probe = document.createElement("div");
    probe.style.borderRadius = "var(--menu-item-radius)";
    element.appendChild(probe);
    const radius = getComputedStyle(probe).borderRadius;
    probe.remove();
    return radius;
  });
  expect(tokenMenuItemRadius).toBe("8px");
  expect(rowGeometry.every(({ radius }) => radius === tokenMenuItemRadius)).toBe(true);
  expect(rowGeometry.every(({ scrollWidth, clientWidth }) => scrollWidth <= clientWidth + 1)).toBe(true);

  const normalColor = await items.nth(0).evaluate((element) => getComputedStyle(element).color);
  const destructiveColor = await items.nth(3).evaluate((element) => getComputedStyle(element).color);
  expect(destructiveColor).not.toBe(normalColor);

  await items.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press("End");
  await expect(items.nth(3)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press("s");
  await expect(items.nth(2)).toBeFocused();
  await expect(items.nth(2)).toHaveAttribute("tabindex", "0");
  await items.nth(1).evaluate((element) => (element as HTMLButtonElement).click());
  await expect(page.locator('section[aria-label="Menus"] output')).toHaveText("No action yet");

  await page.getByRole("button", { name: "Open action menu" }).click();
  const dropdownTrigger = page.getByRole("button", { name: "Open action menu" });
  const overview = page.getByRole("menuitem", { name: "View overview" });
  await expect(overview).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Unavailable action" })).toBeDisabled();
  const dropdownContent = page.locator('[data-slot="dropdown-menu-content"]');
  await expect.poll(async () => dropdownContent.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  const dropdownRows = page.locator('[data-slot^="dropdown-menu-"][role^="menuitem"]');
  await expect(dropdownRows).toHaveCount(5);
  const dropdownGeometry = await dropdownRows.evaluateAll((rows) => rows.map((row) => ({
    height: row.getBoundingClientRect().height,
    minHeight: getComputedStyle(row).minHeight,
    radius: getComputedStyle(row).borderRadius,
    scrollWidth: row.scrollWidth,
    clientWidth: row.clientWidth,
  })));
  expect(dropdownGeometry).toHaveLength(5);
  // The compact menu contract is --space-8 (32px); long labels may grow beyond that minimum.
  expect(dropdownGeometry.every(({ minHeight }) => minHeight === "32px")).toBe(true);
  expect(dropdownGeometry.every(({ height, minHeight }) => height >= Number.parseFloat(minHeight))).toBe(true);
  expect(dropdownGeometry.every(({ radius }) => radius === dropdownGeometry[0].radius)).toBe(true);
  expect(dropdownGeometry.every(({ scrollWidth, clientWidth }) => scrollWidth <= clientWidth + 1)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("surface-family-menu-open.png"), fullPage: true });

  const exportOptions = page.getByRole("menuitem", { name: "Export options" });
  await exportOptions.focus();
  await page.keyboard.press("ArrowRight");
  const pdfOption = page.getByRole("menuitem", { name: "PDF document" });
  await expect(pdfOption).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(pdfOption).toBeHidden();
  await expect(exportOptions).toBeFocused();
  await expect(overview).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(overview).toBeHidden();
  await expect(dropdownTrigger).toBeFocused();

  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  const darkNormalColor = await items.nth(0).evaluate((element) => getComputedStyle(element).color);
  const darkDestructiveColor = await items.nth(3).evaluate((element) => getComputedStyle(element).color);
  expect(darkDestructiveColor).not.toBe(darkNormalColor);
});

test("surface-family cards, accordions, steps, and overlays stay usable at 320px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "narrow", "Surface geometry is checked at the 320px viewport.");
  await openSurfaceFamily(page);

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(pageWidth).toBeLessThanOrEqual(1);
  const card = page.locator('[data-slot="card"]').first();
  const content = card.locator('[data-slot="card-content"]');
  const footer = card.locator('[data-slot="card-footer"]');
  await expect(content).toContainText("project-with-an-unusually-long-unbroken-reference");
  await expect(footer).toBeVisible();
  const cardLayout = await page.evaluate(() => {
    const card = document.querySelector('[data-slot="card"]')!;
    const content = card.querySelector('[data-slot="card-content"]')!;
    const footer = card.querySelector('[data-slot="card-footer"]')!;
    return {
      cardOverflow: card.scrollWidth - card.clientWidth,
      contentOverflow: content.scrollWidth - content.clientWidth,
      footerOverflow: footer.scrollWidth - footer.clientWidth,
      footerWrap: getComputedStyle(footer).flexWrap,
      actionsInsideFooter: [...footer.children].every((child) => {
        const childRect = child.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        return childRect.left >= footerRect.left - 1 && childRect.right <= footerRect.right + 1;
      }),
    };
  });
  expect(cardLayout.cardOverflow).toBeLessThanOrEqual(1);
  expect(cardLayout.contentOverflow).toBeLessThanOrEqual(1);
  expect(cardLayout.footerOverflow).toBeLessThanOrEqual(1);
  expect(cardLayout.footerWrap).toBe("wrap");
  expect(cardLayout.actionsInsideFooter).toBe(true);

  const menu = page.getByRole("menu", { name: "Project actions" });
  const menuRows = await menu.getByRole("menuitem").evaluateAll((items) => items.map((item) => {
    const bounds = item.getBoundingClientRect();
    return { width: bounds.width, height: bounds.height, scrollWidth: item.scrollWidth, clientWidth: item.clientWidth };
  }));
  expect(menuRows.every(({ width }) => width >= 180)).toBe(true);
  expect(menuRows.map(({ height }) => height)).toEqual([32, 32, 48, 32]);
  expect(menuRows.every(({ scrollWidth, clientWidth }) => scrollWidth <= clientWidth + 1)).toBe(true);

  const accordions = page.getByRole("button", { name: "A considered expansion" });
  const accordionPanelId = await accordions.getAttribute("aria-controls");
  const accordionPanel = page.locator(`#${accordionPanelId}`);
  await expect(accordions).toHaveAttribute("aria-expanded", "false");
  await expect(accordionPanel).toHaveAttribute("aria-hidden", "true");
  await expect(accordionPanel).toHaveAttribute("inert", "");
  await accordions.click();
  await expect(accordions).toHaveAttribute("aria-expanded", "true");
  await expect(accordionPanel).toHaveAttribute("aria-hidden", "false");
  await expect(accordionPanel.getByRole("button", { name: "Expanded action" })).toBeVisible();
  await accordions.click();
  await expect(accordionPanel).toHaveAttribute("inert", "");

  const stepButtons = page.getByRole("button", { name: /^Step \d+$/ });
  await expect(stepButtons).toHaveCount(5);
  const stepTargets = await stepButtons.evaluateAll((buttons) => {
    const firstLeft = buttons[0].getBoundingClientRect().left;
    return buttons.map((button) => {
      const { left, width, height } = button.getBoundingClientRect();
      const hitArea = getComputedStyle(button, "::before");
      return {
        width: Math.round(width),
        height: Math.round(height),
        offset: Math.round(left - firstLeft),
        hitAreaTop: hitArea.top,
        hitAreaBottom: hitArea.bottom,
      };
    });
  });
  expect(stepTargets).toEqual([
    { width: 10, height: 10, offset: 0, hitAreaTop: "-8px", hitAreaBottom: "-8px" },
    { width: 36, height: 10, offset: 18, hitAreaTop: "-8px", hitAreaBottom: "-8px" },
    { width: 10, height: 10, offset: 62, hitAreaTop: "-8px", hitAreaBottom: "-8px" },
    { width: 10, height: 10, offset: 80, hitAreaTop: "-8px", hitAreaBottom: "-8px" },
    { width: 10, height: 10, offset: 98, hitAreaTop: "-8px", hitAreaBottom: "-8px" },
  ]);
  await stepButtons.nth(4).click();
  await expect(stepButtons.nth(4)).toHaveAttribute("aria-current", "step");

  await page.screenshot({ path: testInfo.outputPath("surface-family-narrow-light.png"), fullPage: true });
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await page.screenshot({ path: testInfo.outputPath("surface-family-narrow-dark.png"), fullPage: true });
  await page.getByRole("button", { name: "Light", exact: true }).click();

  const confirmationTrigger = page.getByRole("button", { name: "Open confirmation" });
  await confirmationTrigger.click();
  const confirmation = page.getByRole("dialog", { name: "Keep this project?" });
  await expect(confirmation).toBeVisible();
  await expectInsideViewport(confirmation);
  const descriptionId = await confirmation.getAttribute("aria-describedby");
  expect(descriptionId).toBeTruthy();
  await expect(page.locator(`#${descriptionId}`)).toBeVisible();
  const cancel = confirmation.getByRole("button", { name: "Cancel" });
  const cancelSize = await cancel.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });
  await expectMinimumTarget(cancel);
  expect(cancelSize.width).toBeGreaterThan(0);
  expect(cancelSize.height).toBeGreaterThan(0);
  const confirmationScroll = await confirmation.evaluate((element) => element.scrollHeight - element.clientHeight);
  expect(confirmationScroll).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("surface-family-narrow-dialog-open.png"), fullPage: true });
  await cancel.click();
  await expect(confirmation).toBeHidden();
  await expect(confirmationTrigger).toBeFocused();

  await page.getByRole("button", { name: "Open detail modal" }).click();
  const modal = page.getByRole("dialog", { name: "Detailed project notes" });
  await expect(modal).toBeVisible();
  await expectInsideViewport(modal);
  const close = modal.getByRole("button", { name: "Close" });
  await expectRenderedSize(close, 32, 32);
  await page.screenshot({ path: testInfo.outputPath("surface-family-narrow-modal-open.png"), fullPage: true });
  await close.click();
  await expect(modal).toBeHidden();

  await page.getByRole("button", { name: "Open project dialog" }).click();
  const sharedDialog = page.getByRole("dialog", { name: "Project settings" });
  await expect(sharedDialog).toBeVisible();
  await expectInsideViewport(sharedDialog);
  const sharedClose = sharedDialog.getByRole("button", { name: "Close" });
  await expectMinimumTarget(sharedClose);
  await page.keyboard.press("Escape");
  await expect(sharedDialog).toBeHidden();

  const bottomSheetTrigger = page.getByRole("button", { name: "Open bottom sheet" });
  await bottomSheetTrigger.click();
  const bottomSheet = page.getByRole("dialog", { name: "Related project details" });
  await expect(bottomSheet).toBeVisible();
  await expectInsideViewport(bottomSheet);
  await expect(bottomSheet.locator("p")).toBeVisible();
  const sheetClose = bottomSheet.getByRole("button", { name: "Close sheet" });
  await expectRenderedSize(sheetClose, 32, 32);
  await page.keyboard.press("Escape");
  await expect(bottomSheet).toBeHidden();
  await expect(bottomSheetTrigger).toBeFocused();
});

test("Alert dismissal fires once, cleans up on unmount, and honors reduced motion", async ({ page }, testInfo) => {
  test.skip(!["desktop", "reduced-motion"].includes(testInfo.project.name), "Alert lifecycle runs on desktop and reduced-motion projects.");
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await openSurfaceFamily(page);

  const alert = page.getByRole("status").filter({ hasText: "Your draft is safe" });
  await expect(alert).toBeVisible();
  const dismiss = alert.getByRole("button", { name: "Dismiss" });
  await expect(dismiss).toHaveAttribute("data-size", "icon-xs");
  await expect(dismiss).toHaveClass(/ui-button-icon/);
  const bounds = await dismiss.boundingBox();
  expect(bounds?.width).toBe(32);
  expect(bounds?.height).toBe(32);

  if (testInfo.project.name === "reduced-motion") {
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await expect.poll(() => alert.evaluate((element) => getComputedStyle(element).transitionProperty)).toBe("none");
  }

  await dismiss.click();
  if (testInfo.project.name === "reduced-motion") {
    await page.clock.runFor(350);
    await expect(page.locator('section[aria-label="Feedback"] output')).toHaveText("Dismissed 1 times");
  } else {
    await expect(dismiss).toBeDisabled();
    await dismiss.evaluate((element) => (element as HTMLButtonElement).click());
    await page.getByRole("button", { name: "Unmount alert" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Your draft is safe" })).toHaveCount(0);
    await page.clock.runFor(350);
    await expect(page.locator('section[aria-label="Feedback"] output')).toHaveText("Dismissed 0 times");

    await page.getByRole("button", { name: "Mount alert" }).click();
    const remountedAlert = page.getByRole("status").filter({ hasText: "Your draft is safe" });
    await expect(remountedAlert).toBeVisible();
    await remountedAlert.getByRole("button", { name: "Dismiss" }).click();
    await page.clock.runFor(350);
    await expect(page.locator('section[aria-label="Feedback"] output')).toHaveText("Dismissed 1 times");
  }
});

test("video surfaces do not autoplay under reduced motion and keep explicit playback controls", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Video autoplay and controls run in the reduced-motion project.");
  await openSurfaceFamily(page);
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);

  const surfaces = page.locator('section[aria-label="Surfaces"]');
  await surfaces.getByRole("button", { name: "Show media card" }).click();
  const video = surfaces.locator("video");
  await expect(video).toBeVisible();
  expect(await video.evaluate((element) => (element as HTMLVideoElement).autoplay)).toBe(false);
  expect(await video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);

  const play = surfaces.getByRole("button", { name: "Play video" });
  const mute = surfaces.getByRole("button", { name: "Unmute" });
  for (const control of [play, mute]) {
    const bounds = await control.boundingBox();
    expect(bounds?.width).toBe(32);
    expect(bounds?.height).toBe(32);
  }

  // Media decoding is browser-dependent in CI; synthesize the native events so the component's
  // playback-state wiring is exercised without relying on codec support.
  await video.evaluate((element) => {
    const media = element as HTMLVideoElement;
    media.play = async () => { media.dispatchEvent(new Event("play")); };
    media.pause = () => { media.dispatchEvent(new Event("pause")); };
  });
  await play.click();
  const pause = surfaces.getByRole("button", { name: "Pause video" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(surfaces.getByRole("button", { name: "Play video" })).toBeVisible();

  await mute.click();
  await expect(surfaces.getByRole("button", { name: "Mute" })).toBeVisible();
});

test("BottomNav keeps closed menus inert and restores focus after skipping disabled actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "BottomNav mobile menu behavior runs on the touch-enabled phone project.");
  await openSurfaceFamily(page);
  await page.getByRole("button", { name: "Show bottom navigation" }).click();

  const nav = page.getByRole("navigation", { name: "Navigation" });
  const addMenu = page.locator('[role="menu"]').filter({ hasText: "New note" });
  const addMenuShell = addMenu.locator("xpath=..");
  await expect(addMenu).toHaveCount(1);
  const closedState = await addMenu.evaluate((menu) => ({
    ariaHidden: menu.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
    inert: menu.closest("[inert]")?.hasAttribute("inert") ?? false,
  }));
  expect(closedState).toEqual({ ariaHidden: "true", inert: true });

  const trigger = nav.getByRole("button", { name: "Add new" });
  await trigger.click();
  await expect(addMenuShell).toHaveAttribute("aria-hidden", "false");
  const newNote = addMenu.getByRole("menuitem", { name: "New note" });
  const disabledNote = addMenu.getByRole("menuitem", { name: "Unavailable note" });
  const newFolder = addMenu.getByRole("menuitem", { name: "New folder" });
  for (const item of [newNote, disabledNote, newFolder]) {
    await expect.poll(async () => Math.round((await item.boundingBox())?.width ?? 0)).toBeGreaterThanOrEqual(44);
    await expect.poll(async () => Math.round((await item.boundingBox())?.height ?? 0)).toBe(32);
  }
  await expect(newNote).toBeFocused();
  await expect(disabledNote).toBeDisabled();
  await page.keyboard.press("ArrowDown");
  await expect(newFolder).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(newNote).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(addMenuShell).toHaveAttribute("aria-hidden", "true");
  await expect(trigger).toBeFocused();
});
