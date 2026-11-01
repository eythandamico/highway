import type { CSSProperties } from "react";
import { recolour, resolvedAppearance } from "./appearance.ts";

const luminance = (hex: string) => {
  const channels = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  return channels.reduce(
    (sum, value, i) =>
      sum +
      [0.2126, 0.7152, 0.0722][i] *
        (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4),
    0,
  );
};
/** Choose a readable on-accent color even for a user-supplied brand color. */
export function onAccent(accent: string) {
  const lightness = luminance(accent);
  const forest = "#123c31";
  if ((lightness + 0.05) / (luminance(forest) + 0.05) >= 4.5) return forest;
  return lightness > 0.179 ? "#000000" : "#ffffff";
}
export function appearanceStyle(value: unknown): CSSProperties {
  const { accent } = resolvedAppearance(value);
  return {
    "--primary": accent,
    "--primary-foreground": onAccent(accent),
    "--primary-hover":
      "color-mix(in oklch, var(--primary) 90%, var(--primary-foreground))",
    "--primary-active":
      "color-mix(in oklch, var(--primary) 82%, var(--primary-foreground))",
    "--yw-accent": accent,
    "--yw-accent-foreground": onAccent(accent),
    "--yw-green": recolour("#376b50", value),
    "--yw-dark-green": recolour("#9dceb1", value),
  } as CSSProperties;
}
