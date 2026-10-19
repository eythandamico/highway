"use client";

// Adapted read-only from vault-frontend SimpleAvatar; identity algorithm retained.
import { type ReactElement, useId } from "react";
import { cn } from "@/lib/utils";
import { walletAuroraPaint } from "./walletAurora";
import { walletIdentityParams } from "./walletIdentity";

/** Shotcall aurora geometry with Yardwork’s mineral-spectrum colors. AccountAvatar handles uploaded-photo precedence
 * and failure recovery through the shared avatar primitive. */

export function GeneratedAccountAvatar({
  address,
  size,
  className,
}: {
  address: string;
  size: number;
  className?: string;
}): ReactElement {
  // Per-INSTANCE gradient id. The address-derived id alone collides
  // when the same wallet renders in several places — url(#id) resolves
  // to the first def in DOM order, and if that copy sits in a
  // display:none subtree (the hidden desktop nav on mobile) the
  // gradient never paints and the disc goes black. Same failure mode
  // as the SolanaSvg duplicate-id bug.
  const uid = useId();
  const p = walletIdentityParams(address);
  const paint = walletAuroraPaint(p);
  const id = (part: string) => `${p.gradientId}-${uid}-${part}`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    >
      <defs>
        <clipPath id={id("clip")}>
          <circle cx="12" cy="12" r="12" />
        </clipPath>
        <linearGradient id={id("wash")} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={paint.washTop} />
          <stop offset="1" stopColor={paint.washBottom} />
        </linearGradient>
        <radialGradient
          id={id("bloom")}
          gradientUnits="userSpaceOnUse"
          cx={paint.bloomAt.cx}
          cy={paint.bloomAt.cy}
          r="24"
        >
          <stop offset="0" stopColor={paint.bloom} />
          <stop offset="0.7" stopColor={paint.bloom} stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={id("companion")}
          gradientUnits="userSpaceOnUse"
          cx={paint.companionAt.cx}
          cy={paint.companionAt.cy}
          r="20"
        >
          <stop offset="0" stopColor={paint.companion} />
          <stop offset="0.68" stopColor={paint.companion} stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={id("crown")}
          gradientUnits="userSpaceOnUse"
          cx="8"
          cy="3"
          r="13"
        >
          <stop offset="0" stopColor="var(--artwork-highlight)" stopOpacity="0.26" />
          <stop offset="1" stopColor="var(--artwork-highlight)" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={id("foot")}
          gradientUnits="userSpaceOnUse"
          cx="12"
          cy="26"
          r="15"
        >
          <stop offset="0" stopColor="var(--artwork-shade)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--artwork-shade)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id("clip")})`}>
        <rect width="24" height="24" fill={`url(#${id("wash")})`} />
        <rect width="24" height="24" fill={`url(#${id("bloom")})`} />
        <rect width="24" height="24" fill={`url(#${id("companion")})`} />
        <rect width="24" height="24" fill={`url(#${id("crown")})`} />
        <rect width="24" height="24" fill={`url(#${id("foot")})`} />
      </g>
    </svg>
  );
}
