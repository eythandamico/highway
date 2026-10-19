import type { CSSProperties } from "react";
export const DEFAULT_ACCENT = "#d9ee8a";
const normalized = (value: unknown): string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : DEFAULT_ACCENT;
const luminance = (hex: string) => [1, 3, 5].reduce((sum, offset, index) => {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return sum + [0.2126, 0.7152, 0.0722][index] * (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
}, 0);
/** Accept only opaque six-digit hex colors; preserve 4.5:1 on-accent text. */
export function onAccent(value: unknown) {
  const lightness = luminance(normalized(value));
  const forest = "#123c31";
  if ((lightness + 0.05) / (luminance(forest) + 0.05) >= 4.5) return forest;
  return lightness > 0.179 ? "#000000" : "#ffffff";
}
/** Visual brand overrides only. Never changes semantic status/focus colors or authorization. */
export function appearanceStyle(value: unknown): CSSProperties {
  const accent = normalized(value);
  return {
    "--primary": accent,
    "--primary-foreground": onAccent(accent),
    "--primary-hover": "color-mix(in oklch, var(--primary) 90%, var(--primary-foreground))",
    "--primary-active": "color-mix(in oklch, var(--primary) 82%, var(--primary-foreground))",
  } as CSSProperties;
}
