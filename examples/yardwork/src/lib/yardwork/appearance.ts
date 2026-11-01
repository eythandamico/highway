import { z } from "zod/v3";

export type AppearanceSettings = {
  mode: "brand" | "season" | "colour";
  brandPrimary: string;
  brandAccent: string;
  colour: string;
  season: "auto" | "spring" | "summer" | "autumn" | "winter";
};
export type Season = Exclude<AppearanceSettings["season"], "auto">;
export const defaultAppearance: AppearanceSettings = Object.freeze({
  mode: "brand",
  brandPrimary: "#376b50",
  brandAccent: "#d9ee8a",
  colour: "#376b50",
  season: "auto",
});
const fullHex = (value: string) =>
  value.length === 4
    ? "#" +
      [...value.slice(1)]
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    : value.toLowerCase();
const hexColour = z
  .string()
  .trim()
  .regex(/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i, "Use a hex colour such as #376b50.")
  .transform(fullHex);
export const appearanceSchema = z
  .object({
    mode: z.enum(["brand", "season", "colour"]).default(defaultAppearance.mode),
    brandPrimary: hexColour.default(defaultAppearance.brandPrimary),
    brandAccent: hexColour.default(defaultAppearance.brandAccent),
    colour: hexColour.default(defaultAppearance.colour),
    season: z
      .enum(["auto", "spring", "summer", "autumn", "winter"])
      .default(defaultAppearance.season),
  })
  .strict();

/** Old workspaces and partially saved settings retain valid fields and receive safe defaults. */
export function normalizeAppearance(value: unknown): AppearanceSettings {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { ...defaultAppearance };
  const candidate = value as Record<string, unknown>;
  const result = { ...defaultAppearance };
  const mode = appearanceSchema.shape.mode.safeParse(candidate.mode);
  const season = appearanceSchema.shape.season.safeParse(candidate.season);
  if (mode.success) result.mode = mode.data;
  if (season.success) result.season = season.data;
  for (const key of ["brandPrimary", "brandAccent", "colour"] as const) {
    const parsed = hexColour.safeParse(candidate[key]);
    if (parsed.success) result[key] = parsed.data;
  }
  return result;
}

/** Northern meteorological seasons, aligned with the app's Toronto schedule. */
export function currentSeason(date = new Date()): Season {
  const validDate = Number.isFinite(date.getTime()) ? date : new Date();
  const month = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      month: "numeric",
    }).format(validDate),
  );
  return month >= 3 && month <= 5
    ? "spring"
    : month >= 6 && month <= 8
      ? "summer"
      : month >= 9 && month <= 11
        ? "autumn"
        : "winter";
}
export const seasonPalettes: Record<
  Season,
  { name: string; primary: string; accent: string }
> = {
  spring: { name: "Spring", primary: "#47764a", accent: "#d6eaa9" },
  summer: { name: "Summer", primary: "#126e75", accent: "#caeae1" },
  autumn: { name: "Autumn", primary: "#985437", accent: "#efcf9c" },
  winter: { name: "Winter", primary: "#3d6486", accent: "#d7e6f1" },
};
type RGB = [number, number, number];
type HSL = [number, number, number];
const rgb = (hex: string): RGB =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB;
const byteHex = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, "0");
const rgbHex = (value: RGB) =>
  "#" + value.map((channel) => byteHex(channel * 255)).join("");
const tint = (value: string) =>
  rgbHex(rgb(value).map((channel) => channel * 0.22 + 0.78) as RGB);
export function resolvedAppearance(
  value: unknown,
  date = new Date(),
): { name: string; primary: string; accent: string; season?: Season } {
  const settings = normalizeAppearance(value);
  if (settings.mode === "season") {
    const season =
      settings.season === "auto" ? currentSeason(date) : settings.season;
    return { ...seasonPalettes[season], season };
  }
  if (settings.mode === "colour")
    return {
      name: "Custom colour",
      primary: settings.colour,
      accent: tint(settings.colour),
    };
  return {
    name: "Brand colours",
    primary: settings.brandPrimary,
    accent: settings.brandAccent,
  };
}
export const resolveAppearance = resolvedAppearance;

