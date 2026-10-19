/**
 * Deterministic wallet identity parameters: an aurora color pair. The
 * address hashes to a primary hue and a companion hue from a curated
 * twelve-hue aurora palette (ordered, always different), a tone, and a
 * lighting angle. 12 x 11 ordered pairs x 2 tones x 4 angles = 1056
 * cells, all carried by color, the way Jazzicon and Blockies derive a
 * wallet's look from its address, but on the app's own palette.
 *
 * ── FROZEN COVENANT ─────────────────────────────────────────────────
 * These tables and the extraction order are FROZEN. Any edit re-rolls
 * every user's memorized wallet identities ("my violet and teal one").
 * The snapshot test locks them; do not "clean this up".
 * ────────────────────────────────────────────────────────────────────
 *
 * Hue bands are excluded so an identity can never read as product
 * semantics (tracks simple-tokens.css; move together if those hues
 * ever move): 130-175 brand green (buy/gains), 15-40 red (losses),
 * 80-105 gold (watchlist). Chroma stays under the CTA green's 0.194,
 * so identities sit under the semantic color layer.
 */

/** Public-domain cyrb53 avalanche hash — one-hop address changes
 * scramble every parameter. */
function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** The aurora palette: amber, then the cool half of the wheel from teal
 * through rose in 15-degree steps. */
export const WALLET_IDENTITY_HUES = [
  55, 180, 195, 210, 225, 240, 255, 270, 285, 300, 320, 340,
] as const;

const ANGLES = [0, 90, 180, 270] as const;

type WalletIdentityParams = {
  hue: number;
  /** Always a different palette hue from `hue`. */
  companionHue: number;
  /** 0 = bright blooms, 1 = deep blooms. */
  tone: 0 | 1;
  angleDeg: (typeof ANGLES)[number];
  /** Stable per-address SVG gradient id. */
  gradientId: string;
};

const cache = new Map<string, WalletIdentityParams>();

export function walletIdentityParams(address: string): WalletIdentityParams {
  const key = address.toLowerCase();
  const cached = cache.get(key);
  if (cached) return cached;

  const h = cyrb53(key);
  const primary = h % 12;
  // The companion skips the primary's slot so the pair is always two
  // distinct hues.
  const companionStep = 1 + (Math.floor(h / 12) % 11);
  const companion = (primary + companionStep) % 12;
  const angleDeg = ANGLES[Math.floor(h / 132) % 4];
  const tone = (Math.floor(h / 528) % 2) as 0 | 1;
  const params: WalletIdentityParams = {
    hue: WALLET_IDENTITY_HUES[primary],
    companionHue: WALLET_IDENTITY_HUES[companion],
    tone,
    angleDeg,
    gradientId: `sa-${h.toString(36)}`,
  };
  // Bound feed memory without changing the deterministic identity.
  if (cache.size >= 1024) cache.delete(cache.keys().next().value!);
  cache.set(key, params);
  return params;
}
