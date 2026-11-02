import { useEffect, useRef } from 'react'
import { preserveInlineStyles } from './preserve-inline-styles.js'

const documents = new WeakMap()
function reconcile(state) {
  for (const [element, inert] of state.inert) element.inert = inert
  state.inert.clear()
  const panel = state.stack.at(-1)?.panel
  if (!panel) return
  let branch = panel
  while (branch.parentElement && branch !== panel.ownerDocument.body) {
    for (const sibling of branch.parentElement.children) {
      if (sibling !== branch && !sibling.hasAttribute('data-dialog-backdrop')) {
        state.inert.set(sibling, sibling.inert)
        sibling.inert = true
      }
    }
    branch = branch.parentElement
  }
}
/** Only the top dialog traps focus; shared scroll locking restores the original value. */
export function useDialogFocus(open, onClose) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!open || !ref.current) return
    const panel = ref.current, doc = panel.ownerDocument
    const previous = doc.activeElement
    let state = documents.get(doc)
    if (!state) {
      state = { stack: [], inert: new Map(), restoreScroll: preserveInlineStyles(doc.body, ['overflow']) }
      documents.set(doc, state)
      doc.body.style.setProperty('overflow', 'hidden')
    }
    const session = { panel }
    state.stack.push(session)
    reconcile(state)
    const top = () => state.stack.at(-1) === session
    const focusable = () => [...panel.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length && !el.closest('[inert]'))
    const focus = () => (focusable()[0] || panel).focus({ preventScroll: true })
    focus()
    const onFocus = e => { if (top() && !panel.contains(e.target)) focus() }
    const onKey = e => {
      if (!top()) return
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeRef.current?.(); return }
      if (e.key !== 'Tab') return
      const items = focusable(), first = items[0], last = items.at(-1)
      if (!first) { e.preventDefault(); panel.focus(); return }
      if (e.shiftKey && (doc.activeElement === first || doc.activeElement === panel)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus() }
    }
    doc.addEventListener('focusin', onFocus)
    panel.addEventListener('keydown', onKey)
    return () => {
      const wasTop = top()
      doc.removeEventListener('focusin', onFocus)
      panel.removeEventListener('keydown', onKey)
      state.stack = state.stack.filter(item => item !== session)
      reconcile(state)
      if (!state.stack.length) {
        state.restoreScroll()
        documents.delete(doc)
      }
      if (wasTop && previous?.isConnected && !previous.closest('[inert]')) previous.focus({ preventScroll: true })
    }
  }, [open])
  return ref
}
