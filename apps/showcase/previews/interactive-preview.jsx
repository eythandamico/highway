import { interactiveExamples } from './interactive-examples.jsx'
import { Supplemental } from './additional-examples.jsx'
import { ToastProvider } from '../../../packages/highway-react/src/components/toast.jsx'

export function CraftedPreview({ id, dark = false, onToggleTheme = () => {} }) {
  const Example = interactiveExamples[id]
  return <ToastProvider>{Example ? <Example darkMode={dark} toggleDarkMode={onToggleTheme}/> : <Supplemental id={id}/>}</ToastProvider>
}
