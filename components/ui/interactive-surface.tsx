import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** A keyboard-operable content surface (preview, choice card, or list row).
 * Use Button for actions. The composed content owns the surface's layout.
 */
export function InteractiveSurface({ className, type = "button", ...props }: ComponentProps<"button">) {
  return <button type={type} data-slot="interactive-surface" className={cn("interactive-surface", className)} {...props} />;
}
