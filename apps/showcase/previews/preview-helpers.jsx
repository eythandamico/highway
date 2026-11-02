import { useExampleState } from "./example-state";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { previewFeedback } from './feedback.js';
import { useToast } from '../../../packages/highway-react/src/components/toast.jsx';
export const PROFILE = { name: 'Alex Morgan', email: 'alex@example.com' }
export const PROFILE_ITEMS = [
  { label: 'Settings', icon: 'settings', onAction: () => previewFeedback('Settings') },
  { label: 'Support', icon: 'message', onAction: () => previewFeedback('Support') },
  { label: 'Feedback', icon: 'mail', onAction: () => previewFeedback('Feedback') },
  { label: 'Log out', icon: 'logout', danger: true, onAction: () => previewFeedback('Logout') },
]
export function ComponentStage({ children }) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}
export const AVATAR_STATES = ['default', 'thinking', 'inactive']
export function ToastDemo() {
  const { addToast, promiseToast } = useToast()
  const [variant] = useExampleState("toastVariant", "success")
  return (
    <ComponentStage>
      <Button
        type="button"
        onClick={() => variant === 'loading'
          ? promiseToast(new Promise(resolve => setTimeout(resolve, 1400)), { loading: 'Saving changes…', success: 'Changes saved' })
          : addToast(({ success: 'Changes saved', info: 'New update available', warning: 'Check your storage', error: 'Could not save' })[variant], { variant, message: 'Your workspace is up to date.' })}
      >
        Show Toast
      </Button>
    </ComponentStage>
  )
}
