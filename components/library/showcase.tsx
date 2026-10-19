"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useTheme } from "next-themes";
import invariantEntries from "./invariant-registry.json";
import { LibraryShell } from "./library-shell";
import { CodeExample } from "./code-example";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { DateInput } from "@/components/ui/date-input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/foundation/patterns";
import { Status } from "@/components/foundation/status";
import { Feedback, LoadingState } from "@/components/foundation/feedback";
import { GradientAvatar } from "@/components/visual/gradient-avatar";
import { GradientSurface } from "@/components/visual/gradient-surface";
import { ProgressiveBlur } from "@/components/visual/progressive-blur";
import { AccountAvatar } from "@/components/yardwork/account-avatar";
import { OfficeNavigation } from "@/components/yardwork/office-navigation";
import BookingsChart from "@/components/yardwork/bookings-chart";
import { demoSuite } from "@/lib/yardwork/demo-suite";
import { appearanceStyle, DEFAULT_ACCENT } from "@/lib/design/appearance-style";
import { ThemeScope } from "@/components/ui/theme-scope";
import "@/components/visual/visual-effects.css";
import "@/components/yardwork/yardwork.css";

const entries = [
  { id: "button", name: "Button", group: "Actions", description: "Clear actions, generous targets, and consistent geometry. Try the variants and states.", source: "components/ui/button.tsx", code: `import { Button } from "@/components/ui/button";\n\n<Button variant="default" onClick={handleSave}>Save changes</Button>\n<Button variant="secondary">Cancel</Button>`, preview: ButtonPreview },
  { id: "fields", name: "Form fields", group: "Inputs", description: "Labelled inputs and text areas with room for real content. Phone inputs retain a readable size.", source: "components/ui/input.tsx · textarea.tsx · label.tsx", code: `<Label htmlFor="name">Customer name</Label>\n<Input id="name" placeholder="Alex Morgan" />\n<Label htmlFor="notes">Notes</Label>\n<Textarea id="notes" placeholder="Anything to keep in mind?" />`, preview: FieldsPreview },
  { id: "select", name: "Accessible select", group: "Inputs", description: "A shared select control with keyboard support and consistent field styling.", source: "components/ui/native-select.tsx", code: `<NativeSelect value={team} onChange={e => setTeam(e.target.value)}>\n  <option value="service">Service team</option>\n  <option value="projects">Projects team</option>\n</NativeSelect>`, preview: SelectPreview },
  { id: "date", name: "Date input", group: "Inputs", description: "Native date entry paired with a calendar that loads when opened.", source: "components/ui/date-input.tsx", code: `<Label htmlFor="visit">Visit date</Label>\n<DateInput id="visit" value={date}\n  onChange={e => setDate(e.target.value)} />`, preview: DatePreview },
  { id: "switch", name: "Switch / Toggle", group: "Inputs", description: "A labelled toggle for a reversible preference. The label communicates its meaning.", source: "components/ui/switch.tsx", code: `<Label htmlFor="reminders">Show reminders</Label>\n<Switch id="reminders" checked={enabled}\n  onCheckedChange={setEnabled} />`, preview: SwitchPreview },
  { id: "dialog", name: "Form dialog", group: "Overlays", description: "The production form pattern: retained drafts, duplicate-submit protection, pending dismissal guards, and focused errors.", source: "components/foundation/patterns.tsx", code: `<FormDialog title="New customer"\n  fields={[{ name: "name", label: "Name", maxLength: 160 }]}\n  initial={{ name: "" }}\n  onSave={saveCustomer}\n  onClose={() => setOpen(false)}\n  submit="Save customer" />`, preview: DialogPreview },
  { id: "sheet", name: "Sheet", group: "Overlays", description: "A lightweight panel for secondary navigation and context, with focus restoration on dismissal.", source: "components/ui/sheet.tsx", code: `<Sheet>\n  <SheetTrigger asChild><Button>Open details</Button></SheetTrigger>\n  <SheetContent>\n    <SheetTitle>Details</SheetTitle>\n    <SheetDescription>More context, close at hand.</SheetDescription>\n  </SheetContent>\n</Sheet>`, preview: SheetPreview },
  { id: "menu", name: "Dropdown menu", group: "Overlays", description: "Reusable actions with coordinated focus, keyboard navigation, and portal layering.", source: "components/ui/dropdown-menu.tsx", code: `<DropdownMenu>\n  <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem onSelect={openDetails}>View details</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`, preview: MenuPreview },
  { id: "card", name: "Glass surface", group: "Display", description: "The original translucent glass material: a soft wash, bright rim, bounded blur, and layered elevation.", source: "components/ui/card.tsx · app/foundation.css", code: `<Card>\n  <CardHeader>\n    <CardTitle>A little room to think.</CardTitle>\n    <CardDescription>Related information, kept together.</CardDescription>\n  </CardHeader>\n  <CardContent>Your content</CardContent>\n</Card>`, preview: CardPreview },
  { id: "status", name: "Status & feedback", group: "Display", description: "Explicit labels for success, warning, failure, and progress. Color supports the message.", source: "components/foundation/status.tsx · feedback.tsx", code: `<Status tone="good">Complete</Status>\n<Status tone="warning">Needs attention</Status>\n<Feedback action={<Button onClick={retry}>Try again</Button>}>\n  Could not save. Your draft is still here.\n</Feedback>`, preview: StatusPreview },
  { id: "avatars", name: "Generated avatars", group: "Identity", description: "The original deterministic account artwork, alongside the shared gradient avatar. Change the identity to explore.", source: "components/yardwork/account-avatar.tsx · components/visual/gradient-avatar.tsx", code: `<AccountAvatar identity="demo-alex" />\n<GradientAvatar identity="demo-alex" label="Alex Morgan" size={64} />`, preview: AvatarPreview },
  { id: "gradients", name: "Gradients & blur", group: "Materials", description: "Bounded progressive blur over the original gradient surfaces. Decorative layers never block controls.", source: "components/visual/gradient-surface.tsx · progressive-blur.tsx", code: `<GradientSurface variant="onboarding">\n  <ProgressiveBlur recipe="header" edge="top" />\n  <h3>Space for the next good idea.</h3>\n</GradientSurface>`, preview: GradientPreview },
  { id: "navigation", name: "Office navigation", group: "Yardwork", description: "The same navigation used in the original demo. Compact, direct, and responsive.", source: "components/yardwork/office-navigation.tsx", code: `<OfficeNavigation current={view}\n  onNavigate={setView} onIntent={warmPage} />`, preview: NavigationPreview },
  { id: "bookings", name: "Bookings chart", group: "Yardwork", description: "The original revenue chart, with period selection and pointer or keyboard exploration. Synthetic sample data only.", source: "components/yardwork/bookings-chart.tsx", code: `<BookingsChart jobs={sampleJobs} />\n// Arrow keys explore daily amounts; Home and End jump.`, preview: ChartPreview },
  { id: "theme", name: "Scoped appearance", group: "Theming", description: "Brand tokens applied to both the container and portal context, keeping status colors independent.", source: "lib/design/appearance-style.ts · components/ui/theme-scope.tsx", code: `const tokens = appearanceStyle(DEFAULT_ACCENT);\n<ThemeScope tokens={tokens}>\n  <section style={tokens}>\n    <Button>Continue</Button>\n  </section>\n</ThemeScope>`, preview: ThemePreview },
];
export function Showcase() {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const { resolvedTheme } = useTheme();
  const aliases: Record<string, string> = { "inv-button": "button", "inv-toggle": "switch" };
  const requested = params.get("component") || "button";
  const catalogue = [...entries, ...invariantEntries.filter(e => !aliases[e.id])]
    .sort((a,b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
  const selected = catalogue.find(e => e.id === (aliases[requested] || requested)) || entries[0];
  const filtered = catalogue.filter(e => `${e.name} ${e.group}`.toLowerCase().includes(query.toLowerCase()));
  const Preview = "preview" in selected ? selected.preview : null;
  const previewURL = "previewId" in selected ? `/invariant-preview/index.html?component=${selected.previewId}&theme=${resolvedTheme === "dark" ? "dark" : "light"}` : null;
  return <LibraryShell>
    <div className="library-collections"><strong>One library. Invariant by design.</strong><span>{catalogue.length} components & patterns</span><p>Considered materials. Precise motion.</p></div>
    <div className="library-layout"><aside className="library-sidebar">
      <Label htmlFor="component-search" className="sr-only">Search components</Label><Input id="component-search" placeholder="Find a component…" value={query} onChange={e=>setQuery(e.target.value)}/>
      <nav aria-label="Component library">{filtered.map((entry,index)=><div key={entry.id}>
        {(index===0 || filtered[index-1].group!==entry.group)&&<p className="library-category">{entry.group}</p>}
        <Link className="block" href={`/showcase?component=${entry.id}`} scroll={false} aria-current={entry.id===selected.id?"page":undefined}>{entry.name.split(",")[0]}</Link>
      </div>)}</nav>{!filtered.length&&<p className="muted" role="status">No components match. Try another name.</p>}
    </aside>
    <article className="library-content" key={selected.id}>
      <p className="library-eyebrow">{selected.group.toUpperCase()} / LIVE COMPONENT</p>
      <h1>{selected.name.split(",")[0]}</h1><p className="library-intro">{selected.description}</p>
      {previewURL ? <>
        <div className="library-preview-toolbar"><span>Invariant materials & motion</span><a href={previewURL} target="_blank" rel="noreferrer">Open full preview ↗</a></div>
        <iframe className="library-invariant-preview" title={`${selected.name.split(",")[0]} interactive preview`} src={previewURL}/>
      </> : <section className="library-preview" aria-label={`${selected.name} interactive preview`}><div className="library-preview-inner">{Preview && <Preview/>}</div></section>}
      <p className="library-source">Source: <code>{selected.source}</code></p><CodeExample code={selected.code}/>
      {"props" in selected && <section className="library-api" aria-label="Component API"><h2>API reference</h2>{selected.props.length ? <div className="library-api-scroll"><table className="library-mapping"><thead><tr>{["Prop", "Type", "Default", "Description"].map(label=><th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{selected.props.map((row,index)=><tr key={index}>{row.map((cell,i)=><td key={i}>{i<3?<code>{cell}</code>:cell}</td>)}</tr>)}</tbody></table></div> : <p className="muted">See the full usage reference for composition and subcomponent APIs.</p>}<details className="library-reference"><summary>Full usage reference</summary><pre>{selected.documentation}</pre></details></section>}
      <div className="library-links"><Button variant="ghost" asChild><Link href="/guide#build">How to use these components →</Link></Button><Button variant="ghost" asChild><Link href="/components/foundation">Full quality lab →</Link></Button></div>
    </article></div></LibraryShell>;
}
function ButtonPreview() {
  const [variant,setVariant]=useState<"default"|"secondary"|"ghost"|"destructive">("default"),[disabled,setDisabled]=useState(false),[loading,setLoading]=useState(false),[count,setCount]=useState(0);
  return <><div className="library-preview-row"><Button variant={variant} disabled={disabled} loading={loading} onClick={()=>setCount(n=>n+1)}><Plus/>Add something good</Button><Button variant={variant} size="icon" disabled={disabled||loading} aria-label="Search example" onClick={()=>setCount(n=>n+1)}><Search/></Button></div><div className="library-controls"><Label htmlFor="variant">Variant</Label><NativeSelect id="variant" value={variant} onChange={e=>setVariant(e.target.value as typeof variant)}>{["default","secondary","ghost","destructive"].map(v=><option key={v}>{v}</option>)}</NativeSelect><Switch id="disabled" checked={disabled} onCheckedChange={setDisabled}/><Label htmlFor="disabled">Disabled</Label><Switch id="loading" checked={loading} onCheckedChange={setLoading}/><Label htmlFor="loading">Loading</Label></div><p className="library-source" role="status">{count} preview clicks</p></>;
}
function FieldsPreview(){return <div className="library-preview-form"><Label htmlFor="sample-name">Customer name</Label><Input id="sample-name" placeholder="Alex Morgan"/><Label htmlFor="sample-notes">Notes</Label><Textarea id="sample-notes" placeholder="Anything to keep in mind?"/></div>;}
function SelectPreview(){const [value,setValue]=useState("service");return <div className="library-preview-form"><Label htmlFor="sample-team">Assigned team</Label><NativeSelect id="sample-team" value={value} onChange={e=>setValue(e.target.value)}><option value="service">Service team</option><option value="projects">Projects team</option><option value="unassigned">Unassigned</option></NativeSelect><p className="muted">Selected: {value}</p></div>;}
function DatePreview(){const [date,setDate]=useState("");return <div className="library-preview-form"><Label htmlFor="sample-date">Visit date</Label><DateInput id="sample-date" value={date} onChange={e=>setDate(e.target.value)}/><p className="muted">{date||"Choose a date or open the calendar."}</p></div>;}
function SwitchPreview(){const [enabled,setEnabled]=useState(true);return <div className="library-preview-row"><Switch id="sample-reminder" checked={enabled} onCheckedChange={setEnabled}/><Label htmlFor="sample-reminder">Show reminders</Label><Status tone={enabled?"good":"neutral"}>{enabled?"On":"Off"}</Status></div>;}
function DialogPreview(){const [open,setOpen]=useState(false),[fail,setFail]=useState(false),[saved,setSaved]=useState("");return <div className="library-preview-form"><Button onClick={()=>setOpen(true)}>Open form dialog</Button><div className="library-preview-row"><Switch id="simulate-failure" checked={fail} onCheckedChange={setFail}/><Label htmlFor="simulate-failure">Simulate a save failure</Label></div>{saved&&<p role="status">Saved in this preview: {saved}</p>}{open&&<FormDialog title="New customer" description="A local example. No data is sent." fields={[{name:"name",label:"Name",maxLength:160}]} initial={{name:""}} onSave={async values=>{await new Promise(resolve=>setTimeout(resolve,700));if(fail)throw new Error("Example failure. Your draft is still here.");setSaved(String(values.name));}} onClose={()=>setOpen(false)} submit="Save customer"/>}</div>;}
function SheetPreview(){return <div className="library-preview-row"><Sheet><SheetTrigger asChild><Button>Open details</Button></SheetTrigger><SheetContent><SheetTitle>Room for the details.</SheetTitle><SheetDescription>A shared sheet with keyboard navigation and focus restoration.</SheetDescription><div className="library-surface"><p>Use Escape or the close button to return to the preview.</p></div></SheetContent></Sheet></div>;}
function MenuPreview(){const [selected,setSelected]=useState("No action selected");return <div className="library-preview-form"><DropdownMenu><DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger><DropdownMenuContent>{["View details","Duplicate example","Archive example"].map(label=><DropdownMenuItem key={label} onSelect={()=>setSelected(label)}>{label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><p role="status">{selected}</p></div>;}
function CardPreview(){return <Card><CardHeader><CardTitle>A little room to think.</CardTitle><CardDescription>Related information, kept together.</CardDescription></CardHeader><CardContent><p className="muted">Warm surfaces and quiet details. The same shared card, in every part of your app.</p></CardContent></Card>;}
function StatusPreview(){const [retry,setRetry]=useState(false);return <div className="stack"><div className="library-preview-row"><Status tone="good">Complete</Status><Status tone="warning">Needs attention</Status><Status tone="bad">Failed</Status><Status tone="info">In progress</Status></div>{retry?<LoadingState>Example retry in progress…</LoadingState>:<Feedback action={<Button variant="secondary" onClick={()=>setRetry(true)}>Try again</Button>}>Could not save this example. Your draft is still here.</Feedback>}{retry&&<Button variant="ghost" onClick={()=>setRetry(false)}>Reset feedback example</Button>}</div>;}
function AvatarPreview(){const [identity,setIdentity]=useState("Alex Morgan");return <div className="library-preview-form"><div className="library-preview-row"><AccountAvatar identity={identity}/><GradientAvatar identity={identity} label={identity||"Example avatar"} size={64}/></div><Label htmlFor="identity">Identity seed</Label><Input id="identity" value={identity} onChange={e=>setIdentity(e.target.value)}/></div>;}
function GradientPreview(){const [variant,setVariant]=useState<"onboarding"|"profile"|"upload"|"stage">("onboarding");return <><GradientSurface className="library-gradient" variant={variant}><ProgressiveBlur recipe="header" edge="top"/><h3>Space for the next good idea.</h3></GradientSurface><div className="library-controls"><Label htmlFor="gradient">Surface</Label><NativeSelect id="gradient" value={variant} onChange={e=>setVariant(e.target.value as typeof variant)}>{["onboarding","profile","upload","stage"].map(v=><option key={v}>{v}</option>)}</NativeSelect></div></>;}
function NavigationPreview(){const [view,setView]=useState<"today"|"schedule"|"customers"|"money">("today");return <div className="yw-app"><OfficeNavigation current={view} onNavigate={setView}/><p className="library-source" role="status">Selected: {view}</p></div>;}
function ChartPreview(){const [sample]=useState(demoSuite);return <div className="yw-app"><BookingsChart jobs={sample.jobs}/></div>;}
function ThemePreview(){const tokens=appearanceStyle(DEFAULT_ACCENT);return <ThemeScope tokens={tokens}><div style={tokens} className="library-preview-form"><Button>Continue</Button><Status tone="good">Semantic status stays independent</Status><MenuPreview/></div></ThemeScope>;}
