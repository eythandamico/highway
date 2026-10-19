/** Yardwork's soft mineral spectrum: warmer lights, clear midtones and enough
 * chroma to distinguish identities without competing with lime actions.
 * Identity hashes, pairings and lighting directions remain deterministic. */
const PROFILE_HUES: Record<number, number> = {
  55: 95,   // butter yellow
  180: 140, // fresh sage
  195: 175, // sea glass
  210: 205, // turquoise
  225: 235, // cornflower
  240: 260, // iris blue
  255: 285, // lavender
  270: 310, // orchid
  285: 335, // rose
  300: 15,  // coral
  320: 45,  // apricot
  340: 70,  // soft gold
};
type WalletAuroraPaint = {
  washTop: string;
  washBottom: string;
  bloom: string;
  companion: string;
  /** Bloom origin in the 24-box (off-canvas, per angle). */
  bloomAt: { cx: number; cy: number };
  /** Companion origin, one edge clockwise from the bloom. */
  companionAt: { cx: number; cy: number };
};

const BLOOM_ORIGIN: Record<number, { cx: number; cy: number }> = {
  0: { cx: 12, cy: 27 },
  90: { cx: -3, cy: 12 },
  180: { cx: 12, cy: -3 },
  270: { cx: 27, cy: 12 },
};

const COMPANION_ORIGIN: Record<number, { cx: number; cy: number }> = {
  0: { cx: 26, cy: 4 },
  90: { cx: 20, cy: -2 },
  180: { cx: -2, cy: 20 },
  270: { cx: 4, cy: 26 },
};

export function walletAuroraPaint({
  hue,
  companionHue,
  tone,
  angleDeg,
}: {
  hue: number;
  companionHue: number;
  tone: 0 | 1;
  angleDeg: number;
}): WalletAuroraPaint {
  const bright = tone === 0;
  const primary = PROFILE_HUES[hue] ?? hue;
  const secondary = PROFILE_HUES[companionHue] ?? companionHue;
  return {
    washTop: `oklch(${bright ? 0.76 : 0.70} 0.09 ${primary})`,
    washBottom: `oklch(${bright ? 0.62 : 0.56} 0.07 ${primary})`,
    bloom: `oklch(${bright ? 0.91 : 0.85} 0.095 ${primary})`,
    companion: `oklch(${bright ? 0.86 : 0.80} 0.09 ${secondary})`,
    bloomAt: BLOOM_ORIGIN[angleDeg] ?? BLOOM_ORIGIN[0],
    companionAt: COMPANION_ORIGIN[angleDeg] ?? COMPANION_ORIGIN[0],
  };
}
