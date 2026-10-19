import { useState } from 'react'
import { Divider } from '../components/divider.jsx'
import { Menu, MenuItem, MenuDivider } from '../components/menu.jsx'
import { Overlay } from '../components/overlay.jsx'
import { Spinner } from '../components/spinner.jsx'
import { Tooltip } from '../components/tooltip.jsx'
import { PageSection } from '../components/page-section.jsx'
import { Row } from '../components/row.jsx'
import { Stack } from '../components/stack.jsx'
import { Surface } from '../components/surface.jsx'
import { SearchToggle } from '../components/search-toggle.jsx'
import { Skeleton } from '../components/skeleton.jsx'
import { EmptyState } from '../components/empty-state.jsx'
import { Button } from '../components/button.jsx'
export function Supplemental({id}) {
 const [active,setActive]=useState(false),[message,setMessage]=useState('')
 const tile = text => <Surface>{text}</Surface>
 const previews = {
  divider: <Stack>{tile('A little separation')}<Divider/>{tile('A clearer relationship')}</Stack>,
  menu: <Menu><MenuItem label="Open details" icon="search" onClick={()=>setMessage('Details selected')}/><MenuDivider/><MenuItem label="Duplicate example" icon="copy" onClick={()=>setMessage('Example duplicated locally')}/></Menu>,
  overlay: <><Button onClick={()=>setActive(true)} label="Show overlay"/>{active&&<><Overlay isOpen onClick={()=>setActive(false)}/><div className="relative z-50"><Button onClick={()=>setActive(false)} label="Close overlay"/></div></>}</>,
  spinner: <div role="status" aria-label="Loading example"><Spinner size={32}/><p>Loading example</p></div>,
  tooltip: <div className="relative" onMouseEnter={()=>setActive(true)} onMouseLeave={()=>setActive(false)} onFocus={()=>setActive(true)} onBlur={()=>setActive(false)}><Button label="Hover or focus me"/><Tooltip label="A useful little detail" visible={active}/></div>,
  'page-section': <PageSection><Surface><h2>A place for your work.</h2><p>Responsive side padding and a readable measure.</p></Surface></PageSection>,
  row: <Row wrap>{tile('One')}{tile('Two')}{tile('Three')}</Row>,
  stack: <Stack>{tile('First thought')}{tile('Next step')}{tile('A little breathing room')}</Stack>,
  surface: <Surface><h2>Quietly raised.</h2><p>Layered shadows, carefully balanced.</p></Surface>,
  'search-toggle': <SearchToggle onSearch={value=>setMessage('Search preview: '+value)}/>,
  skeleton: <div className="w-72"><Skeleton variant="card"/></div>,
  'empty-state': <EmptyState title="Room for something good." description="Create your first example to get started." action={<Button onClick={()=>setMessage("First example created locally")} label="Create example"/>}/>
 }
 return <div>{previews[id] || <p>Preview unavailable</p>}<output aria-live="polite">{message}</output></div>
}
