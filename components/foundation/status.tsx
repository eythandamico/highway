import type { ReactNode } from "react";
export type StatusTone = "neutral" | "good" | "warning" | "bad" | "info";
/** Text always names the status; color is a supporting cue, never its only meaning. */
export function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span className="ui-status" data-tone={tone}>
      {typeof children === "string" ? children.replace(/^(in-progress|needs-review|not-started)$/, value => value.replace(/-/g, " ")).replace(/^\p{L}/u, letter => letter.toLocaleUpperCase("en-CA")) : children}
    </span>
  );
}
