import { Breadcrumbs } from "../../../packages/highway-react/src/components/ui/breadcrumbs";
import { useExampleState } from "./example-state";
export function BreadcrumbsPreview() {
  const [depth] = useExampleState("depth", 2);
  const items = depth === 3 ? [{ label: "Components", href: "/showcase" }, { label: "Breadcrumbs", href: "/showcase?component=breadcrumbs" }, { label: "Current page" }] : [{ label: "Components", href: "/showcase" }, { label: "Breadcrumbs" }];
  return <div className="library-preview-row"><Breadcrumbs items={items}/></div>;
}
