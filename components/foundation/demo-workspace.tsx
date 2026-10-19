"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { createDemoWorkspace } from "@/lib/demo-workspace";
import { Workspace } from "./workspace";

function DemoSession({ onReset }: { onReset: () => void }) {
  const [demo] = useState(createDemoWorkspace);
  const { resolvedTheme, setTheme } = useTheme();
  useEffect(() => () => demo.dispose(), [demo]);
  return <Workspace workspace={{ id: "demo", name: "Demo workspace", role: "owner" }} initial={demo.initial} requestApi={demo.request} fileHref={demo.fileHref} notice={
    <aside className="demo-notice stack" aria-label="About this demo">
      <div><h2>Try it out. Make it yours.</h2><p className="muted">These are sample records and files. Create, search, archive, or restore a record. Changes stay in this page and reset when you leave or reload. Files are never uploaded.</p></div>
      <div className="demo-actions">
        <Button variant="secondary" onClick={onReset}>Reset demo</Button>
        <Button variant="secondary" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>Toggle theme</Button>
        <Button variant="ghost" asChild><Link href="/components/foundation">Explore components</Link></Button>
        <Button variant="ghost" asChild><Link href="/components/effects">Visual effects</Link></Button>
      </div>
    </aside>
  }/>;
}
export function DemoWorkspace() {
  const [version, setVersion] = useState(0);
  return <DemoSession key={version} onReset={() => setVersion(v => v + 1)}/>;
}
