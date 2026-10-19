import type { ComponentProps, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native disclosure preserves browser keyboard and controlled-open behavior. */
export function Disclosure({ summary, children, className, ...props }: Omit<ComponentProps<"details">, "children"> & { summary: ReactNode; children: ReactNode }) {
  return <details data-slot="disclosure" className={cn("ui-disclosure", className)} {...props}>
    <summary><span>{summary}</span><ChevronRight size={16} aria-hidden="true" /></summary>
    {children}
  </details>;
}
