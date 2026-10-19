import type { ReactNode } from "react";

/** Both icons stay mounted so a rapid state change can reverse the transition. */
export function StateIcon({ active, inactiveIcon, activeIcon, size = 16 }: {
  active: boolean;
  inactiveIcon: ReactNode;
  activeIcon: ReactNode;
  size?: number;
}) {
  return <span className="state-icon" aria-hidden="true" style={{ width: size, height: size }}>
    <span data-visible={!active}>{inactiveIcon}</span>
    <span data-visible={active}>{activeIcon}</span>
  </span>;
}
