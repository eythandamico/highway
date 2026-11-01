"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowUp } from "lucide-react";
export type PageSection = { id: string; label: string };
function SectionLinks({sections,active,onJump}:{sections:PageSection[];active:string;onJump:(event:MouseEvent<HTMLAnchorElement>,id:string)=>void}) {
 const nav=useRef<HTMLElement>(null);
 useEffect(()=>{
  const element=nav.current;if(!element)return;
  const update=()=>{
   const link=element.querySelector<HTMLElement>('a[aria-current="location"]');
   if(!link)return;
   element.style.setProperty("--toc-offset",`${link.offsetTop+8}px`);
   element.style.setProperty("--toc-height",`${Math.max(0,link.offsetHeight-16)}px`);
  };
  update();const observer=new ResizeObserver(update);observer.observe(element);
  return()=>observer.disconnect();
 },[active,sections]);
 return <nav ref={nav} aria-label="On this page"><span className="page-toc-marker" aria-hidden="true"/>{sections.map(section=><a key={section.id} href={`#${section.id}`} aria-current={active===section.id?"location":undefined} onClick={event=>onJump(event,section.id)}>{section.label}</a>)}</nav>;
}
/** Local document navigation; links also work before hydration. */
export function OnThisPage({sections,topId="start"}:{sections:PageSection[];topId?:string}) {
 const [active,setActive]=useState(sections[0]?.id??"");
 useEffect(()=>{
  let frame=0;
  const reveal=()=>{let id=window.location.hash.slice(1);try{id=decodeURIComponent(id);}catch{return;}const target=document.getElementById(id);if(target){for(let node:HTMLElement|null=target;node;node=node.parentElement){if(node instanceof HTMLDetailsElement)node.open=true;}}};
  const update=()=>{frame=0;let current=sections[0]?.id??"";for(const section of sections){const target=document.getElementById(section.id);if(target&&target.getClientRects().length>0&&target.getBoundingClientRect().top<=120)current=section.id;}if(window.scrollY>0&&window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2)current=sections.at(-1)?.id??current;setActive(current);};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  reveal();update();window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);window.addEventListener("hashchange",reveal);document.addEventListener("toggle",schedule,true);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);window.removeEventListener("hashchange",reveal);document.removeEventListener("toggle",schedule,true);};
 },[sections]);
 const jump=(event:MouseEvent<HTMLAnchorElement>,id:string)=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const target=document.getElementById(id);if(!target)return;
  for(let node:HTMLElement|null=target;node;node=node.parentElement){if(node instanceof HTMLDetailsElement)node.open=true;}
  event.preventDefault();
  const menu=event.currentTarget.closest("details");if(menu)menu.open=false;
  if(window.location.hash!==`#${id}`)window.history.pushState(null,"",`#${id}`);
  requestAnimationFrame(()=>{
   target.tabIndex=-1;target.focus({preventScroll:true});
   target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
  });
 };
 const links=<SectionLinks sections={sections} active={active} onJump={jump}/>;
 const top=<a className="page-toc-top" href={`#${topId}`} onClick={event=>jump(event,topId)}>Back to top <ArrowUp size={16} aria-hidden="true"/></a>;
 return <aside className="page-toc"><div className="page-toc-desktop"><h2>On this page</h2>{links}{top}</div><details className="page-toc-mobile"><summary>On this page</summary>{links}{top}</details></aside>;
}