function hsl([r, g, b]: RGB): HSL {
  const maximum = Math.max(r, g, b),
    minimum = Math.min(r, g, b),
    difference = maximum - minimum;
  const lightness = (maximum + minimum) / 2;
  if (!difference) return [0, 0, lightness];
  const saturation = difference / (1 - Math.abs(2 * lightness - 1));
  const hue =
    maximum === r
      ? ((g - b) / difference) % 6
      : maximum === g
        ? (b - r) / difference + 2
        : (r - g) / difference + 4;
  return [(hue * 60 + 360) % 360, saturation, lightness];
}
function hslRgb([hue, saturation, lightness]: HSL): RGB {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const offset = lightness - chroma / 2;
  const base: RGB =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return base.map((channel) => channel + offset) as RGB;
}
const linear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const luminance = (channels: RGB) =>
  channels
    .map(linear)
    .reduce(
      (sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i],
      0,
    );

// Pick the nearest 8-bit colour with the original luminance, avoiding a contrast
// regression caused solely by rounding an otherwise equivalent shade.
function quantize(channels: RGB, target: number): RGB {
  const base = channels.map((channel) => Math.round(channel * 255)) as RGB;
  let best = base,
    error = Infinity;
  for (let red = -1; red <= 1; red++)
    for (let green = -1; green <= 1; green++)
      for (let blue = -1; blue <= 1; blue++) {
        const candidate = [
          base[0] + red,
          base[1] + green,
          base[2] + blue,
        ] as RGB;
        if (candidate.some((value) => value < 0 || value > 255)) continue;
        const difference =
          Math.abs(
            luminance(candidate.map((value) => value / 255) as RGB) - target,
          ) +
          (Math.abs(red) + Math.abs(green) + Math.abs(blue)) * 1e-8;
        if (difference < error) {
          best = candidate;
          error = difference;
        }
      }
  return best.map((channel) => channel / 255) as RGB;
}

/**
 * Recolour a CSS token already selected by the theme registry. Hue/saturation
 * carry the chosen identity; the original relative luminance preserves the
 * existing foreground/background contrast and soft surface hierarchy. Neutral
 * and semantic colour selection remains the CSS registry's responsibility.
 * sRGB transfer and HSL conversions follow https://www.w3.org/TR/css-color-4/.
 */
export function recolour(
  originalHex: string,
  value: unknown,
  date = new Date(),
): string {
  const settings = normalizeAppearance(value);
  if (
    settings.mode === "brand" &&
    settings.brandPrimary === defaultAppearance.brandPrimary &&
    settings.brandAccent === defaultAppearance.brandAccent
  )
    return originalHex;
  if (!/^#(?:[a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i.test(originalHex))
    return originalHex;
  const expanded =
    originalHex.length <= 5
      ? "#" + [...originalHex.slice(1)].map((c) => c + c).join("")
      : originalHex;
  const alpha = expanded.slice(7);
  const source = rgb(expanded),
    [sourceHue, sourceSaturation, sourceLightness] = hsl(source);
  const palette = resolvedAppearance(settings, date);
  const accent = sourceHue >= 55 && sourceHue <= 108 && sourceLightness >= 0.48;
  if (
    settings.mode === "brand" &&
    (accent
      ? settings.brandAccent === defaultAppearance.brandAccent
      : settings.brandPrimary === defaultAppearance.brandPrimary)
  )
    return originalHex;
  const [hue, selectedSaturation] = hsl(
    rgb(accent ? palette.accent : palette.primary),
  );
  // Restrict saturation to keep arbitrary vivid inputs from turning every pale
  // surface fluorescent. Black and white inputs deliberately create greys.
  const saturation =
    selectedSaturation < 0.01
      ? 0
      : Math.min(
          accent ? 0.82 : 0.72,
          sourceSaturation *
            Math.min(1.7, selectedSaturation / (accent ? 0.6 : 0.32)),
        );
  const target = luminance(source);
  let low = 0,
    high = 1;
  for (let iteration = 0; iteration < 28; iteration++) {
    const midpoint = (low + high) / 2;
    if (luminance(hslRgb([hue, saturation, midpoint])) < target) low = midpoint;
    else high = midpoint;
  }
  return (
    rgbHex(quantize(hslRgb([hue, saturation, (low + high) / 2]), target)) +
    alpha
  );
}
