"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { NativeSelect } from "../../../packages/highway-react/src/components/ui/native-select";
import { Card as GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../packages/highway-react/src/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "../../../packages/highway-react/src/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "../../../packages/highway-react/src/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../../packages/highway-react/src/components/ui/sheet";
import { Menu, MenuItem, MenuDivider } from "../../../packages/highway-react/src/invariant/components/menu";
import { Card } from "../../../packages/highway-react/src/invariant/components/card";
import { Surface } from "../../../packages/highway-react/src/invariant/components/surface";
import { BottomNav } from "../../../packages/highway-react/src/invariant/components/bottom-nav";
import { BottomSheet } from "../../../packages/highway-react/src/invariant/components/bottom-sheet";
import { Modal } from "../../../packages/highway-react/src/invariant/components/modal";
import { Dialog as LegacyDialog } from "../../../packages/highway-react/src/invariant/components/dialog";
import { Accordion } from "../../../packages/highway-react/src/invariant/components/accordion";
import { Alert } from "../../../packages/highway-react/src/invariant/components/alert";
import { Progress } from "../../../packages/highway-react/src/invariant/components/progress";
import { StepIndicator } from "../../../packages/highway-react/src/invariant/components/step-indicator";
import "./control-family.css";

export function SurfaceFamily() {
  const {setTheme} = useTheme();
  const [navigation,setNavigation] = useState(false),[navTab,setNavTab] = useState("home");
  const [media,setMedia] = useState(false),[bottom,setBottom] = useState(false);
  const [modal,setModal] = useState(false),[confirm,setConfirm] = useState(false),[notes,setNotes] = useState(true);
  const [action,setAction] = useState("No action yet"),[step,setStep] = useState(1),[dismissals,setDismissals] = useState(0),[alert,setAlert] = useState(true);
  const longText = "A thoughtful workspace gives every idea enough room to grow, including long descriptions and content translated into other languages. ";
  return <div className="control-family">
    <header><p className="control-family-eyebrow">HIGHWAY / SURFACE FAMILY</p><h1>One family, at every layer.</h1><p className="muted">Original materials, shared precision. These are the real package components with local example actions.</p><div className="control-family-row"><Button variant="secondary" onClick={()=>setTheme("light")}>Light</Button><Button variant="secondary" onClick={()=>setTheme("dark")}>Dark</Button><a href="/components/family">Control family</a></div></header>
    <section aria-label="Surfaces"><h2>Surfaces</h2><div className="control-family-grid">
      <GlassCard><CardHeader><CardTitle>Room for the work</CardTitle><CardDescription>Highway’s glass wash, rim and layered elevation.</CardDescription></CardHeader><CardContent><p>{longText}</p><p className="muted">project-with-an-unusually-long-unbroken-reference-that-still-needs-to-fit-on-a-phone</p></CardContent><CardFooter><Button onClick={()=>setAction("Project opened")}>Open project</Button><Button variant="secondary" onClick={()=>setAction("Project saved")}>Save for later</Button></CardFooter></GlassCard>
      <Card title="Quiet by design" description={longText}><Button variant="secondary" onClick={()=>setAction("Collection opened")}>View collection</Button></Card>
      <Surface><Accordion items={[{title:"A considered expansion",content:<><p>{longText}</p><Button variant="secondary" onClick={()=>setAction("Accordion action")}>Expanded action</Button></>},{title:"More detail when you need it",content:<p>{longText.repeat(2)}</p>}]}/></Surface>
      <Surface><p className="highway-type-heading-md">Progress with purpose</p><Progress label="Preparation" value={(step+1)*20} showValue/><StepIndicator steps={5} activeStep={step} onStepChange={setStep}/></Surface>
    </div><Button variant="secondary" onClick={()=>setMedia(!media)}>{media ? 'Hide media card' : 'Show media card'}</Button>{media && <Card variant="video" image="/invariant-preview/card-video.mp4" title="Motion you control" description="Pause or resume this local example."/>}</section>
    <section aria-label="Menus"><h2>Menus</h2><div className="control-family-grid"><Menu label="Project actions"><MenuItem label="Open project" onClick={()=>setAction("Open project")}/><MenuItem label="Duplicate project" disabled onClick={()=>setAction("Disabled action ran")}/><MenuItem label="Share project" description="Invite someone to this example workspace" onClick={()=>setAction("Share project")}/><MenuDivider/><MenuItem label="Archive project" danger onClick={()=>setAction("Archive project")}/></Menu>
      <div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary">Open action menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>setAction("Overview")}>View overview</DropdownMenuItem><DropdownMenuItem disabled>Unavailable action</DropdownMenuItem><DropdownMenuCheckboxItem checked={notes} onCheckedChange={setNotes}>Include notes</DropdownMenuCheckboxItem><DropdownMenuSub><DropdownMenuSubTrigger>Export options</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem onSelect={()=>setAction("PDF selected")}>PDF document</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub><DropdownMenuItem variant="destructive" onSelect={()=>setAction("Archive selected")}>Archive example</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
    </div><output aria-live="polite">{action}</output></section>
    <section aria-label="Overlays"><h2>Overlays</h2><div className="control-family-row"><Dialog><DialogTrigger asChild><Button>Open project dialog</Button></DialogTrigger><DialogContent><DialogTitle>Project settings</DialogTitle><DialogDescription>{longText}</DialogDescription><label htmlFor="surface-team">Team</label><NativeSelect id="surface-team" aria-label="Team" defaultValue="design"><option value="design">Design</option><option value="engineering">Engineering</option></NativeSelect><DialogFooter><Button variant="secondary" onClick={()=>setAction("Settings previewed")}>Preview settings</Button></DialogFooter></DialogContent></Dialog>
      <Button variant="secondary" onClick={()=>setModal(true)}>Open detail modal</Button><Button variant="secondary" onClick={()=>setConfirm(true)}>Open confirmation</Button><Button variant="secondary" onClick={()=>setBottom(true)}>Open bottom sheet</Button>
      <Sheet><SheetTrigger asChild><Button variant="secondary">Open details sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Project details</SheetTitle><SheetDescription>{longText}</SheetDescription></SheetHeader><div className="surface-family-sheet-body"><p>{longText.repeat(8)}</p></div></SheetContent></Sheet>
    </div><Modal isOpen={modal} onClose={()=>setModal(false)} title="Detailed project notes"><p>{longText.repeat(18)}</p><Button onClick={()=>setModal(false)}>Done reading</Button></Modal><LegacyDialog isOpen={confirm} onClose={()=>setConfirm(false)} title="Keep this project?" description={longText.repeat(8)} actions={<><Button variant="secondary" onClick={()=>setConfirm(false)}>Cancel</Button><Button onClick={()=>setConfirm(false)}>Keep project</Button></>}/></section>
    <BottomSheet isOpen={bottom} onClose={()=>setBottom(false)} title="Related project details"><p>{longText.repeat(6)}</p></BottomSheet>
    <section aria-label="Navigation"><h2>Navigation</h2><Button variant="secondary" onClick={()=>setNavigation(!navigation)}>{navigation ? 'Hide bottom navigation' : 'Show bottom navigation'}</Button>{navigation && <BottomNav tabs={[{id:"home",label:"Home",icon:"home"},{id:"chat",label:"Chat",icon:"chat"}]} activeTab={navTab} onTabChange={setNavTab} addItems={[{label:"New note",icon:"plus",onAction:()=>setAction("New note")},{label:"Unavailable note",disabled:true},{label:"New folder",icon:"folder",onAction:()=>setAction("New folder")}]} onSendMessage={()=>setAction("Example message")}/>}</section>
    <section aria-label="Feedback"><h2>Feedback</h2>{alert&&<Alert title="Your draft is safe" description={longText} variant="success" dismissible onDismiss={()=>setDismissals(n=>n+1)}/>}<div className="control-family-row"><Button variant="secondary" onClick={()=>setAlert(!alert)}>{alert?"Unmount alert":"Mount alert"}</Button><output>Dismissed {dismissals} times</output></div></section>
  </div>;
}
