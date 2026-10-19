import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/** Information is quiet; errors announce themselves. Callers can opt into status updates. */
export function Notice({ children, className, tone = "info", role, ...props }: ComponentProps<"div"> & { tone?: "info" | "error" }) {
  return <Alert {...props} role={role ?? (tone === "error" ? "alert" : undefined)} variant={tone === "error" ? "destructive" : "default"}
    className={cn("app-notice", className)} data-tone={tone}>
    <AlertDescription className="app-notice-content">{children}</AlertDescription>
  </Alert>;
}
