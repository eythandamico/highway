import { z } from "zod/v3";

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const photoIdSchema = z.string().uuid();
export const chatPhotoSchema = z
  .object({
    id: photoIdSchema,
    name: z.string().trim().min(1).max(180),
    size: z.number().int().positive().max(MAX_PHOTO_BYTES),
    width: z.number().int().positive().max(1600),
    height: z.number().int().positive().max(1600),
  })
  .strict();
export type ChatPhoto = z.infer<typeof chatPhotoSchema>;
export const askSchema = z
  .object({
    id: photoIdSchema,
    text: z.string().trim().max(4000),
    image: chatPhotoSchema.optional(),
  })
  .strict()
  .refine((p) => p.text.length > 0 || !!p.image, "Add a message or a photo.");

// Only browser-reencoded JPEGs are accepted; SVG and arbitrary file bodies never render.
export function jpegDimensions(bytes: Uint8Array) {
  if (
    bytes.length < 12 ||
    bytes.length > MAX_PHOTO_BYTES ||
    bytes[0] !== 255 ||
    bytes[1] !== 216 ||
    bytes.at(-2) !== 255 ||
    bytes.at(-1) !== 217
  )
    throw new Error("Choose a valid photo.");
  let offset = 2,
    dimensions: { width: number; height: number } | undefined;
  while (offset + 4 < bytes.length) {
    if (bytes[offset++] !== 255) break;
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 217) break;
    if ([225, 237, 254].includes(marker))
      throw new Error("Reattach this photo to remove embedded metadata.");
    if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
    const length = bytes[offset] * 256 + bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) break;
    if (marker === 218) {
      if (dimensions && length >= 6) return dimensions;
      break;
    }
    if (
      [
        192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
      ].includes(marker)
    ) {
      if (length < 8) break;
      const height = bytes[offset + 3] * 256 + bytes[offset + 4],
        width = bytes[offset + 5] * 256 + bytes[offset + 6];
      if (!width || !height || width > 1600 || height > 1600)
        throw new Error("Photo must be at most 1600 pixels on each side.");
      dimensions = { width, height };
    }
    offset += length;
  }
  throw new Error("Choose a valid photo.");
}
