import { expect, test, type Page } from "@playwright/test";

async function openConsumer(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /The same components/ })).toBeVisible();
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

test("installed default button matches the source showcase appearance", async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The source/consumer appearance comparison runs once on desktop.");
  await openConsumer(page);
  const packageButton = page.getByTestId("package-button");

  const sourcePage = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  try {
    await sourcePage.goto("http://localhost:5190/showcase?component=button");
    await expect(sourcePage.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
    const sourceRoot = sourcePage.locator("html");
    if (await sourceRoot.evaluate((element) => element.classList.contains("dark"))) {
      await sourcePage.getByRole("button", { name: "Toggle light and dark theme" }).click();
    }
    const sourceButton = sourcePage.getByRole("button", { name: "Add something good" });
    await expect(sourceButton).toBeVisible();

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
    const [sourceStyle, packageStyle] = await Promise.all([
      sourceButton.evaluate(read, properties),
      packageButton.evaluate(read, properties),
    ]);
    expect(packageStyle).toEqual(sourceStyle);

    await sourcePage.goto("http://localhost:5190/showcase?component=card");
    await expect(sourcePage.getByRole("heading", { name: "Glass surface", exact: true })).toBeVisible();
    const sourceCard = sourcePage.locator('.library-preview [data-slot="card"]');
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
    const [sourceMaterial, packageMaterial] = await Promise.all([
      sourceCard.evaluate(read, materialProperties),
      packageCard.evaluate(read, materialProperties),
    ]);
    expect(packageMaterial).toEqual(sourceMaterial);
  } finally {
    await sourcePage.close();
  }
});

test("dark branding reaches portaled FormDialog and failed pending saves retain drafts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Dialog and save state checks run once on desktop.");
  await openConsumer(page);
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
  await expect(failedDialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await expect(failedDialog.getByRole("alert")).toContainText("Example save failed");
  await expect(draft).toHaveValue("Retained draft");

  await failedDialog.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("switch", { name: "Simulate failure" }).click();
  await page.getByRole("button", { name: "Edit project" }).click();
  const retryDialog = page.getByRole("dialog", { name: "Edit project" });
  await retryDialog.getByRole("textbox", { name: "Project name" }).fill("Retained draft");
  await retryDialog.getByRole("button", { name: "Save project" }).click();
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

test("phone layout stays within the viewport and keeps composer text readable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone", "Responsive package checks run on the phone project.");
  await openConsumer(page);
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  const input = page.getByRole("textbox", { name: "Ask anything" });
  await expect(input).toBeVisible();
  const fontSize = await input.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(16);
});

test("reduced motion removes component transitions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "reduced-motion", "Reduced-motion package check runs on its dedicated project.");
  await openConsumer(page);
  await expect(page.getByTestId("package-button")).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".fx-progressive")).toHaveAttribute("data-edge", "bottom");
});
