import { useEffect, useRef } from 'react'

/** Focus containment and restoration without changing the original visual shell. */
export function useDialogFocus(open, onClose) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!open || !ref.current) return
    const panel = ref.current
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const siblings = []
    let branch = panel
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && !sibling.contains(panel) && !sibling.hasAttribute("data-dialog-backdrop")) {
          siblings.push([sibling, sibling.inert])
          sibling.inert = true
        }
      }
      branch = branch.parentElement
    }
    const focusable = () => [...panel.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length && !el.closest('[inert]'))
    const focus = () => (focusable()[0] || panel).focus({ preventScroll: true })
    focus()
    const onFocus = e => { if (!panel.contains(e.target)) focus() }
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeRef.current?.(); return }
      if (e.key !== 'Tab') return
      const items = focusable(), first = items[0], last = items.at(-1)
      if (!first) { e.preventDefault(); panel.focus(); return }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('focusin', onFocus)
    panel.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('focusin', onFocus)
      panel.removeEventListener('keydown', onKey)
      for (const [element, inert] of siblings) element.inert = inert
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [open])
  return ref
}
