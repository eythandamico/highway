import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@highway/styles/styles.css';
import { HighwayTheme, Button, Input, Label, Switch, GlassCard, CardHeader, CardTitle, CardDescription, CardContent, AskBar, ProgressiveBlur, GradientSurface, FormDialog, DateInput, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, SegmentedControl } from '@highway/react';
import type { AskBarMessage } from '@highway/react';
import './host.css';

function App() {
  const [dark, setDark] = useState(false), [branded, setBranded] = useState(false);
  const [count, setCount] = useState(0), [dialog, setDialog] = useState(false), [fail, setFail] = useState(false);
  const [saved, setSaved] = useState('Nothing saved yet'), [date, setDate] = useState('2026-10-19');
  const [messages, setMessages] = useState<AskBarMessage[]>([]);
  const [tab, setTab] = useState('overview');
  return <>
    <header className="host-header"><strong>Existing application</strong><button data-testid="host-button">Host button</button><p data-testid="host-copy">This area keeps the host’s styles.</p></header>
    <HighwayTheme mode={dark ? 'dark' : 'light'} brand={branded ? { primary: '#4055d8', primaryForeground: '#ffffff', focus: '#6d83ed', fontFamily: 'Georgia, serif' } : {}}>
      <main className="example-layout">
        <p className="example-eyebrow">HIGHWAY / INSTALLED PACKAGES</p><h1>The same components.<br/>Your own application.</h1>
        <p>This frontend installs the packaged library. It has no Highway source aliases, Tailwind setup, backend, or Cloudflare configuration.</p>
        <div className="example-controls"><Switch id="dark" checked={dark} onCheckedChange={setDark}/><Label htmlFor="dark">Dark theme</Label><Switch id="brand" checked={branded} onCheckedChange={setBranded}/><Label htmlFor="brand">Custom brand</Label><Switch id="fail" checked={fail} onCheckedChange={setFail}/><Label htmlFor="fail">Simulate failure</Label></div>
        <GlassCard><CardHeader><CardTitle>Built from Highway’s real source.</CardTitle><CardDescription>Shared materials and interactions, installed as a versioned dependency.</CardDescription></CardHeader><CardContent>
          <div className="example-controls"><Button data-testid="package-button" onClick={()=>setCount(n=>n+1)}>Add something good</Button><Button variant="secondary" onClick={()=>setDialog(true)}>Edit project</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost">Project actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>setSaved('Archived locally')}>Archive locally</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
          <p role="status">{count} preview clicks</p><p data-testid="save-status">{saved}</p>
          <Label htmlFor="project">Project name</Label><Input id="project" defaultValue="Existing project"/>
          <Label htmlFor="date">Review date</Label><DateInput id="date" value={date} onChange={event=>setDate(event.target.value)}/>
        </CardContent></GlassCard>
        <SegmentedControl tabs={[{id:'overview',label:'Overview'},{id:'details',label:'Details'}]} activeTab={tab} onTabChange={setTab}/>
        <GradientSurface variant="profile" className="example-effect"><div className="example-art" aria-hidden="true">Clear foreground.<br/>Soft background.</div><ProgressiveBlur edge="bottom" recipe="panel"/><div className="example-foreground"><Button variant="secondary" onClick={()=>setCount(n=>n+1)}>Foreground action</Button></div></GradientSurface>
        <AskBar messages={messages} onSend={async text=>{await new Promise(resolve=>setTimeout(resolve,300));if(fail)throw new Error('Example failure. Your draft is retained.');setMessages(previous=>[...previous,{id:crypto.randomUUID(),role:'user',text},{id:crypto.randomUUID(),role:'assistant',text:'Local example reply. Your application owns the transport.'}]);}}/>
        {dialog&&<FormDialog title="Edit project" fields={[{name:'name',label:'Project name',maxLength:160}]} initial={{name:'Existing project'}} onClose={()=>setDialog(false)} submit="Save project" onSave={async values=>{await new Promise(resolve=>setTimeout(resolve,400));if(fail)throw new Error('Example save failed. Your draft is retained.');setSaved(`Saved ${values.name}`);setDialog(false);}}/>}
      </main>
    </HighwayTheme>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);
