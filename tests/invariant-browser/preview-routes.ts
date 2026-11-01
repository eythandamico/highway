import { readFileSync } from "node:fs";
import { expect, type Locator, type Page } from "@playwright/test";

export type InvariantPreviewMetadata = { id: string; previewId: string };

export const invariantPreviews = JSON.parse(
  readFileSync(new URL("../../apps/showcase/previews/metadata.json", import.meta.url), "utf8"),
) as InvariantPreviewMetadata[];

export function showcaseIdForPreviewId(previewId: string) {
  const entry = invariantPreviews.find((candidate) => candidate.previewId === previewId);
  if (!entry) throw new Error(`No showcase route is registered for Invariant preview ${previewId}`);
  return entry.id;
}

export function directPreviewPath(previewId: string) {
  return `/showcase?component=${encodeURIComponent(showcaseIdForPreviewId(previewId))}&preview=1`;
}

export async function openDirectPreview(page: Page, previewId: string, origin?: string): Promise<Locator> {
  const path = directPreviewPath(previewId);
  await page.goto(origin ? new URL(path, origin).toString() : path);
  const preview = page.locator(".library-standalone-preview .highway-preview");
  await expect(preview).toBeVisible();
  await expect(preview.locator(":scope > *")).not.toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0);
  return preview;
}
