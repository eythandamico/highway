"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Brand } from "./brand";
import { useSession } from "./providers";
const nav=[{href:"/",title:"Home",icon:Home},{href:"/workspace",title:"Workspace",icon:LayoutDashboard},{href:"/settings",title:"Settings",icon:Settings}];
export function Shell({children}:{children:React.ReactNode}) {const path=usePathname(),{user,openSignIn,signOut}=useSession();if(["/demo","/guide","/showcase"].includes(path))return <><a className="skip-link" href="#main">Skip to content</a><main id="main" tabIndex={-1}>{children}</main></>;return <>
 <a className="skip-link" href="#main">Skip to content</a><header className="app-header"><Link href="/" aria-label="Home"><Brand/></Link><nav className="desktop-nav" aria-label="Main navigation">{nav.map(n=><Link key={n.href} href={n.href} aria-current={path===n.href?"page":undefined}>{n.title}</Link>)}</nav><div className="header-actions">{user?<Button variant="ghost" onClick={signOut}>Sign out</Button>:<Button onClick={openSignIn}>Sign in</Button>}<Sheet><SheetTrigger asChild><Button variant="secondary" size="icon" aria-label="Open menu"><Menu/></Button></SheetTrigger><SheetContent><SheetTitle>Menu</SheetTitle><nav className="menu-links" aria-label="More pages">{[["/guide","How to use"],["/showcase","Component showcase"],["/demo","Explore the demo"],["/about","About"],["/faq","FAQ"],["/help","Help & feedback"],["/components","Component examples"]].map(([href,name])=><SheetClose key={href} asChild><Link href={href} prefetch={false}>{name}</Link></SheetClose>)}</nav></SheetContent></Sheet></div></header>
 <main id="main" tabIndex={-1}>{children}</main><footer className="site-footer"><span>Built on a reusable foundation.</span><nav aria-label="Footer">{["about","faq","help","privacy","terms"].map(p=><Link prefetch={false} key={p} href={`/${p}`}>{p==="faq"?"FAQ":p.charAt(0).toUpperCase()+p.slice(1)}</Link>)}</nav></footer><nav className="mobile-nav" aria-label="Main navigation">{nav.map(n=><Link key={n.href} href={n.href} aria-current={path===n.href?"page":undefined}><n.icon size={22}/><span>{n.title}</span></Link>)}</nav>
 </>;}
