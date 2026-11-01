import { expect, test, type Page } from "@playwright/test";
import { openDirectPreview } from "./preview-routes";

async function openInvariantPreview(page: Page, component: string) {
  return openDirectPreview(page, component);
}

test("Invariant menu keeps its original 180px minimum inside a narrow host", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Original menu geometry is checked once on desktop.");
  const preview = await openInvariantPreview(page, "menu");

  const menu = preview.getByRole("menu", { name: "Actions" });
  await expect(menu).toBeVisible();
  await menu.evaluate((element) => {
    if (!element.parentElement) throw new Error("Menu preview has no host container");
    element.parentElement.style.width = "96px";
  });

  await expect.poll(() => menu.evaluate((element) => element.getBoundingClientRect().width)).toBe(180);
});

test("StepIndicator preserves the original compact bar geometry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Step indicator geometry is checked once on desktop.");
  const preview = await openInvariantPreview(page, "step-indicator");

  const bars = preview.locator(".hw-step-target > div");
  await expect(bars).toHaveCount(5);
  await expect(bars.first()).toBeVisible();
  const geometry = await bars.evaluateAll((elements) => {
    const firstLeft = elements[0].getBoundingClientRect().left;
    return elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        offset: Math.round(rect.left - firstLeft),
      };
    });
  });

  expect(geometry).toEqual([
    { width: 36, offset: 0 },
    { width: 10, offset: 44 },
    { width: 10, offset: 62 },
    { width: 10, offset: 80 },
    { width: 10, offset: 98 },
  ]);
});

test("Invariant semibold emphasis survives complete typography roles", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Typography role interaction is checked once on desktop.");

  const messagePreview = await openInvariantPreview(page, "message-bubble");
  await messagePreview.getByRole("button", { name: "Thinking", exact: true }).click();
  const thinkingLabel = messagePreview.getByText("Thinking...", { exact: true });
  await expect(thinkingLabel).toBeVisible();
  await expect(thinkingLabel).toHaveCSS("font-weight", "600");

  const startupPreview = await openInvariantPreview(page, "startup");
  const workspaceName = startupPreview.locator(".highway-type-body.highway-weight-semibold").first();
  await expect(workspaceName).toBeVisible();
  await expect(workspaceName).toHaveCSS("font-weight", "600");

  const profilePreview = await openInvariantPreview(page, "profile");
  await profilePreview.getByRole("button", { name: "Profile menu" }).click();
  const profileName = page.locator('.hw-menu .highway-type-body.highway-weight-semibold').first();
  await expect(profileName).toBeVisible();
  await expect(profileName).toHaveCSS("font-weight", "600");
});
