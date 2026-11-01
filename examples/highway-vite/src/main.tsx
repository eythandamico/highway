import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@highway/styles/styles.css';
import { HighwayTheme, Button, Input, Label, Switch, GlassCard, CardHeader, CardTitle, CardDescription, CardContent, AskBar, ProgressiveBlur, GradientSurface, FormDialog, DateInput, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, SegmentedControl, Table } from '@highway/react';
import type { AskBarMessage } from '@highway/react';
import './host.css';

declare global {
  interface Window {
    __highwayCompletePendingSave?: () => void;
  }
}

function App() {
  const saveResolution = useRef<(() => void) | null>(null);
  const controlledSave = new URLSearchParams(window.location.search).get('controlled-save') === '1';
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
        <section aria-label="Analytics typography" data-testid="analytics-typography">
          <h2>Analytics typography</h2>
          <p className="highway-secondary-label" data-testid="metric-label">Net revenue</p>
          <div data-highway-metric="primary">$48,120</div>
          <p className="highway-secondary-label">Average order</p>
          <div data-highway-metric="secondary">$124</div>
          <p><strong>Important context</strong> stays at weight 600.</p>
          <Table columns={[{key:'name',label:'Segment',render:(value: unknown)=><span style={{display:'block',maxWidth:'24ch'}}>{String(value)}</span>},{key:'amount',label:'Revenue',align:'right'}]} data={[{name:'North',amount:'$1,240.00'},{name:'South',amount:'$8,910.00'},{name:'A longer segment description that wraps naturally without clipping important customer context',amount:'$2,345.00'}]} footer={undefined} caption="Synthetic values. Rows grow when text wraps." onSelectionChange={undefined}/>
        </section>
        {dialog&&<FormDialog title="Edit project" fields={[{name:'name',label:'Project name',maxLength:160}]} initial={{name:'Existing project'}} onClose={()=>setDialog(false)} submit="Save project" onSave={async values=>{if(controlledSave){await new Promise<void>(resolve=>{saveResolution.current=resolve;window.__highwayCompletePendingSave=()=>saveResolution.current?.();});saveResolution.current=null;window.__highwayCompletePendingSave=undefined;}else{await new Promise(resolve=>setTimeout(resolve,400));}if(fail)throw new Error('Example save failed. Your draft is retained.');setSaved(`Saved ${values.name}`);setDialog(false);}}/>}
      </main>
    </HighwayTheme>
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);
