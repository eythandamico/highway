import type { ReactNode } from "react";
import { AlertCircle, Info, LoaderCircle } from "lucide-react";
export function Feedback({
  children,
  action,
  tone = "error",
}: {
  children: ReactNode;
  action?: ReactNode;
  tone?: "error" | "info";
}) {
  const Icon = tone === "error" ? AlertCircle : Info;
  return (
    <div
      className="ui-feedback"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" size={20} />
      <div>{children}</div>
      {action}
    </div>
  );
}
export function LoadingState({
  children = "Loading…",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="ui-loading" role="status">
      <LoaderCircle aria-hidden="true" className="ui-spinner" size={20} />
      <span>{children}</span>
    </div>
  );
}
