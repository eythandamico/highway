import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useScreens } from './screens.jsx'
import { ToastProvider } from '../components/toast.jsx'
import { Supplemental } from './supplemental.jsx'
import './styles.css'
const params = new URLSearchParams(location.search)
const id = params.get('component') || 'segmented-tabs'
document.documentElement.dataset.theme = params.get('theme') === 'dark' ? 'dark' : 'light'
function Preview() {
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark')
  const [feedback, setFeedback] = useState('')
  const screens = useScreens(dark, () => setDark(v => !v))
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])
  useEffect(() => {
    const show = e => setFeedback(e.detail)
    window.addEventListener('invariant-feedback', show)
    return () => window.removeEventListener('invariant-feedback', show)
  }, [])
  const screen = screens.find(s => s.id === id)
  return <ToastProvider><main className="inv-preview" aria-label="Interactive component preview">
    {screen ? screen.render() : <Supplemental id={id}/>}
    <output className="inv-preview-feedback" aria-live="polite">{feedback}</output>
  </main></ToastProvider>
}
createRoot(document.getElementById('root')).render(<Preview/>);
