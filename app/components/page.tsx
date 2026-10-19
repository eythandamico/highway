import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
export const metadata = {
  title: "Component examples",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="page reading">
      <h1>Component examples</h1>
      <p>
        <Link href="/components/foundation">
          Open the design foundation quality lab →
        </Link>
      </p>
      <p>
        <Link href="/components/effects">Open the visual effects guide →</Link>
      </p>
      <p className="muted">
        These are the same components used throughout the app. The full library
        lives in components/ui.
      </p>
      <section className="settings-section stack">
        <h2>Actions</h2>
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Button variant="ghost">Quiet action</Button>
        <Button disabled>Disabled action</Button>
      </section>
      <section className="settings-section stack">
        <h2>Fields</h2>
        <Label htmlFor="example">A visible label</Label>
        <Input id="example" placeholder="A useful hint" />
        <Badge variant="secondary">Status</Badge>
      </section>
      <section className="settings-section stack">
        <h2>Loading</h2>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </section>
    </div>
  );
}
