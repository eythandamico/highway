import { menuItems, navigateMenu } from './menu-navigation.js'
import { useEffect, useId, useRef } from 'react'

/** Shared focus behavior for the three visually distinct menu shells. */
export function useMenu(open, setOpen) {
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const id = useId()
  const edge = useRef('first')
  const items = () => menuItems(menuRef.current)
  const trigger = () => triggerRef.current?.matches('button,[tabindex]') ? triggerRef.current : triggerRef.current?.querySelector('button,[tabindex]')
  const close = (restore = true) => { setOpen(false); if (restore) trigger()?.focus() }
  useEffect(() => {
    const button = trigger()
    if (button) { button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-haspopup', 'menu'); button.setAttribute('aria-controls', id) }
    if (!open) return
    const choices = items()
    ;(edge.current === 'last' ? choices.at(-1) : choices[0])?.focus()
    edge.current = 'first'
    const outside = e => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', outside) }
  }, [open, setOpen, id])
  const onTriggerKeyDown = e => {
    if (open && e.key === 'Escape') { e.preventDefault(); close(); return }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); edge.current = e.key === 'ArrowUp' ? 'last' : 'first'; setOpen(true)
    }
  }
  const onKeyDown = e => {
    const choices = items(), index = choices.indexOf(document.activeElement)
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return }
    // Return to the trigger before native Tab navigation so menu children are skipped.
    if (e.key === 'Tab') { close(); return }
    navigateMenu(e, choices, index)
  }
  return { rootRef, triggerRef, menuRef, id, close, onKeyDown, onTriggerKeyDown }
}
