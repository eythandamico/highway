"use client";
import { useExampleState } from "./example-state";
import { AskBar, type AskBarMessage } from "../../../packages/highway-react/src/components/ui/ask-bar";
import { Input } from "../../../packages/highway-react/src/components/ui/input";
import { Label } from "../../../packages/highway-react/src/components/ui/label";
import { Textarea } from "../../../packages/highway-react/src/components/ui/textarea";
import { NativeSelect } from "../../../packages/highway-react/src/components/ui/native-select";
import { DateInput } from "../../../packages/highway-react/src/components/ui/date-input";
import { Switch } from "../../../packages/highway-react/src/components/ui/switch";
import { Status } from "../../../packages/highway-react/src/components/foundation/status";

export function FieldsPreview(){const [disabled]=useExampleState("disabled", false);return <div className="library-preview-form"><Label htmlFor="sample-name">Customer name</Label><Input disabled={disabled} id="sample-name" placeholder="Alex Morgan"/></div>;}

export function NativeTextareaPreview(){const [disabled]=useExampleState("disabled", false);return <div className="library-preview-form"><Label htmlFor="sample-notes">Notes</Label><Textarea disabled={disabled} id="sample-notes" placeholder="Anything to keep in mind?"/></div>;}

export function SelectPreview(){const [disabled]=useExampleState("disabled", false);const [value,setValue]=useExampleState("value", "service");return <div className="library-preview-form"><Label htmlFor="sample-team">Assigned team</Label><NativeSelect disabled={disabled} id="sample-team" value={value} onChange={e=>setValue(e.target.value)}><option value="service">Service team</option><option value="projects">Projects team</option><option value="unassigned">Unassigned</option></NativeSelect></div>;}

export function DatePreview(){const [disabled]=useExampleState("disabled", false);const [date,setDate]=useExampleState("date", "");return <div className="library-preview-form"><Label htmlFor="sample-date">Visit date</Label><DateInput disabled={disabled} id="sample-date" value={date} onChange={e=>setDate(e.target.value)}/></div>;}

export function SwitchPreview(){const [disabled]=useExampleState("disabled", false);const [enabled,setEnabled]=useExampleState("enabled", true);return <div className="library-preview-row"><Switch disabled={disabled} id="sample-reminder" checked={enabled} onCheckedChange={setEnabled}/><Label htmlFor="sample-reminder">Show reminders</Label><Status tone={enabled?"good":"neutral"}>{enabled?"On":"Off"}</Status></div>;}

export function AskBarPreview() {
 const [messages,setMessages]=useExampleState<AskBarMessage[]>("messages", []);
 const [disabled]=useExampleState("disabled", false),[fail]=useExampleState("fail", false);
 return <>

  <AskBar disabled={disabled} messages={messages} onSend={async text=>{
   await new Promise(resolve=>setTimeout(resolve,900));
   if(fail)throw new Error("Example failure. Your draft is kept—try the default example to send successfully.");
   setMessages(previous=>[...previous,{id:crypto.randomUUID(),role:"user",text},{id:crypto.randomUUID(),role:"assistant",text:"Demo reply: your message arrived. Connect onSend to your own service when you build an app."}]);
  }}/>

  <p className="library-source">Local demo only. Enter sends; Escape dismisses the reply. No voice service is connected.</p>
 </>;
}
