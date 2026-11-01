"use client";
import { useExampleState } from "./example-state";
import { Divider } from '../../../packages/highway-react/src/invariant/components/divider.jsx'
import { Menu, MenuItem, MenuDivider } from '../../../packages/highway-react/src/invariant/components/menu.jsx'
import { Overlay } from '../../../packages/highway-react/src/invariant/components/overlay.jsx'
import { Spinner } from '../../../packages/highway-react/src/invariant/components/spinner.jsx'
import { Tooltip } from '../../../packages/highway-react/src/invariant/components/tooltip.jsx'
import { PageSection } from '../../../packages/highway-react/src/invariant/components/page-section.jsx'
import { Row } from '../../../packages/highway-react/src/invariant/components/row.jsx'
import { Stack } from '../../../packages/highway-react/src/invariant/components/stack.jsx'
import { Surface } from '../../../packages/highway-react/src/invariant/components/surface.jsx'
import { SearchToggle } from '../../../packages/highway-react/src/invariant/components/search-toggle.jsx'
import { Skeleton } from '../../../packages/highway-react/src/invariant/components/skeleton.jsx'
import { EmptyState } from '../../../packages/highway-react/src/invariant/components/empty-state.jsx'
import { Button } from '../../../packages/highway-react/src/invariant/components/button.jsx'
export function Supplemental({id}) {
 const [active,setActive]=useExampleState("active", false),[message,setMessage]=useExampleState("message", '')
 const [skeletonVariant]=useExampleState("skeletonVariant", "card");
 const [position]=useExampleState("position", "top");
 const [padding]=useExampleState("padding", "md");
 const [elevation]=useExampleState("elevation", "sm");
 const tile = text => <Surface>{text}</Surface>
 const previews = {
  divider: <Stack>{tile('A little separation')}<Divider/>{tile('A clearer relationship')}</Stack>,
  menu: <Menu><MenuItem label="Open details" icon="search" onClick={()=>setMessage('Details selected')}/><MenuDivider/><MenuItem label="Duplicate example" icon="copy" onClick={()=>setMessage('Example duplicated locally')}/></Menu>,
  overlay: <><Button onClick={()=>setActive(true)} label="Show overlay"/>{active&&<><Overlay isOpen onClick={()=>setActive(false)}/><div className="relative z-50"><Button onClick={()=>setActive(false)} label="Close overlay"/></div></>}</>,
  spinner: <div role="status" aria-label="Loading example"><Spinner size={32}/><p>Loading example</p></div>,
  tooltip: <div className="relative" onMouseEnter={()=>setActive(true)} onMouseLeave={()=>setActive(false)} onFocus={()=>setActive(true)} onBlur={()=>setActive(false)}><Button label="Hover or focus me"/><Tooltip position={position} label="A useful little detail" visible={active}/></div>,
  'page-section': <PageSection><Surface><h2>A place for your work.</h2><p>Responsive side padding and a readable measure.</p></Surface></PageSection>,
  row: <Row wrap>{tile('One')}{tile('Two')}{tile('Three')}</Row>,
  stack: <Stack>{tile('First thought')}{tile('Next step')}{tile('A little breathing room')}</Stack>,
  surface: <Surface padding={padding} elevation={elevation}><h2>Quietly raised.</h2><p>Layered shadows, carefully balanced.</p></Surface>,
  'search-toggle': <SearchToggle onSearch={value=>setMessage('Search preview: '+value)}/>,
  skeleton: <div className="w-72"><Skeleton variant={skeletonVariant}/></div>,
  'empty-state': <EmptyState title="Room for something good." description="Create your first example to get started." action={<Button onClick={()=>setMessage("First example created locally")} label="Create example"/>}/>
 }
 return <div>{previews[id] || <p>Preview unavailable</p>}<output className="sr-only" aria-live="polite">{message}</output></div>
}
