"use client";
import { useExampleState } from "./example-state";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "../../../packages/highway-react/src/components/ui/sheet";
import { FormDialog } from "../../../packages/highway-react/src/components/foundation/patterns";

export function DialogPreview(){const [open,setOpen]=useExampleState("open", false),[fail]=useExampleState("fail", false),[saved,setSaved]=useExampleState("saved", "");return <div className="library-preview-form"><Button onClick={()=>setOpen(true)}>Open form dialog</Button>{saved&&<p className="sr-only" role="status">Saved in this preview: {saved}</p>}{open&&<FormDialog title="New customer" description="A local example. No data is sent." fields={[{name:"name",label:"Name",maxLength:160}]} initial={{name:""}} onSave={async values=>{await new Promise(resolve=>setTimeout(resolve,700));if(fail)throw new Error("Example failure. Your draft is still here.");setSaved(String(values.name));}} onClose={()=>setOpen(false)} submit="Save customer"/>}</div>;}

export function SheetPreview(){const [side]=useExampleState<"top"|"bottom"|"left"|"right">("side", "right");return <div className="library-preview-row"><Sheet><SheetTrigger asChild><Button>Open details</Button></SheetTrigger><SheetContent side={side}><SheetTitle>Room for the details.</SheetTitle><SheetDescription>A shared sheet with keyboard navigation and focus restoration.</SheetDescription><div className="library-surface"><p>Use Escape or the close button to return to the preview.</p></div></SheetContent></Sheet></div>;}
