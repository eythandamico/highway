"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ComponentPreview } from "./component-preview";
import { Tabs } from "../../../packages/highway-react/src/components/tabs";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { LibraryShell } from "./library-shell";
import { familyEntries } from "./component-directory-data";
import "./component-grid.css";

const catalogue = familyEntries;
const sectionTabs = [
  { id: "components", label: "Components", count: catalogue.length },
  { id: "blocks", label: "Blocks" },
  { id: "pages", label: "Pages" },
];
type Entry = typeof catalogue[number];

function ComponentTile({ entry }: { entry: Entry }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([item]) => setVisible(item.isIntersecting), { rootMargin: "160px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <article className="component-tile" ref={ref}>
    <div className="component-tile-preview" inert aria-hidden="true">
      {visible && <div className="component-tile-stage" data-preview={entry.id}><ComponentPreview entry={entry} gallery/></div>}
    </div>
    <div className="component-tile-caption">
      <h2><Link href={`/showcase?component=${entry.id}`}>{entry.name.split(",")[0]}</Link></h2>
      <p>{entry.description}</p>
    </div>
  </article>;
}

export function ComponentGrid({ embedded = false }: { embedded?: boolean }) {
  const [section, setSection] = useState("components");
  const content = <div className="component-directory">
    <header className="component-directory-heading"><div><h1>Components</h1><p>Explore Highway’s components. Open any preview for usage, examples, and API details.</p></div><Button asChild variant="ghost"><Link href="/guide">Get started <ArrowUpRight aria-hidden="true"/></Link></Button></header>
    <div className="component-directory-tabs-scroll"><Tabs className="component-directory-tabs" tabs={sectionTabs} activeTab={section} onTabChange={setSection}/></div>
    {section === "components" ? <div className="component-directory-grid">{catalogue.map(entry => <ComponentTile key={entry.id} entry={entry}/>)}</div> : <div className="component-directory-empty" role="status"><h2>{section === "blocks" ? "Blocks" : "Pages"} coming soon</h2><p>{section === "blocks" ? "Reusable compositions built with Highway components." : "Complete page layouts built with Highway components."}</p></div>}
  </div>;
  return embedded ? content : <LibraryShell>{content}</LibraryShell>;
}
