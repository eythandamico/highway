"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scrollComponentPanelToTop } from "./component-navigation";
import Link from "next/link";
import { ChevronDown, Shapes } from "lucide-react";
import { SearchBar } from "../../../packages/highway-react/src/components/search-bar";
import { ProgressiveBlur } from "../../../packages/highway-react/src/components/visual/progressive-blur";
import { Button } from "../../../packages/highway-react/src/components/ui/button";

type Entry = { id: string; name: string; group: string; searchText?: string };
export function ComponentSidebar({ entries, selected }: { entries: Entry[]; selected: string }) {
 const [query,setQuery]=useState("");
 const [collapsed,setCollapsed]=useState<Record<string,boolean>>({});
 const search=useRef<HTMLInputElement>(null);
 const sidebar=useRef<HTMLElement>(null);
 const restoring=useRef(true);
 useLayoutEffect(()=>{
  let top=0;
  try { top=Number(sessionStorage.getItem("highway-showcase-nav-scroll")) || 0; } catch { /* Storage may be unavailable. */ }
  const restore=()=>{ if(sidebar.current) sidebar.current.scrollTop=top; };
  restore();
  const frame=requestAnimationFrame(()=>{ restore(); restoring.current=false; });
  return()=>cancelAnimationFrame(frame);
 },[]);
 const saveScroll=()=>{
  if(restoring.current || !sidebar.current)return;
  try { sessionStorage.setItem("highway-showcase-nav-scroll",String(sidebar.current.scrollTop)); } catch { /* Navigation still works without storage. */ }
 };
 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
    event.preventDefault();search.current?.focus();search.current?.select();
   }
  };
  window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
 },[]);
 const filtered=entries.filter(entry=>`${entry.name} ${entry.group} ${entry.searchText ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()));
 const groups=[...new Set(filtered.map(entry=>entry.group))];
 const resetPanel = (event: React.MouseEvent<HTMLAnchorElement>) => {
  if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { saveScroll(); scrollComponentPanelToTop(); }
 };
 return <aside ref={sidebar} onScroll={saveScroll} className="library-sidebar component-sidebar">
  <div className="component-search-sticky"><ProgressiveBlur edge="top" recipe="header" className="component-search-blur"/>
  <SearchBar inputRef={search} aria-label="Search components" placeholder="Search" shortcutKey="⌘K" value={query} onSearch={value=>{setQuery(value);setCollapsed({});}}/></div>
  <Link href="/showcase" scroll={false} onClick={resetPanel} className="component-sidebar-heading" aria-current={selected === "" ? "page" : undefined}><Shapes size={18} aria-hidden="true"/><span>Components</span><span className="component-count">{entries.length}</span></Link>
  <nav aria-label="Component library">{groups.map(group=>{
   const items=filtered.filter(entry=>entry.group===group);
   const open=!collapsed[group];
   const id=`component-group-${group.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`;
   return <div className="component-group" key={group}>
    <Button variant="ghost" className="component-group-toggle" aria-expanded={open} aria-controls={id} onClick={()=>setCollapsed(current=>({...current,[group]:!current[group]}))}>
     <ChevronDown size={14} aria-hidden="true"/><span>{group}</span><span className="component-count">{items.length}</span>
    </Button>
    <div id={id} className="component-group-links" hidden={!open}>{items.map(entry=><Link key={entry.id} href={`/showcase?component=${entry.id}`} scroll={false} onClick={resetPanel} aria-current={entry.id===selected?"page":undefined}>{entry.name.split(",")[0]}</Link>)}</div>
   </div>;
  })}</nav>
  {!filtered.length&&<p className="component-search-empty" role="status">No components found.</p>}
 </aside>;
}
