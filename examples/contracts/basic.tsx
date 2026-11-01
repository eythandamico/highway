import { useState } from 'react';
import { HighwayTheme, Button, GlassCard, CardHeader, CardTitle, CardContent, Input, Label, NativeTextarea, Tabs, SliderInput, ExpandCard, ProgressiveBlur } from '@highway/react';

export function BasicExample() {
  const [view, setView] = useState('overview');
  const [value, setValue] = useState(40);
  return <HighwayTheme>
    <GlassCard><CardHeader><CardTitle>Account</CardTitle></CardHeader><CardContent>
      <Label htmlFor="name">Name</Label><Input id="name" name="name" autoComplete="name" />
      <Label htmlFor="notes">Notes</Label><NativeTextarea id="notes" name="notes" />
      <Button type="button" onClick={() => setView('details')}>View details</Button>
    </CardContent></GlassCard>
    <Tabs tabs={[{ id: 'overview', label: 'Overview' }, { id: 'details', label: 'Details' }]} activeTab={view} onTabChange={setView} />
    <SliderInput label="Capacity" value={value} onChange={setValue} min={0} max={100} />
    <ExpandCard title="Details">Existing account details</ExpandCard>
    <div style={{ position: 'relative', isolation: 'isolate' }}><ProgressiveBlur edge="top" recipe="header" /></div>
  </HighwayTheme>;
}
