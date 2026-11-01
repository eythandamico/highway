import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface BreadcrumbItem { label: ReactNode; href?: string }
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  label?: string;
  className?: string;
  renderLink?: (item: BreadcrumbItem) => ReactNode;
}
/** Ancestor links followed by the current page; long paths wrap naturally. */
export function Breadcrumbs({ items, label = "Breadcrumb", className, renderLink }: BreadcrumbsProps) {
  return <nav aria-label={label} className={cn("hw-breadcrumbs", className)}><ol>
    {items.map((item, index) => <li key={index}>
      {index > 0 && <ChevronRight aria-hidden="true" />}
      {index === items.length - 1 ? <span aria-current="page">{item.label}</span> : item.href ? (renderLink ? renderLink(item) : <a href={item.href}>{item.label}</a>) : <span>{item.label}</span>}
    </li>)}
  </ol></nav>;
}
