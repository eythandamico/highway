import type { ReactNode } from "react";
export function LiveStatus({ children }: { children?: ReactNode }) {
  return (
    <span
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </span>
  );
}
