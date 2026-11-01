"use client";
// Adapted from vault-frontend's token icon and transparent badge cutout.
import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export type TokenIconSize = "small" | "large" | "xl";
export interface TokenBadgeProps {
  label: string;
  children?: ReactNode;
  imageUrl?: string;
  size?: TokenIconSize;
  className?: string;
}
export interface TokenIconProps {
  token: { symbol?: string; name?: string; imageUrl?: string | null };
  network?: Omit<TokenBadgeProps, "size">;
  size?: TokenIconSize;
  className?: string;
  decorative?: boolean;
}

const MASKS = {
  xl: "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2040%2040%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M0%2C0h40v40h-40zM30%2C23h6a7%2C7%200%200%201%207%2C7v6a7%2C7%200%200%201%20-7%2C7h-6a7%2C7%200%200%201%20-7%2C-7v-6a7%2C7%200%200%201%207%2C-7z%22/%3E%3C/svg%3E')",
  large:
    "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M0%2C0h32v32h-32zM23%2C16h6a7%2C7%200%200%201%207%2C7v6a7%2C7%200%200%201%20-7%2C7h-6a7%2C7%200%200%201%20-7%2C-7v-6a7%2C7%200%200%201%207%2C-7z%22/%3E%3C/svg%3E')",
  small:
    "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M0%2C0h24v24h-24zM18%2C12h4a6%2C6%200%200%201%206%2C6v4a6%2C6%200%200%201%20-6%2C6h-4a6%2C6%200%200%201%20-6%2C-6v-4a6%2C6%200%200%201%206%2C-6z%22/%3E%3C/svg%3E')",
} as const;


function TokenArtwork({ imageUrl }: { imageUrl?: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (imageUrl && imageUrl !== failedUrl) return <img src={imageUrl} alt="" onError={() => setFailedUrl(imageUrl)} />;
  return (<svg data-token-fallback="" aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" fill="var(--token-fallback-surface)"/>
<path d="M9.33334 9.33337L22.6667 22.6667" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--token-fallback-stroke)"/>
<path d="M13.5667 9.79339C14.7738 9.32194 16.0921 9.21251 17.3604 9.47848C18.6287 9.74446 19.7919 10.3743 20.7079 11.291C21.6239 12.2077 22.2528 13.3714 22.5178 14.6399C22.7828 15.9084 22.6724 17.2267 22.2 18.4334" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--token-fallback-stroke)"/>
<path d="M20.72 20.72C20.1002 21.3398 19.3643 21.8315 18.5545 22.1669C17.7446 22.5024 16.8766 22.6751 16 22.6751C15.1234 22.6751 14.2554 22.5024 13.4456 22.1669C12.6357 21.8315 11.8998 21.3398 11.28 20.72C10.6602 20.1001 10.1685 19.3643 9.83303 18.5544C9.49758 17.7446 9.32492 16.8766 9.32492 16C9.32492 15.1234 9.49758 14.2554 9.83303 13.4455C10.1685 12.6357 10.6602 11.8998 11.28 11.28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--token-fallback-stroke)"/>
</svg>);
}

/** A network mark, also used by TokenIcon's attached badge. */
export function TokenBadge({ label, children, imageUrl, size = "large", className }: TokenBadgeProps) {
  return <span className={cn("hw-token-badge", className)} data-size={size} role="img" aria-label={label} title={label}>
    {children ?? <TokenArtwork imageUrl={imageUrl} />}
  </span>;
}

/** Token artwork with a true transparent cutout around an optional network badge. */
export function TokenIcon({ token, network, size = "large", className, decorative = false }: TokenIconProps) {
  const label = token.name || token.symbol || "Token";
  const description = network ? `${label} on ${network.label}` : label;
  const mask: CSSProperties | undefined = network ? { maskImage: MASKS[size], WebkitMaskImage: MASKS[size], maskSize: "100% 100%", WebkitMaskSize: "100% 100%" } : undefined;
  return <span className={cn("hw-token-icon", className)} data-size={size} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : description} aria-hidden={decorative || undefined} title={description}>
    <span className="hw-token-artwork" style={mask}><TokenArtwork imageUrl={token.imageUrl} /></span>
    {network && <span className="hw-token-attached" aria-hidden="true"><TokenBadge {...network} size={size} /></span>}
  </span>;
}
