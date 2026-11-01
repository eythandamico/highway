import type { ReactNode } from "react";
/** Fixed reserve labels prevent layout movement; unreserved content uses natural layout. */
export function ContentTransition({
  children,
  reserve = [],
  animate = false,
}: {
  children: ReactNode;
  reserve?: string[];
  animate?: boolean;
}) {
  return (
    <span className="hw-content-slot">
      {reserve.map((label) => (
        <span key={label} aria-hidden="true" className="hw-content-reserve">
          {label}
        </span>
      ))}
      <span
        key={typeof children === "string" ? children : "content"}
        className={
          animate
            ? "hw-content-current hw-content-animate"
            : "hw-content-current"
        }
      >
        {children}
      </span>
    </span>
  );
}
