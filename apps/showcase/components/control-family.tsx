"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Plus } from "lucide-react";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { Input } from "../../../packages/highway-react/src/components/ui/input";
import { NativeSelect } from "../../../packages/highway-react/src/components/ui/native-select";
import { Switch } from "../../../packages/highway-react/src/components/ui/switch";
import { Checkbox } from "../../../packages/highway-react/src/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../packages/highway-react/src/components/ui/radio-group";
import { SegmentedControl } from "../../../packages/highway-react/src/components/segmented-control";
import { SliderInput } from "../../../packages/highway-react/src/components/slider-input";
import "./control-family.css";

/** Review surface only: all controls are their canonical package owners. */
export function ControlFamily() {
  const { setTheme } = useTheme();
  const [view, setView] = useState("week");
  const [amount, setAmount] = useState(40);
  const [enabled, setEnabled] = useState(true);
  const [clicks, setClicks] = useState(0);
  const [largeText, setLargeText] = useState(false);
  return <div className="control-family" style={largeText ? { zoom: 2 } : undefined}>
    <header><p className="control-family-eyebrow">HIGHWAY / CONTROL FAMILY</p><h1>Different purposes. Shared precision.</h1><p className="muted">Real library components, together. Explore their materials, proportions, focus and motion. Changes here are local examples.</p>
      <div className="control-family-row"><Button variant="secondary" onClick={() => setTheme("light")}>Light</Button><Button variant="secondary" onClick={() => setTheme("dark")}>Dark</Button><Button variant="ghost" aria-pressed={largeText} onClick={() => setLargeText(!largeText)}>200% scale</Button></div>
    </header>
    <section aria-label="Actions"><h2>Actions</h2><p className="muted">One silhouette, clear emphasis. Pending keeps its footprint.</p><div className="control-family-row">
      <Button iconPosition="start" onClick={() => setClicks(clicks + 1)}><Plus/>Create project</Button>
      <Button variant="secondary" onClick={() => setClicks(clicks + 1)}>Save draft</Button><Button variant="ghost" onClick={() => setClicks(clicks + 1)}>Preview</Button><Button disabled>Unavailable</Button><Button loading onClick={() => setClicks(clicks + 1)}>Saving draft</Button>
    </div><output>{clicks} example actions</output></section>
    <section aria-label="Fields"><h2>Fields</h2><p className="muted">Aligned edges and readable states, with room for real content.</p><div className="control-family-grid">
      <label>Project name<Input defaultValue="Sunday studio"/></label>
      <label htmlFor="family-workspace">Workspace<NativeSelect id="family-workspace" aria-label="Workspace" defaultValue="studio"><option value="studio">Design studio</option><option value="research">Research and long-term exploration</option></NativeSelect></label>
      <label>Read-only example<Input disabled defaultValue="Managed by your workspace"/></label>
      <label>Project URL<Input defaultValue="sunday studio" aria-invalid="true" aria-describedby="family-url-error"/><span id="family-url-error" className="control-family-error">Use a URL without spaces.</span></label>
    </div></section>
    <section aria-label="Selection"><h2>Selection</h2><p className="muted">The same inset logic, distinct feedback for each task.</p>
      <div className="control-family-grid"><div><p>Schedule view</p><SegmentedControl label="Schedule view" tabs={[{id:"day",label:"Day"},{id:"week",label:"Week"},{id:"month",label:"Month"},{id:"year",label:"Year",disabled:true}]} activeTab={view} onTabChange={setView}/><output>Selected: {view}</output></div>
      <div><p>Long content</p><SegmentedControl label="Reporting period" variant="subdued" tabs={[{id:"current",label:"Current reporting period"},{id:"previous",label:"Previous reporting period"}]} activeTab="current" disabled/></div>
      <SliderInput label="Intensity" value={amount} onChange={setAmount} suffix="%"/>
      <SliderInput label="A longer label that remains readable in a narrow layout" value={65} suffix="%" disabled/>
      </div><div className="control-family-row"><label className="control-family-choice"><Switch checked={enabled} onCheckedChange={setEnabled}/>Live updates</label><label className="control-family-choice"><Switch disabled defaultChecked/>Locked updates</label><label className="control-family-choice"><Checkbox defaultChecked/>Include notes</label><label className="control-family-choice"><Checkbox disabled/>Archived</label></div>
      <RadioGroup aria-label="Delivery" defaultValue="daily" className="control-family-row"><label className="control-family-choice"><RadioGroupItem value="daily"/>Daily</label><label className="control-family-choice"><RadioGroupItem value="weekly"/>Weekly</label></RadioGroup>
    </section>
  </div>;
}
